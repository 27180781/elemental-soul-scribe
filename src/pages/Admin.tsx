import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ElementMappingManager from "@/components/admin/ElementMappingManager";
import DataUploader from "@/components/admin/DataUploader";
import PersonalityTypeManager from "@/components/admin/PersonalityTypeManager";
import { Flame, Users, Library, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-4 relative">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="absolute right-0 gap-2"
          >
            <Home className="h-4 w-4" />
            מסך ראשי
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-mystical bg-clip-text text-transparent">
              לוח בקרה
            </h1>
            <p className="text-muted-foreground">ניהול מיפוי שאלות, סוגי אישיות והעלאת נתונים</p>
          </div>
        </div>

        <Tabs defaultValue="mappings" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mappings" className="gap-2">
              <Flame className="h-4 w-4" />
              מיפוי שאלות ליסודות
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Users className="h-4 w-4" />
              העלאת נתונים
            </TabsTrigger>
            <TabsTrigger value="personalities" className="gap-2">
              <Library className="h-4 w-4" />
              ספריית אישיויות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mappings" className="mt-6">
            <Card className="p-6">
              <ElementMappingManager />
            </Card>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <Card className="p-6">
              <DataUploader />
            </Card>
          </TabsContent>

          <TabsContent value="personalities" className="mt-6">
            <Card className="p-6">
              <PersonalityTypeManager />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
