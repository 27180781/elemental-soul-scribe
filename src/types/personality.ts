export type Element = 'fire' | 'water' | 'air' | 'earth';

export interface ElementMapping {
  questionId: number;
  answers: {
    [key: number]: Element; // answer number (1-4) to element
  };
}

export interface PersonalityType {
  id: string;
  number: number;
  description: string;
  percentages: {
    fire: number;
    water: number;
    air: number;
    earth: number;
  };
}

export interface ParticipantData {
  id: number;
  name?: string;
  answers: {
    [questionId: number]: number; // questionId to answer number (1-4)
  };
}

export interface ParticipantProfile {
  id: number;
  name?: string;
  elementScores: {
    fire: number;
    water: number;
    air: number;
    earth: number;
  };
  matchedPersonality: PersonalityType | null;
  matchScore: number;
}
