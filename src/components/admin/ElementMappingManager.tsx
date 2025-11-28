import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Element } from "@/types/personality";
import { Trash2, Plus, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadElementMappingTemplate, parseElementMappingExcel } from "@/utils/excelHelpers";

const ELEMENT_OPTIONS: { value: Element; label: string }[] = [
  { value: 'fire', label: 'אש 🔥' },
  { value: 'water', label: 'מים 💧' },
  { value: 'air', label: 'רוח 💨' },
  { value: 'earth', label: 'עפר 🌍' },
];

const ElementMappingManager = () => {
  const { elementMappings, setElementMappings } = useData();
  const [newQuestionId, setNewQuestionId] = useState("");
  const [newAnswers, setNewAnswers] = useState<{ [key: number]: Element }>({
    1: 'fire',
    2: 'water',
    3: 'air',
    4: 'earth',
  });

  const addMapping = () => {
    const qId = parseInt(newQuestionId);
    if (isNaN(qId)) {
      toast.error("מספר שאלה לא תקין");
      return;
    }

    if (elementMappings.find(m => m.questionId === qId)) {
      toast.error("השאלה כבר קיימת במערכת");
      return;
    }

    setElementMappings([
      ...elementMappings,
      { questionId: qId, answers: { ...newAnswers } }
    ]);

    setNewQuestionId("");
    toast.success("מיפוי נוסף בהצלחה");
  };

  const removeMapping = (questionId: number) => {
    setElementMappings(elementMappings.filter(m => m.questionId !== questionId));
    toast.success("מיפוי הוסר");
  };

  const updateMapping = (questionId: number, answerNum: number, element: Element) => {
    setElementMappings(
      elementMappings.map(m =>
        m.questionId === questionId
          ? { ...m, answers: { ...m.answers, [answerNum]: element } }
          : m
      )
    );
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mappings = await parseElementMappingExcel(file);
      setElementMappings(mappings);
      toast.success(`${mappings.length} מיפויים נטענו מהאקסל`);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error("שגיאה בקריאת קובץ האקסל");
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">מיפוי שאלות ותשובות ליסודות</h2>
        <p className="text-muted-foreground">הגדר לכל שאלה איזה יסוד מייצגת כל תשובה</p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={downloadElementMappingTemplate}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          הורד דוגמת קובץ Excel
        </Button>
        
        <Button asChild variant="secondary" className="gap-2">
          <label htmlFor="excel-upload" className="cursor-pointer">
            <Upload className="h-4 w-4" />
            העלה קובץ Excel
          </label>
        </Button>
        <Input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          className="hidden"
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">הוספה ידנית</h3>
          <div className="space-y-2">
            <Label>מספר שאלה</Label>
            <Input
              type="number"
              value={newQuestionId}
              onChange={(e) => setNewQuestionId(e.target.value)}
              placeholder="לדוגמה: 6"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(answerNum => (
              <div key={answerNum} className="space-y-2">
                <Label>תשובה {answerNum}</Label>
                <Select
                  value={newAnswers[answerNum]}
                  onValueChange={(value: Element) =>
                    setNewAnswers({ ...newAnswers, [answerNum]: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEMENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button onClick={addMapping} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            הוסף מיפוי
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">מיפויים קיימים ({elementMappings.length})</h3>
        {elementMappings.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">אין מיפויים עדיין</p>
        ) : (
          elementMappings.map(mapping => (
            <Card key={mapping.questionId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">שאלה #{mapping.questionId}</h4>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMapping(mapping.questionId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(answerNum => (
                    <div key={answerNum} className="space-y-1">
                      <Label className="text-xs">תשובה {answerNum}</Label>
                      <Select
                        value={mapping.answers[answerNum]}
                        onValueChange={(value: Element) =>
                          updateMapping(mapping.questionId, answerNum, value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ELEMENT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ElementMappingManager;
