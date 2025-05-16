import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { cn, getMealTypes, getTimeOfDay } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Icons
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Search,
} from "lucide-react";

export default function MealPlannerV2() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const timeOfDay = getTimeOfDay();
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const [weekEndDate, setWeekEndDate] = useState(addDays(weekStartDate, 6));
  const [activeMealType, setActiveMealType] = useState("all");
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);
  const [savePlanDialogOpen, setSavePlanDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(currentDate);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");

  // Query current meal plans
  const { 
    data: currentMealPlans = [], 
    isLoading: isLoadingMealPlans 
  } = useQuery({
    queryKey: ['/api/meal-plans/current'],
    staleTime: 30000,
  });
  
  // Query user preferences
  const { 
    data: userPreferences = {}, 
  } = useQuery({
    queryKey: ['/api/preferences'],
    staleTime: 60000,
  });
  
  // Query recipes
  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    refetch: refetchRecipes
  } = useQuery({
    queryKey: ['/api/recipes', searchQuery],
    enabled: false,
  });
  
  // Mutation for creating a meal plan
  const createMealPlanMutation = useMutation({
    mutationFn: (mealPlan: any) => 
      apiRequest('POST', '/api/meal-plans', mealPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans/current'] });
      toast({
        title: 'Meal added',
        description: 'Your meal has been added to the plan.',
      });
      resetMealForm();
      setAddMealDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add meal. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for saving a meal plan
  const saveMealPlanMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', '/api/meal-plans/save', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans/saved'] });
      toast({
        title: 'Meal plan saved',
        description: 'Your meal plan has been saved successfully.',
      });
      setSavePlanDialogOpen(false);
      setPlanName("");
      setPlanDescription("");
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save meal plan. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Helper functions
  const nextWeek = () => {
    const newStartDate = addDays(weekStartDate, 7);
    setWeekStartDate(newStartDate);
    setWeekEndDate(addDays(newStartDate, 6));
  };
  
  const prevWeek = () => {
    const newStartDate = addDays(weekStartDate, -7);
    setWeekStartDate(newStartDate);
    setWeekEndDate(addDays(newStartDate, 6));
  };
  
  const resetMealForm = () => {
    setMealName("");
    setMealDescription("");
    setMealCalories("");
    setMealProtein("");
    setMealCarbs("");
    setMealFat("");
  };
  
  const handleAddMeal = (day: Date, mealType: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setAddMealDialogOpen(true);
  };
  
  const handleSaveMealPlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planName) {
      toast({
        title: "Error",
        description: "Please provide a name for your meal plan.",
        variant: "destructive",
      });
      return;
    }
    
    saveMealPlanMutation.mutate({
      name: planName,
      description: planDescription,
      startDate: format(weekStartDate, 'yyyy-MM-dd'),
      endDate: format(weekEndDate, 'yyyy-MM-dd'),
    });
  };
  
  const handleSubmitMeal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDay || !selectedMealType || !mealName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const newMeal = {
      date: format(selectedDay, 'yyyy-MM-dd'),
      mealType: selectedMealType,
      name: mealName,
      description: mealDescription,
      calories: mealCalories ? parseInt(mealCalories) : null,
      protein: mealProtein ? parseInt(mealProtein) : null,
      carbs: mealCarbs ? parseInt(mealCarbs) : null,
      fat: mealFat ? parseInt(mealFat) : null,
    };
    
    createMealPlanMutation.mutate(newMeal);
  };
  
  // Get meals for a specific day and meal type
  const getMealsForDay = (day: Date, mealType?: string) => {
    const dateString = format(day, 'yyyy-MM-dd');
    let meals = Array.isArray(currentMealPlans) 
      ? currentMealPlans.filter((meal: any) => meal.date === dateString)
      : [];
      
    if (mealType && mealType !== 'all') {
      meals = meals.filter((meal: any) => meal.mealType === mealType);
    }
    
    return meals;
  };
  
  // Filter meals by type if filter is active
  const filterMealsByType = (meals: any[]) => {
    if (activeMealType === 'all') return meals;
    return meals.filter((meal: any) => meal.mealType === activeMealType);
  };
  
  // Get daily calorie total
  const getDailyCalorieTotal = (day: Date) => {
    const meals = getMealsForDay(day);
    return meals.reduce((total: number, meal: any) => {
      return total + (meal.calories || 0);
    }, 0);
  };
  
  // Format date range for display
  const getDateRangeLabel = () => {
    return `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d, yyyy')}`;
  };

  return (
    <>
      <Helmet>
        <title>Meal Planner | NutriPlan</title>
      </Helmet>
      
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
              Good {timeOfDay},
            </span>{" "}
            <span className="text-blue-400">
              {user?.firstName || 'Demo'}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Plan your meals and track your nutrition goals with ease
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full"
              onClick={() => setSavePlanDialogOpen(true)}
            >
              <Save className="h-4 w-4" />
              Save Plan
            </Button>
            
            <Button
              className="flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setSelectedDay(currentDate);
                setSelectedMealType('breakfast');
                setAddMealDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Meal
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-full"
                onClick={prevWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 text-sm font-medium">
                {getDateRangeLabel()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-full"
                onClick={nextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              className="rounded-full text-sm"
              onClick={() => {
                setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
                setWeekEndDate(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6));
              }}
            >
              Today
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeMealType === "all" ? "default" : "outline"}
              className={cn(
                "rounded-full text-sm",
                activeMealType === "all" 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setActiveMealType("all")}
            >
              All
            </Button>
            
            {getMealTypes().map(type => (
              <Button
                key={type}
                variant={activeMealType === type ? "default" : "outline"}
                className={cn(
                  "rounded-full text-sm capitalize",
                  activeMealType === type 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "text-gray-700 dark:text-gray-300"
                )}
                onClick={() => setActiveMealType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Main Meal Planning Section */}
          {getMealTypes().map(mealType => {
            if (activeMealType !== 'all' && activeMealType !== mealType) return null;
            
            const meals = getMealsForDay(selectedDay || currentDate, mealType);
            
            return (
              <div key={mealType} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold capitalize">{mealType}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-8 w-8 p-0"
                    onClick={() => handleAddMeal(selectedDay || currentDate, mealType)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {meals.length > 0 ? (
                  <div className="space-y-4">
                    {meals.map((meal: any) => (
                      <div 
                        key={meal.id}
                        className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-950"
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium">{meal.name}</h3>
                          {meal.calories && (
                            <span className="text-sm text-orange-500">
                              {meal.calories} kcal
                            </span>
                          )}
                        </div>
                        
                        {meal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {meal.description}
                          </p>
                        )}
                        
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          {meal.protein && <span>Protein: {meal.protein}g</span>}
                          {meal.carbs && <span>Carbs: {meal.carbs}g</span>}
                          {meal.fat && <span>Fat: {meal.fat}g</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No meals planned</p>
                    <Button
                      variant="link"
                      className="text-purple-600 hover:text-purple-700 mt-2"
                      onClick={() => handleAddMeal(selectedDay || currentDate, mealType)}
                    >
                      Add meal
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      
      {/* Add Meal Dialog */}
      <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add a Meal</DialogTitle>
            <DialogDescription>
              {selectedDay && selectedMealType && 
                `Adding ${selectedMealType} for ${format(selectedDay, 'EEEE, MMM d, yyyy')}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitMeal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="mealName">Meal Name</Label>
                <Input
                  id="mealName"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Salad"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mealCalories">Calories</Label>
                  <Input
                    id="mealCalories"
                    type="number"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    placeholder="kcal"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mealProtein">Protein</Label>
                  <Input
                    id="mealProtein"
                    type="number"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    placeholder="g"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mealCarbs">Carbs</Label>
                  <Input
                    id="mealCarbs"
                    type="number"
                    value={mealCarbs}
                    onChange={(e) => setMealCarbs(e.target.value)}
                    placeholder="g"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mealFat">Fat</Label>
                  <Input
                    id="mealFat"
                    type="number"
                    value={mealFat}
                    onChange={(e) => setMealFat(e.target.value)}
                    placeholder="g"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mealDescription">Description (Optional)</Label>
                <Textarea
                  id="mealDescription"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="Add any notes about this meal..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddMealDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!mealName || createMealPlanMutation.isPending}
              >
                {createMealPlanMutation.isPending ? "Adding..." : "Add Meal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Save Plan Dialog */}
      <Dialog open={savePlanDialogOpen} onOpenChange={setSavePlanDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save Meal Plan</DialogTitle>
            <DialogDescription>
              Save your current meal plan to easily load it later.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveMealPlan}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. My Weekly Plan"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="planDescription">Description (Optional)</Label>
                <Textarea
                  id="planDescription"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Add notes about this meal plan..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSavePlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!planName || saveMealPlanMutation.isPending}
              >
                {saveMealPlanMutation.isPending ? "Saving..." : "Save Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}