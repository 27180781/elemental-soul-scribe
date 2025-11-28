import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PersonalityType } from "@/types/personality";
import { Trash2, Plus, Edit2, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadPersonalityTypesTemplate, parsePersonalityTypesExcel } from "@/utils/excelHelpers";

const PersonalityTypeManager = () => {
  const { personalityTypes, setPersonalityTypes, resetPersonalityTypes } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PersonalityType, 'id'>>({
    number: 1,
    name: undefined,
    description: "",
    percentages: { fire: 25, water: 25, air: 25, earth: 25 },
  });

  const resetForm = () => {
    setFormData({
      number: 1,
      name: undefined,
      description: "",
      percentages: { fire: 25, water: 25, air: 25, earth: 25 },
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    const total = Object.values(formData.percentages).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      toast.error("סכום האחוזים חייב להיות 100%");
      return;
    }

    if (!formData.number || formData.number < 1) {
      toast.error("נא למלא מספר אישיות חוקי");
      return;
    }

    if (editingId) {
      setPersonalityTypes(
        personalityTypes.map(p =>
          p.id === editingId ? { ...formData, id: editingId } : p
        )
      );
      toast.success("אישיות עודכנה");
    } else {
      const newType: PersonalityType = {
        ...formData,
        id: Date.now().toString(),
      };
      setPersonalityTypes([...personalityTypes, newType]);
      toast.success("אישיות נוספה");
    }
    resetForm();
  };

  const startEdit = (type: PersonalityType) => {
    setFormData({
      number: type.number,
      name: type.name,
      description: type.description,
      percentages: { ...type.percentages },
    });
    setEditingId(type.id);
  };

  const removeType = (id: string) => {
    setPersonalityTypes(personalityTypes.filter(p => p.id !== id));
    toast.success("אישיות הוסרה");
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const types = await parsePersonalityTypesExcel(file);
      setPersonalityTypes(types);
      toast.success(`${types.length} אישיויות נטענו מהאקסל`);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error("שגיאה בקריאת קובץ האקסל");
    }
    e.target.value = '';
  };

  const handleResetTypes = () => {
    resetPersonalityTypes();
    toast.success("כל האישיויות נמחקו");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">ספריית סוגי אישיות</h2>
        <p className="text-muted-foreground">הגדר סוגי אישיות לפי אחוזי יסודות</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={downloadPersonalityTypesTemplate}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          הורד דוגמת קובץ Excel
        </Button>
        
        <Button asChild variant="secondary" className="gap-2">
          <label htmlFor="personality-excel-upload" className="cursor-pointer">
            <Upload className="h-4 w-4" />
            העלה קובץ Excel
          </label>
        </Button>
        <Input
          id="personality-excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          className="hidden"
        />

        {personalityTypes.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                אפס ספרייה
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק את כל ספריית האישיויות.
                  <br />
                  לא ניתן לבטל פעולה זו!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetTypes}>
                  כן, מחק הכל
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">הוספה ידנית</h3>
          <div className="space-y-2">
            <Label>מספר אישיות</Label>
            <Input
              type="number"
              min="1"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
              placeholder="לדוגמה: 1"
            />
          </div>

          <div className="space-y-2">
            <Label>שם אישיות (אופציונלי)</Label>
            <Input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.trim() || undefined })}
              placeholder="למשל: מנהיג, חולם, וכו..."
            />
          </div>

          <div className="space-y-2">
            <Label>תיאור האישיות</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="תיאור מפורט של תכונות האישיות..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>אחוז אש 🔥</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.percentages.fire}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentages: { ...formData.percentages, fire: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>אחוז מים 💧</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.percentages.water}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentages: { ...formData.percentages, water: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>אחוז רוח 💨</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.percentages.air}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentages: { ...formData.percentages, air: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>אחוז עפר 🌍</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.percentages.earth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentages: { ...formData.percentages, earth: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1 gap-2">
              {editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "עדכן" : "הוסף"} אישיות
            </Button>
            {editingId && (
              <Button onClick={resetForm} variant="outline">
                ביטול
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">אישיויות קיימות ({personalityTypes.length})</h3>
        {personalityTypes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">אין אישיויות עדיין</p>
        ) : (
          personalityTypes.map(type => (
            <Card key={type.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      אישיות מספר {type.number}
                      {type.name && <span className="text-primary mr-2">- {type.name}</span>}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(type)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeType(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="bg-fire/10 p-2 rounded text-center">
                    <div className="font-semibold">🔥 {type.percentages.fire}%</div>
                  </div>
                  <div className="bg-water/10 p-2 rounded text-center">
                    <div className="font-semibold">💧 {type.percentages.water}%</div>
                  </div>
                  <div className="bg-air/10 p-2 rounded text-center">
                    <div className="font-semibold">💨 {type.percentages.air}%</div>
                  </div>
                  <div className="bg-earth/10 p-2 rounded text-center">
                    <div className="font-semibold">🌍 {type.percentages.earth}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonalityTypeManager;
