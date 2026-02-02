export type EnergyLevel = 'low' | 'medium' | 'high';
export type BodyState = 'tight' | 'ok' | 'sore';
export type MentalState = 'stressed' | 'neutral' | 'calm';

export type SessionType = 'reset' | 'flow' | 'build';

export interface CheckInState {
  energy: EnergyLevel | null;
  body: BodyState | null;
  mind: MentalState | null;
}

export interface Movement {
  id: string;
  name: string;
  duration: number;
  instruction: string;
  breathCue?: string;
  image?: string;
}

export interface Session {
  id: string;
  type: SessionType;
  name: string;
  duration: number;
  movements: Movement[];
  suitableFor: {
    energy: EnergyLevel[];
    body: BodyState[];
    mind: MentalState[];
  };
}
