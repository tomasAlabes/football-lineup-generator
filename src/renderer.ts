import type { LineupData, LineupConfig, SubstitutesConfig, CustomCoordinatesMap, BallConfig, PlayerPositioning, FieldCoordinates, RecordingOptions, Team, RecordingUIConfig, PlayerWithCoordinates } from './types.js';
import { LayoutType, SubstitutesPosition } from './types.js';

// Import all the extracted functions
import { renderFullPitch } from './functions/renderFullPitch.js';
import { renderHalfPitch } from './functions/renderHalfPitch.js';
import { renderSplitPitch } from './functions/renderSplitPitch.js';
import { drawBall } from './functions/drawBall.js';

// Import interactive controller
import { InteractiveController } from './interactiveController.js';

// Import recording controller
import { RecordingController, type RecordingState } from './recordingController.js';

// Import recording UI
import { RecordingUI } from './recordingUI.js';

export class FootballLineupRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'recordingUI' | 'onRecordingStateChange' | 'ball' | 'onBallMove'>> & {
    showSubstitutes: SubstitutesConfig;
    interactive: boolean;
    onPlayerMove?: (playerId: number, team: Team, x: number, y: number) => void;
    recording: boolean;
    recordingOptions?: RecordingOptions;
    recordingUI?: boolean | RecordingUIConfig;
    onRecordingStateChange?: (state: RecordingState) => void;
    ball: BallConfig;
    onBallMove?: (x: number, y: number) => void;
  };
  private interactiveController: InteractiveController | null = null;
  private recordingController: RecordingController | null = null;
  private recordingUI: RecordingUI | null = null;
  private lineupData: LineupData | null = null;

  constructor(canvas: HTMLCanvasElement, config: LineupConfig = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    // Normalize showSubstitutes config
    let substitutesConfig: SubstitutesConfig;
    if (typeof config.showSubstitutes === 'boolean') {
      substitutesConfig = {
        enabled: config.showSubstitutes,
        position: SubstitutesPosition.BOTTOM,
      };
    } else if (config.showSubstitutes) {
      substitutesConfig = config.showSubstitutes;
    } else {
      substitutesConfig = {
        enabled: false,
        position: SubstitutesPosition.BOTTOM,
      };
    }

    // Normalize ball config
    let ballConfig: BallConfig;
    if (typeof config.ball === 'boolean') {
      ballConfig = {
        enabled: config.ball,
        color: '#FFFFFF',
        size: 10,
      };
    } else if (config.ball) {
      ballConfig = {
        enabled: true,
        color: config.ball.color ?? '#FFFFFF',
        size: config.ball.size ?? 10,
        initialX: config.ball.initialX,
        initialY: config.ball.initialY,
      };
    } else {
      ballConfig = {
        enabled: false,
        color: '#FFFFFF',
        size: 10,
      };
    }

    // Default configuration with smaller player circles
    this.config = {
      width: config.width ?? 800,
      height: config.height ?? 600,
      layoutType: config.layoutType ?? LayoutType.FULL_PITCH,
      showPlayerNames: config.showPlayerNames ?? true,
      showJerseyNumbers: config.showJerseyNumbers ?? true,
      showSubstitutes: substitutesConfig,
      fieldColor: config.fieldColor ?? '#4CAF50',
      lineColor: config.lineColor ?? '#FFFFFF',
      homeTeamColor: config.homeTeamColor ?? '#FF5722',
      awayTeamColor: config.awayTeamColor ?? '#2196F3',
      fontSize: config.fontSize ?? 12,
      playerCircleSize: config.playerCircleSize ?? 16, // Reduced from 20 to 16
      interactive: config.interactive ?? false,
      onPlayerMove: config.onPlayerMove,
      recording: config.recording ?? false,
      recordingOptions: config.recordingOptions,
      recordingUI: config.recordingUI,
      onRecordingStateChange: config.onRecordingStateChange,
      ball: ballConfig,
      onBallMove: config.onBallMove,
    };

    // Adjust canvas size for split pitch layout
    if (this.config.layoutType === LayoutType.SPLIT_PITCH) {
      // For rotated split pitch: arrange side by side with rotated dimensions
      this.canvas.width = this.config.height * 2 + 60; // Two rotated pitches side by side
      this.canvas.height = this.config.width; // Rotated height becomes original width
    } else {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;

      // Add extra space for substitutes if enabled
      if (this.config.showSubstitutes.enabled) {
        if (this.config.showSubstitutes.position === SubstitutesPosition.BOTTOM) {
          this.canvas.height += 120; // Add space for substitute lists (60px per team)
        } else if (this.config.showSubstitutes.position === SubstitutesPosition.LEFT) {
          this.canvas.width += 180; // Add space on the left
          // Shift the entire canvas context to the right to make room for left substitutes
          this.ctx.translate(180, 0);
        } else if (this.config.showSubstitutes.position === SubstitutesPosition.RIGHT) {
          this.canvas.width += 180; // Add space on the right
        }
      }
    }

    // Initialize interactive controller if interactive mode is enabled
    if (this.config.interactive) {
      // Calculate translation offset for substitutes on the left
      let translateX = 0;
      let translateY = 0;

      if (this.config.layoutType !== LayoutType.SPLIT_PITCH &&
          this.config.showSubstitutes.enabled &&
          this.config.showSubstitutes.position === SubstitutesPosition.LEFT) {
        translateX = 180;
      }

      this.interactiveController = new InteractiveController(
        this.canvas,
        this.config,
        () => this.render(this.lineupData!),
        translateX,
        translateY
      );
    }

    // Initialize recording controller if recording mode is enabled
    if (this.config.recording) {
      // Determine if UI should be enabled
      const uiEnabled = config.recordingUI !== false; // Enabled by default unless explicitly set to false

      // Create combined onRecordingStateChange callback
      const stateChangeCallback = (state: RecordingState) => {
        // Update recording UI if it exists
        if (this.recordingUI) {
          this.recordingUI.updateState(state);
        }
        // Call user's callback if provided
        if (this.config.onRecordingStateChange) {
          this.config.onRecordingStateChange(state);
        }
      };

      this.recordingController = new RecordingController(
        this.canvas,
        this.config.recordingOptions,
        stateChangeCallback
      );

      // Initialize recording UI if enabled
      if (uiEnabled) {
        const uiConfig = typeof config.recordingUI === 'object' ? config.recordingUI : {};
        this.recordingUI = new RecordingUI(this.canvas, uiConfig);

        // Set up UI callbacks
        this.recordingUI.setCallbacks({
          onStart: () => this.startRecording(),
          onPause: () => this.pauseRecording(),
          onResume: () => this.resumeRecording(),
          onStop: () => this.stopRecording(),
          onDownload: () => this.downloadRecording()
        });
      }
    }
  }

  public render(lineupData: LineupData): void {
    // Store lineup data for re-rendering
    this.lineupData = lineupData;

    // Clear canvas - need to account for any translation
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // Get custom coordinates if in interactive mode
    const customCoordinates = this.interactiveController?.getCustomCoordinates();

    let playerCoordinates: PlayerWithCoordinates[] = [];

    switch (this.config.layoutType) {
      case LayoutType.FULL_PITCH:
        playerCoordinates = renderFullPitch(this.ctx, lineupData, this.config, customCoordinates);
        break;
      case LayoutType.HALF_PITCH:
        playerCoordinates = renderHalfPitch(this.ctx, lineupData, this.config, customCoordinates);
        break;
      case LayoutType.SPLIT_PITCH:
        playerCoordinates = renderSplitPitch(this.ctx, lineupData, this.config, customCoordinates);
        break;
    }

    // Draw ball if enabled
    if (this.config.ball.enabled) {
      const ballPosition = this.interactiveController?.getBallPosition();
      if (ballPosition) {
        drawBall(
          this.ctx,
          ballPosition.x,
          ballPosition.y,
          this.config.ball.size,
          this.config.ball.color
        );
      }
    }

    // Update interactive controller with player coordinates
    if (this.interactiveController) {
      this.interactiveController.updatePlayerCoordinates(playerCoordinates);
      this.interactiveController.updateLineupData(lineupData);
    }
  }

  public destroy(): void {
    if (this.interactiveController) {
      this.interactiveController.detachEventListeners();
    }
    if (this.recordingController) {
      this.recordingController.destroy();
    }
    if (this.recordingUI) {
      this.recordingUI.destroy();
    }
  }

  // Interactive mode methods
  public getCustomCoordinates(): CustomCoordinatesMap | undefined {
    return this.interactiveController?.getCustomCoordinates();
  }

  public setCustomCoordinate(playerId: number, team: any, x: number, y: number): void {
    if (this.interactiveController) {
      this.interactiveController.setCustomCoordinate(playerId, team, { x, y });
      if (this.lineupData) {
        this.render(this.lineupData);
      }
    }
  }

  public clearCustomCoordinates(): void {
    if (this.interactiveController) {
      this.interactiveController.clearCustomCoordinates();
      if (this.lineupData) {
        this.render(this.lineupData);
      }
    }
  }

  public getAllPlayerPositions(): PlayerWithCoordinates[] {
    return this.interactiveController?.getAllPlayerPositions() ?? [];
  }

  public getBallPosition(): FieldCoordinates | null {
    return this.interactiveController?.getBallPosition() ?? null;
  }

  public setBallPosition(x: number, y: number): void {
    if (this.interactiveController) {
      this.interactiveController.setBallPosition({ x, y });
      if (this.lineupData) {
        this.render(this.lineupData);
      }
    }
  }

  // Recording mode methods
  public startRecording(): void {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled. Enable it by setting recording: true in config.');
      return;
    }
    this.recordingController.startRecording();
  }

  public pauseRecording(): void {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled.');
      return;
    }
    this.recordingController.pauseRecording();
  }

  public resumeRecording(): void {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled.');
      return;
    }
    this.recordingController.resumeRecording();
  }

  public stopRecording(): void {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled.');
      return;
    }
    this.recordingController.stopRecording();
  }

  public downloadRecording(filename?: string): void {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled.');
      return;
    }
    this.recordingController.downloadRecording(filename);
  }

  public getRecordingBlob(): Blob | null {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled.');
      return null;
    }
    return this.recordingController.getRecordingBlob();
  }

  public getRecordingState(): RecordingState | null {
    if (!this.recordingController) {
      return null;
    }
    return this.recordingController.getState();
  }

  public clearRecording(): void {
    if (!this.recordingController) {
      console.warn('Recording mode is not enabled.');
      return;
    }
    this.recordingController.clearRecording();
  }
} 