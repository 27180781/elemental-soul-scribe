import React, { createContext, useContext, useState, useEffect } from 'react';
import { ElementMapping, PersonalityType, ParticipantData, ParticipantProfile } from '@/types/personality';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elementMappings, setElementMappings] = useState<ElementMapping[]>([]);
  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantData[]>([]);
  const [participantProfiles, setParticipantProfiles] = useState<ParticipantProfile[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMappings = localStorage.getItem('elementMappings');
    const savedTypes = localStorage.getItem('personalityTypes');
    const savedData = localStorage.getItem('participantData');

    if (savedMappings) setElementMappings(JSON.parse(savedMappings));
    if (savedTypes) setPersonalityTypes(JSON.parse(savedTypes));
    if (savedData) setParticipantData(JSON.parse(savedData));
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
