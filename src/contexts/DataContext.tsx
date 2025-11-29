import React, { createContext, useContext, useState, useEffect } from 'react';
import { ElementMapping, PersonalityType, ParticipantData, ParticipantProfile, PDFSettings } from '@/types/personality';

const DEFAULT_PDF_SETTINGS: PDFSettings = {
  contentTop: 180,
  contentLeft: 60,
  contentRight: 60,
  contentBottom: 120,
  headerMarginBottom: 30,
  titleFontSize: 36,
  nameFontSize: 24,
  chartWidth: 400,
  chartHeight: 300,
  chartMarginTop: 20,
  chartMarginBottom: 20,
  chartCanvasWidth: 600,
  chartCanvasHeight: 400,
  chartPercentageFontSize: 24,
  legendMarginTop: 15,
  legendGap: 20,
  legendFontSize: 16,
  legendBoxSize: 20,
  personalityMarginTop: 20,
  personalityPadding: 20,
  personalityBorderRadius: 16,
  personalityMaxWidth: 600,
  personalityTitleFontSize: 22,
  personalityTextFontSize: 16,
  personalityLineHeight: 1.7,
};

interface DataContextType {
  elementMappings: ElementMapping[];
  setElementMappings: (mappings: ElementMapping[]) => void;
  personalityTypes: PersonalityType[];
  setPersonalityTypes: (types: PersonalityType[]) => void;
  participantData: ParticipantData[];
  setParticipantData: (data: ParticipantData[]) => void;
  participantProfiles: ParticipantProfile[];
  calculateProfiles: () => void;
  resetParticipantData: () => void;
  resetElementMappings: () => void;
  resetPersonalityTypes: () => void;
  pdfSettings: PDFSettings;
  setPdfSettings: (settings: PDFSettings) => void;
  resetPDFSettings: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elementMappings, setElementMappings] = useState<ElementMapping[]>([]);
  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantData[]>([]);
  const [participantProfiles, setParticipantProfiles] = useState<ParticipantProfile[]>([]);
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>(DEFAULT_PDF_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMappings = localStorage.getItem('elementMappings');
    const savedTypes = localStorage.getItem('personalityTypes');
    const savedData = localStorage.getItem('participantData');
    const savedPdfSettings = localStorage.getItem('pdfSettings');

    if (savedMappings) setElementMappings(JSON.parse(savedMappings));
    if (savedTypes) setPersonalityTypes(JSON.parse(savedTypes));
    if (savedData) setParticipantData(JSON.parse(savedData));
    if (savedPdfSettings) setPdfSettings(JSON.parse(savedPdfSettings));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('elementMappings', JSON.stringify(elementMappings));
  }, [elementMappings]);

  useEffect(() => {
    localStorage.setItem('personalityTypes', JSON.stringify(personalityTypes));
  }, [personalityTypes]);

  useEffect(() => {
    localStorage.setItem('participantData', JSON.stringify(participantData));
  }, [participantData]);

  useEffect(() => {
    localStorage.setItem('pdfSettings', JSON.stringify(pdfSettings));
  }, [pdfSettings]);

  const calculateProfiles = () => {
    if (!participantData.length || !elementMappings.length || !personalityTypes.length) {
      return;
    }

    const profiles: ParticipantProfile[] = participantData.map(participant => {
      const elementScores = { fire: 0, water: 0, air: 0, earth: 0 };
      let totalAnswers = 0;

      // Calculate element scores for this participant
      Object.entries(participant.answers).forEach(([questionId, answerNum]) => {
        const mapping = elementMappings.find(m => m.questionId === parseInt(questionId));
        if (mapping && mapping.answers[answerNum]) {
          const element = mapping.answers[answerNum];
          elementScores[element]++;
          totalAnswers++;
        }
      });

      // Convert to percentages
      if (totalAnswers > 0) {
        Object.keys(elementScores).forEach(key => {
          elementScores[key as keyof typeof elementScores] = 
            (elementScores[key as keyof typeof elementScores] / totalAnswers) * 100;
        });
      }

      // Find best matching personality
      let bestMatch: PersonalityType | null = null;
      let bestScore = Infinity;

      personalityTypes.forEach(type => {
        const score = Math.sqrt(
          Math.pow(type.percentages.fire - elementScores.fire, 2) +
          Math.pow(type.percentages.water - elementScores.water, 2) +
          Math.pow(type.percentages.air - elementScores.air, 2) +
          Math.pow(type.percentages.earth - elementScores.earth, 2)
        );

        if (score < bestScore) {
          bestScore = score;
          bestMatch = type;
        }
      });

      return {
        id: participant.id,
        name: participant.name,
        elementScores,
        matchedPersonality: bestMatch,
        matchScore: bestScore,
      };
    });

    setParticipantProfiles(profiles);
  };

  const resetParticipantData = () => {
    setParticipantData([]);
    setParticipantProfiles([]);
    localStorage.removeItem('participantData');
  };

  const resetElementMappings = () => {
    setElementMappings([]);
    localStorage.removeItem('elementMappings');
  };

  const resetPersonalityTypes = () => {
    setPersonalityTypes([]);
    localStorage.removeItem('personalityTypes');
  };

  const resetPDFSettings = () => {
    setPdfSettings(DEFAULT_PDF_SETTINGS);
    localStorage.setItem('pdfSettings', JSON.stringify(DEFAULT_PDF_SETTINGS));
  };

  useEffect(() => {
    calculateProfiles();
  }, [participantData, elementMappings, personalityTypes]);

  return (
    <DataContext.Provider
      value={{
        elementMappings,
        setElementMappings,
        personalityTypes,
        setPersonalityTypes,
        participantData,
        setParticipantData,
        participantProfiles,
        calculateProfiles,
        resetParticipantData,
        resetElementMappings,
        resetPersonalityTypes,
        pdfSettings,
        setPdfSettings,
        resetPDFSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
