import type { LineupData, LineupConfig, SubstitutesConfig, CustomCoordinatesMap, Team, BallConfig, RecordingOptions, PlayerPositioning, FieldCoordinates, RecordingUIConfig } from '../types.js';
import type { RecordingState } from '../recordingController.js';
interface PlayerWithCoordinates {
    player: PlayerPositioning;
    coordinates: FieldCoordinates;
    isHomeTeam: boolean;
}
export declare function renderSplitPitch(ctx: CanvasRenderingContext2D, lineupData: LineupData, config: Required<Omit<LineupConfig, 'showSubstitutes' | 'interactive' | 'onPlayerMove' | 'recording' | 'recordingOptions' | 'recordingUI' | 'onRecordingStateChange' | 'ball' | 'onBallMove'>> & {
    showSubstitutes: SubstitutesConfig;
    interactive?: boolean;
    onPlayerMove?: (playerId: number, team: Team, x: number, y: number) => void;
    recording?: boolean;
    recordingOptions?: RecordingOptions;
    recordingUI?: boolean | RecordingUIConfig;
    onRecordingStateChange?: (state: RecordingState) => void;
    ball?: BallConfig;
    onBallMove?: (x: number, y: number) => void;
}, customCoordinates?: CustomCoordinatesMap): PlayerWithCoordinates[];
export {};
