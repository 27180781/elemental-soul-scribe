import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalityType } from "@/types/personality";
import { Trash2, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

const PersonalityTypeManager = () => {
  const { personalityTypes, setPersonalityTypes } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PersonalityType, 'id'>>({
    name: "",
    description: "",
    percentages: { fire: 25, water: 25, air: 25, earth: 25 },
  });

  const resetForm = () => {
    setFormData({
      name: "",
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

    if (!formData.name.trim()) {
      toast.error("נא למלא שם אישיות");
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

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">ספריית סוגי אישיות</h2>
        <p className="text-muted-foreground">הגדר סוגי אישיות לפי אחוזי יסודות</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>שם האישיות</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="לדוגמה: לוחם האש"
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
                    <h4 className="font-semibold text-lg">{type.name}</h4>
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
