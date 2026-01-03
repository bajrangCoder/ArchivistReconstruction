export type BlockColor = string;

export interface Shape {
  id: string;
  layout: number[][];
  color: BlockColor;
  symbol: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface FeedbackText {
  id: string;
  text: string;
  x: number;
  y: number;
  life: number;
}
