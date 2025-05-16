import { useState } from "react";
import { formatDate, getWeekDates, getMealTypes, calculateTotalNutrition } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info, Plus } from "lucide-react";
import MealSlot from "./meal-slot";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface WeeklyMealPlanProps {
  onAddCustomMeal: (date: string) => void;
}

export default function WeeklyMealPlan({ onAddCustomMeal }: WeeklyMealPlanProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = getWeekDates(weekOffset);
  const mealTypes = getMealTypes();
  const { user } = useAuth();

  const { data: mealPlans = [] } = useQuery({
    queryKey: ["/api/meal-plans", weekOffset],
  });
  
  const { data: userData } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Helper to find meal from the mealPlans data
  const findMeal = (date: string, mealType: string) => {
    return mealPlans.find((meal: any) => 
      meal.date === date && meal.mealType.toLowerCase() === mealType.toLowerCase()
    );
  };
  
  // Helper to calculate daily nutrition for a specific date
  const calculateDailyNutrition = (date: string) => {
    const mealsForDay = mealPlans.filter((meal: any) => meal.date === date);
    return calculateTotalNutrition(mealsForDay);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold gradient-text">Weekly Meal Plan</h2>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="rounded-full border-2 gradient-border px-5 py-2 font-medium shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            variant="default" 
            className="rounded-full gradient-button px-5 py-2 font-medium shadow-sm"
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden dark:bg-dark-card dark:border-gray-700">
        <div className="flex flex-nowrap overflow-x-auto">
          {weekDays.map((day) => {
            const dateStr = day.date.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            return (
              <div 
                key={day.dayName} 
                className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 dark:from-gray-800 dark:to-gray-750 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{day.dayName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(day.date)}</p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="h-8 px-3 text-xs rounded-full gradient-border shadow-sm" 
                      onClick={() => onAddCustomMeal(dateStr)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Meal
                    </Button>
                  </div>
                </div>
                
                <div className="calendar-day p-2">
                  {mealTypes.map((mealType) => (
                    <MealSlot 
                      key={`${dateStr}-${mealType}`}
                      date={dateStr}
                      mealType={mealType}
                      meal={findMeal(dateStr, mealType)}
                      userId={user?.id || ""}
                    />
                  ))}
                  
                  {/* Nutritional Summary */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Daily Summary
                      </h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                              <Info className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Daily nutritional summary based on your meal plan</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {(() => {
                      // Calculate nutrition data for this day
                      const dailyNutrition = calculateDailyNutrition(dateStr);
                      const calorieGoal = userData?.calorieGoal || 2200;
                      const caloriePercentage = Math.min(100, Math.round((dailyNutrition.calories || 0) / calorieGoal * 100));
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span>Calories</span>
                            <span className="font-medium">{dailyNutrition.calories || 0} / {calorieGoal}</span>
                          </div>
                          <Progress 
                            value={caloriePercentage} 
                            className="h-1.5" 
                            indicatorClassName={`${caloriePercentage > 100 ? 'bg-red-500' : 'bg-primary'}`}
                          />
                          
                          <div className="flex justify-between mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <div className="text-center">
                              <div className="font-medium">{dailyNutrition.protein || 0}g</div>
                              <div>Protein</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{dailyNutrition.carbs || 0}g</div>
                              <div>Carbs</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{dailyNutrition.fat || 0}g</div>
                              <div>Fat</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
