import type { LineupData, LineupConfig } from './types.js';
export declare class FootballLineupRenderer {
    private canvas;
    private ctx;
    private config;
    constructor(canvas: HTMLCanvasElement, config?: LineupConfig);
    render(lineupData: LineupData): void;
}
