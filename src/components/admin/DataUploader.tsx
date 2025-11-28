import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileJson } from "lucide-react";
import { toast } from "sonner";
import { ParticipantData } from "@/types/personality";

const DataUploader = () => {
  const { setParticipantData } = useData();
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const participants: ParticipantData[] = [];

        // Parse the JSON structure from the uploaded file
        Object.entries(json).forEach(([id, data]: [string, any]) => {
          const answers: { [questionId: number]: number } = {};
          
          // Extract question answers (queId_X properties)
          Object.keys(data).forEach(key => {
            if (key.startsWith('queId_')) {
              const questionId = parseInt(key.replace('queId_', ''));
              const answerNum = data[key];
              if (!isNaN(questionId) && !isNaN(answerNum)) {
                answers[questionId] = answerNum;
              }
            }
          });

          participants.push({
            id: parseInt(id),
            name: data.details?.name?.toString(),
            answers,
          });
        });

        setParticipantData(participants);
        toast.success(`${participants.length} משתתפים נטענו בהצלחה`);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast.error("שגיאה בקריאת הקובץ");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">העלאת נתוני משתתפים</h2>
        <p className="text-muted-foreground">העלה קובץ JSON עם תשובות המשתתפים</p>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <FileJson className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-semibold">לחץ לבחירת קובץ JSON</span>
              {fileName && (
                <span className="text-sm text-muted-foreground">{fileName}</span>
              )}
            </div>
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <Button asChild variant="default">
          <label htmlFor="file-upload" className="cursor-pointer gap-2">
            <Upload className="h-4 w-4" />
            בחר קובץ
          </label>
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
        <h3 className="font-semibold">פורמט קובץ נדרש:</h3>
        <pre className="bg-background p-3 rounded overflow-x-auto text-xs" dir="ltr">
{`{
  "1": {
    "queId_6": 1,
    "queId_7": 2,
    ...
  },
  "2": { ... }
}`}
        </pre>
      </div>
    </div>
  );
};

export default DataUploader;
