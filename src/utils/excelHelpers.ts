import * as XLSX from 'xlsx';
import { ElementMapping, PersonalityType, Element } from '@/types/personality';

export const downloadElementMappingTemplate = () => {
  const data = [
    ['מספר שאלה', 'תשובה 1', 'תשובה 2', 'תשובה 3', 'תשובה 4'],
    [6, 'fire', 'water', 'air', 'earth'],
    [7, 'water', 'air', 'earth', 'fire'],
    [8, 'air', 'earth', 'fire', 'water'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'מיפוי שאלות');
  XLSX.writeFile(wb, 'template-element-mapping.xlsx');
};

export const downloadPersonalityTypesTemplate = () => {
  const data = [
    ['מספר אישיות', 'אחוז אש', 'אחוז מים', 'אחוז רוח', 'אחוז עפר', 'תיאור'],
    [1, 40, 20, 25, 15, 'אישיות דומיננטית באש - נמרץ ומלא אנרגיה'],
    [2, 20, 40, 15, 25, 'אישיות דומיננטית במים - רגשי ואמפתי'],
    [3, 25, 15, 40, 20, 'אישיות דומיננטית ברוח - אינטלקטואל וחופשי'],
    [4, 15, 25, 20, 40, 'אישיות דומיננטית בעפר - מעשי ויציב'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'סוגי אישיות');
  XLSX.writeFile(wb, 'template-personality-types.xlsx');
};

export const parseElementMappingExcel = async (file: File): Promise<ElementMapping[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const mappings: ElementMapping[] = [];
        
        // Skip header row
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[0]) continue; // Skip empty rows

          const questionId = parseInt(row[0]);
          if (isNaN(questionId)) continue;

          const answers: { [key: number]: Element } = {};
          for (let j = 1; j <= 4; j++) {
            const element = row[j]?.toString().toLowerCase();
            if (['fire', 'water', 'air', 'earth'].includes(element)) {
              answers[j] = element as Element;
            }
          }

          if (Object.keys(answers).length === 4) {
            mappings.push({ questionId, answers });
          }
        }

        resolve(mappings);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
    reader.readAsBinaryString(file);
  });
};

export const parsePersonalityTypesExcel = async (file: File): Promise<PersonalityType[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const types: PersonalityType[] = [];
        
        // Skip header row
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[0]) continue; // Skip empty rows

          const number = parseInt(row[0]);
          const fire = parseFloat(row[1]) || 0;
          const water = parseFloat(row[2]) || 0;
          const air = parseFloat(row[3]) || 0;
          const earth = parseFloat(row[4]) || 0;
          const description = row[5]?.toString() || '';

          if (!isNaN(number)) {
            types.push({
              id: Date.now().toString() + '-' + number,
              number,
              description,
              percentages: { fire, water, air, earth },
            });
          }
        }

        resolve(types);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
    reader.readAsBinaryString(file);
  });
};
