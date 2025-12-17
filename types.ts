export interface Vector {
  x: number;
  y: number;
}

export interface Roach {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  wiggleOffset: number;
  speedMultiplier: number;
  color: string;
}

export type InteractionType = 'none' | 'attract' | 'repel';

export interface SimulationConfig {
  count: number;
  minSize: number;
  maxSize: number;
  interactionType: InteractionType;
  cohesion: number;
  alignment: number;
  separation: number;
  speed: number;
}