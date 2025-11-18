import type { LineupData, LineupConfig, SubstitutesConfig, CustomCoordinatesMap } from '../types.js';
export declare function renderFullPitch(ctx: CanvasRenderingContext2D, lineupData: LineupData, config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'onRecordingStateChange'>> & {
    showSubstitutes: SubstitutesConfig;
    interactive?: boolean;
    onPlayerMove?: (playerId: number, team: any, x: number, y: number) => void;
    recording?: boolean;
    recordingOptions?: any;
    onRecordingStateChange?: any;
}, customCoordinates?: CustomCoordinatesMap): any[];
