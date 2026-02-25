import type { LineupData, LineupConfig, CustomCoordinatesMap, FieldCoordinates, PlayerWithCoordinates } from './types.js';
import { type RecordingState } from './recordingController.js';
export declare class FootballLineupRenderer {
    private canvas;
    private ctx;
    private config;
    private interactiveController;
    private recordingController;
    private recordingUI;
    private lineupData;
    constructor(canvas: HTMLCanvasElement, config?: LineupConfig);
    render(lineupData: LineupData): void;
    destroy(): void;
    getCustomCoordinates(): CustomCoordinatesMap | undefined;
    setCustomCoordinate(playerId: number, team: any, x: number, y: number): void;
    clearCustomCoordinates(): void;
    getAllPlayerPositions(): PlayerWithCoordinates[];
    getBallPosition(): FieldCoordinates | null;
    setBallPosition(x: number, y: number): void;
    startRecording(): void;
    pauseRecording(): void;
    resumeRecording(): void;
    stopRecording(): void;
    downloadRecording(filename?: string): void;
    getRecordingBlob(): Blob | null;
    getRecordingState(): RecordingState | null;
    clearRecording(): void;
}
