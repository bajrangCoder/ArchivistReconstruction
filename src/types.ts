export type BlockColor = string;

export interface GridCell {
  color: BlockColor;
  symbol: string;
}

export interface Shape {
  id: string;
  layout: number[][];
  color: BlockColor;
  symbol: string;
}

export type ParticleType = 'ink' | 'sparkle' | 'ember' | 'swirl' | 'trail' | 'burst';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: ParticleType;
  rotation?: number;
  rotationSpeed?: number;
  trail?: { x: number; y: number }[];
  gravity?: number;
  friction?: number;
  startLife?: number;
  delay?: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface FeedbackText {
  id: string;
  text: string;
  x: number;
  y: number;
  life: number;
  startTime: number;
  duration: number;
}
