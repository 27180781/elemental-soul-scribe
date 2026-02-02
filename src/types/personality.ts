export type Element = 'fire' | 'water' | 'air' | 'earth';

export type DistributionMode = 'normal' | 'wide';

export interface ElementMapping {
  questionId: number;
  answers: {
    [key: number]: Element; // answer number (1-4) to element
  };
}

export interface PersonalityType {
  id: string;
  number: number;
  name?: string; // Optional name for the personality type
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

export interface PDFSettings {
  // Content container positioning
  contentTop: number;
  contentLeft: number;
  contentRight: number;
  contentBottom: number;
  
  // Header settings
  headerMarginBottom: number;
  titleFontSize: number;
  nameFontSize: number;
  
  // Pie chart settings
  chartWidth: number;
  chartHeight: number;
  chartMarginTop: number;
  chartMarginBottom: number;
  chartCanvasWidth: number;
  chartCanvasHeight: number;
  chartPercentageFontSize: number;
  
  // Legend settings
  legendMarginTop: number;
  legendGap: number;
  legendFontSize: number;
  legendBoxSize: number;
  
  // Personality box settings
  personalityMarginTop: number;
  personalityPadding: number;
  personalityBorderRadius: number;
  personalityMaxWidth: number;
  personalityTitleFontSize: number;
  personalityTextFontSize: number;
  personalityLineHeight: number;
}

export interface AppSettings {
  concentrationThreshold: number; // Percentage threshold for high concentration alert (default 10)
  batchPdfSize: number; // Number of participants per PDF file when downloading all (default 10)
  parallelPdfWorkers: number; // Number of parallel PDF workers (1-5)
}
