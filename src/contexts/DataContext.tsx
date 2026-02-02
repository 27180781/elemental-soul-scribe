import React, { createContext, useContext, useState, useEffect } from 'react';
import { ElementMapping, PersonalityType, ParticipantData, ParticipantProfile, PDFSettings, DistributionMode } from '@/types/personality';

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
  distributionMode: DistributionMode;
  setDistributionMode: (mode: DistributionMode) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elementMappings, setElementMappings] = useState<ElementMapping[]>([]);
  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantData[]>([]);
  const [participantProfiles, setParticipantProfiles] = useState<ParticipantProfile[]>([]);
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>(DEFAULT_PDF_SETTINGS);
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('normal');

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

    // Helper function to calculate element scores for a participant
    const calculateElementScores = (participant: ParticipantData) => {
      const elementScores = { fire: 0, water: 0, air: 0, earth: 0 };
      let totalAnswers = 0;

      Object.entries(participant.answers).forEach(([questionId, answerNum]) => {
        const mapping = elementMappings.find(m => m.questionId === parseInt(questionId));
        if (mapping && mapping.answers[answerNum]) {
          const element = mapping.answers[answerNum];
          elementScores[element]++;
          totalAnswers++;
        }
      });

      if (totalAnswers > 0) {
        Object.keys(elementScores).forEach(key => {
          elementScores[key as keyof typeof elementScores] = 
            (elementScores[key as keyof typeof elementScores] / totalAnswers) * 100;
        });
      }

      return elementScores;
    };

    // Helper function to calculate distance between element scores and personality type
    const calculateDistance = (scores: typeof participantData[0]['answers'] extends infer _ ? { fire: number; water: number; air: number; earth: number } : never, type: PersonalityType) => {
      return Math.sqrt(
        Math.pow(type.percentages.fire - scores.fire, 2) +
        Math.pow(type.percentages.water - scores.water, 2) +
        Math.pow(type.percentages.air - scores.air, 2) +
        Math.pow(type.percentages.earth - scores.earth, 2)
      );
    };

    // Helper function to get top N closest personality types
    const getTopMatches = (elementScores: { fire: number; water: number; air: number; earth: number }, n: number) => {
      return personalityTypes
        .map(type => ({
          type,
          distance: calculateDistance(elementScores, type)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, n);
    };

    if (distributionMode === 'normal') {
      // Normal mode: assign to closest personality type
      const profiles: ParticipantProfile[] = participantData.map(participant => {
        const elementScores = calculateElementScores(participant);
        const topMatches = getTopMatches(elementScores, 1);
        const bestMatch = topMatches[0];

        return {
          id: participant.id,
          name: participant.name,
          elementScores,
          matchedPersonality: bestMatch?.type || null,
          matchScore: bestMatch?.distance || Infinity,
        };
      });

      setParticipantProfiles(profiles);
    } else {
      // Wide distribution mode: balance assignments across top 3 choices
      const participantScores = participantData.map(participant => ({
        participant,
        elementScores: calculateElementScores(participant),
        topMatches: getTopMatches(calculateElementScores(participant), 3)
      }));

      // Track how many participants are assigned to each personality type
      const assignmentCounts: Record<string, number> = {};
      personalityTypes.forEach(type => {
        assignmentCounts[type.id] = 0;
      });

      // Calculate target count per personality type (ideal even distribution)
      const targetPerType = Math.ceil(participantData.length / personalityTypes.length);

      // Sort participants by their first choice distance (most confident first)
      participantScores.sort((a, b) => a.topMatches[0].distance - b.topMatches[0].distance);

      const profiles: ParticipantProfile[] = participantScores.map(({ participant, elementScores, topMatches }) => {
        // Find the best available match that isn't over capacity
        let chosenMatch = topMatches[0];
        
        for (const match of topMatches) {
          // Allow some overflow (1.5x target) to maintain accuracy
          if (assignmentCounts[match.type.id] < targetPerType * 1.5) {
            chosenMatch = match;
            break;
          }
        }

        // If all top 3 are over capacity, use the one with least overflow
        if (assignmentCounts[chosenMatch.type.id] >= targetPerType * 1.5) {
          const leastOverflowed = topMatches.reduce((best, current) => 
            assignmentCounts[current.type.id] < assignmentCounts[best.type.id] ? current : best
          );
          chosenMatch = leastOverflowed;
        }

        assignmentCounts[chosenMatch.type.id]++;

        return {
          id: participant.id,
          name: participant.name,
          elementScores,
          matchedPersonality: chosenMatch.type,
          matchScore: chosenMatch.distance,
        };
      });

      // Sort back by participant ID
      profiles.sort((a, b) => a.id - b.id);

      setParticipantProfiles(profiles);
    }
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
  }, [participantData, elementMappings, personalityTypes, distributionMode]);

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
        distributionMode,
        setDistributionMode,
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
