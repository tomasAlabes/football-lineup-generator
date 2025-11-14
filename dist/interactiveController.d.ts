import type { LineupData, LineupConfig, PlayerPositioning, FieldCoordinates, Team, CustomCoordinatesMap } from './types.js';
interface PlayerWithCoordinates {
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
    isHomeTeam: boolean;
}
export declare class InteractiveController {
    private canvas;
    private lineupData;
    private playerCoordinates;
    private customCoordinates;
    private dragState;
    private config;
    private renderCallback;
    private isDragging;
    private canvasTranslateX;
    private canvasTranslateY;
    constructor(canvas: HTMLCanvasElement, config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove'>> & {
        interactive: boolean;
        onPlayerMove?: (playerId: number, team: Team, x: number, y: number) => void;
    }, renderCallback: () => void, translateX?: number, translateY?: number);
    private attachEventListeners;
    detachEventListeners(): void;
    updatePlayerCoordinates(coordinates: PlayerWithCoordinates[]): void;
    updateLineupData(lineupData: LineupData): void;
    getCustomCoordinates(): CustomCoordinatesMap;
    setCustomCoordinate(playerId: number, team: Team, coordinates: FieldCoordinates): void;
    clearCustomCoordinates(): void;
    private getCanvasCoordinates;
    private findPlayerAtPosition;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
}
export {};
