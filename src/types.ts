export enum Team {
  RED = "red",
  YELLOW = "yellow",
}

export enum Position {
  GOALKEEPER = "goalkeeper",
  CENTER_BACK = "center_back",
  LEFT_BACK = "left_back",
  RIGHT_BACK = "right_back",
  DEFENSIVE_MIDFIELDER = "defensive_midfielder",
  CENTER_MIDFIELDER = "center_midfielder",
  ATTACKING_MIDFIELDER = "attacking_midfielder",
  LEFT_MIDFIELDER = "left_midfielder",
  RIGHT_MIDFIELDER = "right_midfielder",
  LEFT_WINGER = "left_winger",
  RIGHT_WINGER = "right_winger",
  CENTER_FORWARD = "center_forward",
  LEFT_FORWARD = "left_forward",
  RIGHT_FORWARD = "right_forward",
  SUBSTITUTE = "substitute",
}

export enum LayoutType {
  FULL_PITCH = "full_pitch",           // Both teams positioned all over the pitch
  HALF_PITCH = "half_pitch",           // Each team stays in their half
  SPLIT_PITCH = "split_pitch",         // Two separate pitches side by side
}

export enum SubstitutesPosition {
  LEFT = "left",
  BOTTOM = "bottom",
  RIGHT = "right",
}

export interface Player {
  id: number;
  name: string;
  jerseyNumber?: number;
}

export interface PlayerPositioning {
  player: Player;
  team: Team;
  position: Position;
}

export interface LineupData {
  matchId?: number;
  homeTeam: {
    name: string;
    color?: string;
    players: PlayerPositioning[];
  };
  awayTeam: {
    name: string;
    color?: string;
    players: PlayerPositioning[];
  };
}

export interface SubstitutesConfig {
  enabled: boolean;
  position: SubstitutesPosition;
}

export interface LineupConfig {
  width?: number;
  height?: number;
  layoutType?: LayoutType;
  showPlayerNames?: boolean;
  showJerseyNumbers?: boolean;
  showSubstitutes?: boolean | SubstitutesConfig;
  fieldColor?: string;
  lineColor?: string;
  homeTeamColor?: string;
  awayTeamColor?: string;
  fontSize?: number;
  playerCircleSize?: number;
}

export interface FieldCoordinates {
  x: number;
  y: number;
}

export type PositionCoordinates = {
  [key in Position]: FieldCoordinates;
}; 