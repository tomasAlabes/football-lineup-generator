import type { LineupData, LineupConfig, CustomCoordinatesMap } from './types.js';
export declare class FootballLineupRenderer {
    private canvas;
    private ctx;
    private config;
    private interactiveController;
    private lineupData;
    constructor(canvas: HTMLCanvasElement, config?: LineupConfig);
    render(lineupData: LineupData): void;
    destroy(): void;
    getCustomCoordinates(): CustomCoordinatesMap | undefined;
    setCustomCoordinate(playerId: number, team: any, x: number, y: number): void;
    clearCustomCoordinates(): void;
}
