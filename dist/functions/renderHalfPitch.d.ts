import type { LineupData, LineupConfig, SubstitutesConfig } from '../types.js';
export declare function renderHalfPitch(ctx: CanvasRenderingContext2D, lineupData: LineupData, config: Required<Omit<LineupConfig, 'showSubstitutes'>> & {
    showSubstitutes: SubstitutesConfig;
}): void;
