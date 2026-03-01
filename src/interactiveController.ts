import type {
  LineupData,
  LineupConfig,
  PlayerPositioning,
  FieldCoordinates,
  Team,
  CustomCoordinatesMap,
  BallConfig,
  RecordingOptions,
  RecordingUIConfig,
  PlayerWithCoordinates
} from './types.js';
import { Position } from './types.js';

interface DragState {
  player: PlayerPositioning;
  isHomeTeam: boolean;
  offsetX: number;
  offsetY: number;
}

interface BallDragState {
  isBall: true;
  offsetX: number;
  offsetY: number;
}

export class InteractiveController {
  private canvas: HTMLCanvasElement;
  private lineupData: LineupData | null = null;
  private playerCoordinates: PlayerWithCoordinates[] = [];
  private customCoordinates: CustomCoordinatesMap = new Map();
  private dragState: DragState | null = null;
  private ballDragState: BallDragState | null = null;
  private ballPosition: FieldCoordinates | null = null;
  private config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'recordingUI' | 'onRecordingStateChange' | 'ball' | 'onBallMove'>> & {
    interactive: boolean;
    onPlayerMove?: (playerId: number, team: Team, x: number, y: number) => void;
    recording?: boolean;
    recordingOptions?: RecordingOptions;
    recordingUI?: boolean | RecordingUIConfig;
    onRecordingStateChange?: (state: 'idle' | 'recording' | 'paused' | 'stopped') => void;
    ball?: boolean | BallConfig;
    onBallMove?: (x: number, y: number) => void;
  };
  private renderCallback: () => void;
  private isDragging = false;
  private canvasTranslateX: number = 0;
  private canvasTranslateY: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'recordingUI' | 'onRecordingStateChange' | 'ball' | 'onBallMove'>> & {
      interactive: boolean;
      onPlayerMove?: (playerId: number, team: Team, x: number, y: number) => void;
      recording?: boolean;
      recordingOptions?: RecordingOptions;
      recordingUI?: boolean | RecordingUIConfig;
      onRecordingStateChange?: (state: 'idle' | 'recording' | 'paused' | 'stopped') => void;
      ball?: boolean | BallConfig;
      onBallMove?: (x: number, y: number) => void;
    },
    renderCallback: () => void,
    translateX: number = 0,
    translateY: number = 0
  ) {
    this.canvas = canvas;
    this.config = config;
    this.renderCallback = renderCallback;
    this.canvasTranslateX = translateX;
    this.canvasTranslateY = translateY;

    if (this.config.interactive) {
      this.attachEventListeners();
    }

    // Initialize ball position if ball is enabled
    if (this.config.ball) {
      const ballConfig: BallConfig = typeof this.config.ball === 'boolean'
        ? { enabled: this.config.ball }
        : this.config.ball;
      if (ballConfig.enabled) {
        this.ballPosition = {
          x: ballConfig.initialX ?? this.config.width / 2,
          y: ballConfig.initialY ?? this.config.height / 2
        };
      }
    }
  }

  private attachEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseUp);

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd);

    // Change cursor when hovering over players
    this.canvas.style.cursor = 'default';
  }

  public detachEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);

    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
  }

  public updatePlayerCoordinates(coordinates: PlayerWithCoordinates[]): void {
    this.playerCoordinates = coordinates;
  }

  public updateLineupData(lineupData: LineupData): void {
    this.lineupData = lineupData;
  }

  public getAllPlayerPositions(): PlayerWithCoordinates[] {
    return this.playerCoordinates;
  }

  public getCustomCoordinates(): CustomCoordinatesMap {
    return this.customCoordinates;
  }

  public setCustomCoordinate(playerId: number, team: Team, coordinates: FieldCoordinates): void {
    const key = `${team}-${playerId}`;
    this.customCoordinates.set(key, coordinates);
  }

  public clearCustomCoordinates(): void {
    this.customCoordinates.clear();
  }

  public getBallPosition(): FieldCoordinates | null {
    return this.ballPosition;
  }

  public setBallPosition(coordinates: FieldCoordinates | null): void {
    this.ballPosition = coordinates;
  }

  private getCanvasCoordinates(clientX: number, clientY: number): FieldCoordinates {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX - this.canvasTranslateX,
      y: (clientY - rect.top) * scaleY - this.canvasTranslateY,
    };
  }

  private findPlayerAtPosition(x: number, y: number): PlayerWithCoordinates | null {
    const radius = this.config.playerCircleSize;

    // Check in reverse order so that players drawn on top are selected first
    for (let i = this.playerCoordinates.length - 1; i >= 0; i--) {
      const playerData = this.playerCoordinates[i];

      // Skip substitutes
      if (playerData.player.position === Position.SUBSTITUTE) {
        continue;
      }

      const dx = x - playerData.coordinates.x;
      const dy = y - playerData.coordinates.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        return playerData;
      }
    }

    return null;
  }

  private isBallAtPosition(x: number, y: number): boolean {
    if (!this.config.ball || !this.ballPosition) {
      return false;
    }

    const ballConfig: BallConfig = typeof this.config.ball === 'boolean'
      ? { enabled: this.config.ball }
      : this.config.ball;

    if (!ballConfig.enabled) {
      return false;
    }

    const ballSize = ballConfig.size ?? 10;

    const dx = x - this.ballPosition.x;
    const dy = y - this.ballPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= ballSize;
  }

  private handleMouseDown = (event: MouseEvent): void => {
    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);

    // Check for ball first (ball has priority over players)
    if (this.isBallAtPosition(coords.x, coords.y) && this.ballPosition) {
      this.ballDragState = {
        isBall: true,
        offsetX: coords.x - this.ballPosition.x,
        offsetY: coords.y - this.ballPosition.y,
      };
      this.isDragging = true;
      this.canvas.style.cursor = 'grabbing';
      event.preventDefault();
      return;
    }

    // Check for players
    const player = this.findPlayerAtPosition(coords.x, coords.y);
    if (player) {
      this.dragState = {
        player: player.player,
        isHomeTeam: player.isHomeTeam,
        offsetX: coords.x - player.coordinates.x,
        offsetY: coords.y - player.coordinates.y,
      };
      this.isDragging = true;
      this.canvas.style.cursor = 'grabbing';
      event.preventDefault();
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);

    if (this.isDragging && this.ballDragState) {
      // Dragging the ball
      const newX = coords.x - this.ballDragState.offsetX;
      const newY = coords.y - this.ballDragState.offsetY;

      this.ballPosition = { x: newX, y: newY };

      // Trigger re-render
      this.renderCallback();

      event.preventDefault();
    } else if (this.isDragging && this.dragState) {
      // Dragging a player
      const newX = coords.x - this.dragState.offsetX;
      const newY = coords.y - this.dragState.offsetY;

      const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
      this.customCoordinates.set(key, { x: newX, y: newY });

      // Trigger re-render
      this.renderCallback();

      event.preventDefault();
    } else {
      // Update cursor based on whether we're hovering over a player or ball
      const isBall = this.isBallAtPosition(coords.x, coords.y);
      const player = this.findPlayerAtPosition(coords.x, coords.y);
      this.canvas.style.cursor = (isBall || player) ? 'grab' : 'default';
    }
  };

  private handleMouseUp = (event: MouseEvent): void => {
    if (this.isDragging && this.ballDragState) {
      // Ball drag ended
      const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
      const newX = coords.x - this.ballDragState.offsetX;
      const newY = coords.y - this.ballDragState.offsetY;

      // Call the onBallMove callback if provided
      if (this.config.onBallMove) {
        this.config.onBallMove(newX, newY);
      }

      this.isDragging = false;
      this.ballDragState = null;

      // Update cursor
      const isBall = this.isBallAtPosition(coords.x, coords.y);
      const player = this.findPlayerAtPosition(coords.x, coords.y);
      this.canvas.style.cursor = (isBall || player) ? 'grab' : 'default';
    } else if (this.isDragging && this.dragState) {
      // Player drag ended
      const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
      const newX = coords.x - this.dragState.offsetX;
      const newY = coords.y - this.dragState.offsetY;

      // Call the onPlayerMove callback if provided
      if (this.config.onPlayerMove) {
        this.config.onPlayerMove(
          this.dragState.player.player.id,
          this.dragState.player.team,
          newX,
          newY
        );
      }

      this.isDragging = false;
      this.dragState = null;

      // Update cursor
      const isBall = this.isBallAtPosition(coords.x, coords.y);
      const player = this.findPlayerAtPosition(coords.x, coords.y);
      this.canvas.style.cursor = (isBall || player) ? 'grab' : 'default';
    }
  };

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);

      // Check for ball first
      if (this.isBallAtPosition(coords.x, coords.y) && this.ballPosition) {
        this.ballDragState = {
          isBall: true,
          offsetX: coords.x - this.ballPosition.x,
          offsetY: coords.y - this.ballPosition.y,
        };
        this.isDragging = true;
        event.preventDefault();
        return;
      }

      // Check for players
      const player = this.findPlayerAtPosition(coords.x, coords.y);
      if (player) {
        this.dragState = {
          player: player.player,
          isHomeTeam: player.isHomeTeam,
          offsetX: coords.x - player.coordinates.x,
          offsetY: coords.y - player.coordinates.y,
        };
        this.isDragging = true;
        event.preventDefault();
      }
    }
  };

  private handleTouchMove = (event: TouchEvent): void => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);

    if (this.isDragging && this.ballDragState) {
      // Dragging the ball
      const newX = coords.x - this.ballDragState.offsetX;
      const newY = coords.y - this.ballDragState.offsetY;

      this.ballPosition = { x: newX, y: newY };

      // Trigger re-render
      this.renderCallback();

      event.preventDefault();
    } else if (this.isDragging && this.dragState) {
      // Dragging a player
      const newX = coords.x - this.dragState.offsetX;
      const newY = coords.y - this.dragState.offsetY;

      const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
      this.customCoordinates.set(key, { x: newX, y: newY });

      // Trigger re-render
      this.renderCallback();

      event.preventDefault();
    }
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    if (this.isDragging && this.ballDragState) {
      // Ball drag ended
      if (this.ballPosition && this.config.onBallMove) {
        this.config.onBallMove(this.ballPosition.x, this.ballPosition.y);
      }

      this.isDragging = false;
      this.ballDragState = null;
    } else if (this.isDragging && this.dragState) {
      // Player drag ended - use the last known position from customCoordinates
      const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
      const coords = this.customCoordinates.get(key);

      if (coords && this.config.onPlayerMove) {
        this.config.onPlayerMove(
          this.dragState.player.player.id,
          this.dragState.player.team,
          coords.x,
          coords.y
        );
      }

      this.isDragging = false;
      this.dragState = null;
    }
  };
}
