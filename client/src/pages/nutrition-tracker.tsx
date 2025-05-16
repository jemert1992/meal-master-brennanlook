import { Helmet } from "react-helmet";
import NutritionTracker from "@/components/nutrition/nutrition-tracker";
import NutritionOverview from "@/components/nutrition/nutrition-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CalendarRange, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function NutritionTrackerPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Nutrition Tracker | NutriPlan</title>
        <meta name="description" content="Track your daily calories and macronutrients. Log your meals and monitor your nutritional intake over time." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Nutrition Tracker</h1>
        </div>
        
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="daily">
              <CalendarRange className="h-4 w-4 mr-2" />
              Daily Log
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-0">
            <NutritionTracker />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <div className="space-y-6">
              <NutritionOverview />
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 dark:bg-dark-card dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Nutrition Trends</h2>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nutrition trends and charts will appear here as you log more meals.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 dark:bg-dark-card dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Nutrition Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Daily Calorie Goal</h3>
                    <p className="text-2xl font-bold text-primary">{user?.calorieGoal || 2200} <span className="text-sm font-normal text-gray-500">calories</span></p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Protein Goal</h3>
                    <p className="text-2xl font-bold text-red-500">{Math.round((user?.calorieGoal || 2200) * 0.3 / 4)} <span className="text-sm font-normal text-gray-500">grams</span></p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Water Goal</h3>
                    <p className="text-2xl font-bold text-blue-500">2.5 <span className="text-sm font-normal text-gray-500">liters</span></p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
