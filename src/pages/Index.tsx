import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sparkles, Settings, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block">
            <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-mystical bg-clip-text text-transparent">
            מערכת ניתוח אישיות
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" dir="rtl">
            מערכת מתקדמת לניתוח פרופילי אישיות על בסיס 4 יסודות הבריאה - אש, מים, רוח ועפר
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 space-y-4">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center">לוח בקרה</h2>
              <p className="text-center text-muted-foreground" dir="rtl">
                הגדר מיפוי שאלות, העלה נתונים וצור ספריית אישיויות
              </p>
              <Button
                onClick={() => navigate("/admin")}
                className="w-full"
                size="lg"
              >
                כניסה לניהול
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 space-y-4">
              <div className="rounded-full bg-accent/10 w-16 h-16 flex items-center justify-center mx-auto group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-center">תוצאות</h2>
              <p className="text-center text-muted-foreground" dir="rtl">
                צפה בפרופילי האישיות של המשתתפים והורד דוחות PDF
              </p>
              <Button
                onClick={() => navigate("/results")}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                צפה בתוצאות
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-gradient-mystical text-white">
            <CardContent className="p-8" dir="rtl">
              <h3 className="text-2xl font-bold mb-4">איך זה עובד?</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-lg">הגדר בלוח הבקרה איזה תשובה בכל שאלה מייצגת איזה יסוד</li>
                <li className="text-lg">העלה את קובץ הנתונים עם תשובות המשתתפים</li>
                <li className="text-lg">צור ספריית סוגי אישיות לפי אחוזי יסודות</li>
                <li className="text-lg">המערכת מחשבת אוטומטית את הפרופיל המתאים לכל משתתף</li>
                <li className="text-lg">הורד דוחות PDF מותאמים אישית לכל משתתף</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
