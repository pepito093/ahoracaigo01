export enum GameState {
  START_MENU = 'START_MENU',
  PICKING_OPPONENT = 'PICKING_OPPONENT',
  DUEL_INTRO = 'DUEL_INTRO',
  QUESTION_ACTIVE = 'QUESTION_ACTIVE',
  OPPONENT_FALLING = 'OPPONENT_FALLING',
  PLAYER_FALLING = 'PLAYER_FALLING',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER',
}

export interface Question {
  text: string;
  answer: string;
  displayHint: string; // e.g. "H_ST_R_A"
  category: string;
}

export interface NPC {
  id: string;
  name: string;
  difficulty: number; // 1-10
  isEliminated: boolean;
  avatarSeed: string;
}

export interface GameStatus {
  score: number;
  currentLevel: number;
  lives: number;
  remainingOpponents: number;
  wildcards: number;
}
