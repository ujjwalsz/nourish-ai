import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/components/dashboard/Dashboard";
import NutritionChat from "@/components/chat/NutritionChat";
import MealLogger from "@/components/meals/MealLogger";
import FoodAnalyzer from "@/components/analyze/FoodAnalyzer";
import NutritionCharts from "@/components/charts/NutritionCharts";
import MealPlanner from "@/components/planner/MealPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <NutritionChat />;
      case "meals":
        return <MealLogger />;
      case "analyze":
        return <FoodAnalyzer />;
      case "charts":
        return <NutritionCharts />;
      case "planner":
        return <MealPlanner />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
