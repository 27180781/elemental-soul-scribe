import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileJson, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ParticipantData } from "@/types/personality";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UploadReport {
  totalParticipants: number;
  totalValidAnswers: number;
  ignoredKeys: number;
  outOfRangeAnswers: number;
  participantsWithZeroAnswers: number;
  avgAnswersPerParticipant: number;
}

const DataUploader = () => {
  const { setParticipantData } = useData();
  const [fileName, setFileName] = useState("");
  const [uploadReport, setUploadReport] = useState<UploadReport | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadReport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const participants: ParticipantData[] = [];
        
        // Regex to match ONLY exact queId_<number> format (not queId_7_success)
        const questionKeyRegex = /^queId_(\d+)$/;
        
        let totalValidAnswers = 0;
        let ignoredKeys = 0;
        let outOfRangeAnswers = 0;
        let participantsWithZeroAnswers = 0;

        // Parse the JSON structure from the uploaded file
        Object.entries(json).forEach(([id, data]: [string, any]) => {
          const answers: { [questionId: number]: number } = {};
          let validAnswersForParticipant = 0;
          
          // Extract question answers using strict regex
          Object.keys(data).forEach(key => {
            const match = key.match(questionKeyRegex);
            if (match) {
              const questionId = parseInt(match[1]);
              const answerNum = data[key];
              
              // Only accept answers in valid range 1-4
              if (!isNaN(questionId) && typeof answerNum === 'number' && answerNum >= 1 && answerNum <= 4) {
                answers[questionId] = answerNum;
                validAnswersForParticipant++;
                totalValidAnswers++;
              } else if (!isNaN(questionId)) {
                outOfRangeAnswers++;
              }
            } else if (key.startsWith('queId_')) {
              // This catches keys like queId_7_success that we intentionally ignore
              ignoredKeys++;
            }
          });

          if (validAnswersForParticipant === 0) {
            participantsWithZeroAnswers++;
          }

          participants.push({
            id: parseInt(id),
            name: data.details?.name?.toString(),
            answers,
          });
        });

        const avgAnswersPerParticipant = participants.length > 0 
          ? totalValidAnswers / participants.length 
          : 0;

        const report: UploadReport = {
          totalParticipants: participants.length,
          totalValidAnswers,
          ignoredKeys,
          outOfRangeAnswers,
          participantsWithZeroAnswers,
          avgAnswersPerParticipant
        };
        
        setUploadReport(report);
        setParticipantData(participants);
        
        // Show appropriate toast based on data quality
        if (participantsWithZeroAnswers === participants.length) {
          toast.error("לא נמצאו תשובות תקינות (1–4). בדוק את פורמט הקובץ.");
        } else if (avgAnswersPerParticipant < 5) {
          toast.warning(`נטענו ${participants.length} משתתפים, אך נמצאו מעט תשובות תקינות (ממוצע: ${avgAnswersPerParticipant.toFixed(1)})`);
        } else {
          toast.success(`${participants.length} משתתפים נטענו בהצלחה עם ${totalValidAnswers} תשובות תקינות`);
        }
        
        if (ignoredKeys > 0) {
          console.log(`Ignored ${ignoredKeys} non-answer keys (like queId_X_success)`);
        }
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

      {/* Upload Report */}
      {uploadReport && (
        <Alert variant={uploadReport.participantsWithZeroAnswers === uploadReport.totalParticipants ? "destructive" : "default"}>
          {uploadReport.participantsWithZeroAnswers === uploadReport.totalParticipants ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>דו"ח העלאה</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1 text-sm">
              <p>• משתתפים שנטענו: <strong>{uploadReport.totalParticipants}</strong></p>
              <p>• תשובות תקינות (1-4): <strong>{uploadReport.totalValidAnswers}</strong></p>
              <p>• ממוצע תשובות למשתתף: <strong>{uploadReport.avgAnswersPerParticipant.toFixed(1)}</strong></p>
              {uploadReport.ignoredKeys > 0 && (
                <p>• מפתחות שהתעלמנו מהם (כמו _success): <strong>{uploadReport.ignoredKeys}</strong></p>
              )}
              {uploadReport.outOfRangeAnswers > 0 && (
                <p>• תשובות מחוץ לטווח (לא 1-4): <strong>{uploadReport.outOfRangeAnswers}</strong></p>
              )}
              {uploadReport.participantsWithZeroAnswers > 0 && (
                <p className="text-destructive">• משתתפים ללא תשובות תקינות: <strong>{uploadReport.participantsWithZeroAnswers}</strong></p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

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
        <p className="text-muted-foreground text-xs">
          הערה: המערכת תתעלם אוטומטית משדות כמו queId_X_success ותקרא רק תשובות בטווח 1-4.
        </p>
      </div>
    </div>
  );
};

export default DataUploader;
