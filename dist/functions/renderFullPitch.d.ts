import type { LineupData, LineupConfig, SubstitutesConfig } from '../types.js';
export declare function renderFullPitch(ctx: CanvasRenderingContext2D, lineupData: LineupData, config: Required<Omit<LineupConfig, 'showSubstitutes'>> & {
    showSubstitutes: SubstitutesConfig;
}): void;
