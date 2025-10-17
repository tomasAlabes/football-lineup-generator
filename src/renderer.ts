import type { LineupData, LineupConfig } from './types.js';
import { LayoutType } from './types.js';

// Import all the extracted functions
import { renderFullPitch } from './functions/renderFullPitch.js';
import { renderHalfPitch } from './functions/renderHalfPitch.js';
import { renderSplitPitch } from './functions/renderSplitPitch.js';

export class FootballLineupRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<LineupConfig>;

  constructor(canvas: HTMLCanvasElement, config: LineupConfig = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    // Default configuration with smaller player circles
    this.config = {
      width: config.width ?? 800,
      height: config.height ?? 600,
      layoutType: config.layoutType ?? LayoutType.FULL_PITCH,
      showPlayerNames: config.showPlayerNames ?? true,
      showJerseyNumbers: config.showJerseyNumbers ?? true,
      showSubstitutes: config.showSubstitutes ?? false,
      fieldColor: config.fieldColor ?? '#4CAF50',
      lineColor: config.lineColor ?? '#FFFFFF',
      homeTeamColor: config.homeTeamColor ?? '#FF5722',
      awayTeamColor: config.awayTeamColor ?? '#2196F3',
      fontSize: config.fontSize ?? 12,
      playerCircleSize: config.playerCircleSize ?? 16, // Reduced from 20 to 16
    };

    // Adjust canvas size for split pitch layout
    if (this.config.layoutType === LayoutType.SPLIT_PITCH) {
      // For rotated split pitch: arrange side by side with rotated dimensions
      this.canvas.width = this.config.height * 2 + 60; // Two rotated pitches side by side
      this.canvas.height = this.config.width; // Rotated height becomes original width
    } else {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;

      // Add extra height for substitutes if enabled
      if (this.config.showSubstitutes) {
        this.canvas.height += 120; // Add space for substitute lists (60px per team)
      }
    }
  }

  public render(lineupData: LineupData): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.config.layoutType) {
      case LayoutType.FULL_PITCH:
        renderFullPitch(this.ctx, lineupData, this.config);
        break;
      case LayoutType.HALF_PITCH:
        renderHalfPitch(this.ctx, lineupData, this.config);
        break;
      case LayoutType.SPLIT_PITCH:
        renderSplitPitch(this.ctx, lineupData, this.config);
        break;
    }
  }
} 