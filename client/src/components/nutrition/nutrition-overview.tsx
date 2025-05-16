import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { calculateTotalNutrition } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function NutritionOverview() {
  const [timeRange, setTimeRange] = useState("today");
  const { user } = useAuth();
  
  const calorieGoal = user?.calorieGoal || 2200;
  
  const { data: foodLogs = [] } = useQuery({
    queryKey: ["/api/food-logs", timeRange],
  });
  
  const nutrition = calculateTotalNutrition(foodLogs);
  
  const caloriePercentage = Math.min(Math.round((nutrition.calories / calorieGoal) * 100), 100);
  
  // Estimated macronutrient goals
  const proteinGoal = Math.round(calorieGoal * 0.3 / 4); // 30% of calories from protein (4 cal/g)
  const carbsGoal = Math.round(calorieGoal * 0.45 / 4); // 45% of calories from carbs (4 cal/g)
  const fatGoal = Math.round(calorieGoal * 0.25 / 9); // 25% of calories from fat (9 cal/g)
  
  const proteinPercentage = Math.min(Math.round((nutrition.protein / proteinGoal) * 100), 100);
  const carbsPercentage = Math.min(Math.round((nutrition.carbs / carbsGoal) * 100), 100);
  const fatPercentage = Math.min(Math.round((nutrition.fat / fatGoal) * 100), 100);
  
  // Hardcoded water intake for demo
  const waterIntake = 1.5;
  const waterGoal = 2.5;
  const waterPercentage = Math.round((waterIntake / waterGoal) * 100);
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nutrition Overview</h2>
        <div className="flex items-center">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 mr-2 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button>Log Food</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calories */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 dark:text-gray-400">Calories</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{nutrition.calories}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ {calorieGoal} goal</span>
            </div>
            <Progress value={caloriePercentage} className="h-2.5" />
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                const mealLogs = foodLogs.filter((log: any) => 
                  log.mealType.toLowerCase() === meal.toLowerCase()
                );
                const mealCalories = calculateTotalNutrition(mealLogs).calories;
                
                return (
                  <div key={meal}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{meal}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{mealCalories}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Macronutrients */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 dark:text-gray-400">Macronutrients</h3>
            <div className="grid grid-cols-3 gap-4">
              {/* Protein */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Protein</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">{nutrition.protein}g</span>
                </div>
                <Progress value={proteinPercentage} className="h-1.5 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-red-500" />
              </div>
              
              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Carbs</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">{nutrition.carbs}g</span>
                </div>
                <Progress value={carbsPercentage} className="h-1.5 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-amber-500" />
              </div>
              
              {/* Fat */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Fat</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">{nutrition.fat}g</span>
                </div>
                <Progress value={fatPercentage} className="h-1.5 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-green-500" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Water Intake</span>
                <span className="text-xs font-medium text-gray-800 dark:text-white">{waterIntake} / {waterGoal} L</span>
              </div>
              <Progress value={waterPercentage} className="h-1.5 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Log */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 dark:text-gray-400">Today's Log</h3>
            <div className="space-y-4">
              {foodLogs.length > 0 ? (
                foodLogs.slice(0, 4).map((log: any, index: number) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'];
                  return (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full ${colors[index % colors.length]} mr-2`}></span>
                        <span className="text-gray-800 dark:text-white">{log.foodName}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">{log.calories} cal</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No foods logged yet today</p>
              )}
              
              <Button variant="outline" className="w-full mt-2">
                View Complete Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
