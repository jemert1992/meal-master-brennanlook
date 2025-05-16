import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { cn, getMealTypes, getTimeOfDay } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Search,
} from "lucide-react";

export default function MealPlanner() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const timeOfDay = getTimeOfDay();
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(
    startOfWeek(currentDate, { weekStartsOn: 1 })
  );
  const [activeMealType, setActiveMealType] = useState("all");
  const [activeDay, setActiveDay] = useState(format(currentDate, 'yyyy-MM-dd'));
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);
  const [savePlanDialogOpen, setSavePlanDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [customMealName, setCustomMealName] = useState("");
  const [customMealCalories, setCustomMealCalories] = useState("");
  const [customMealProtein, setCustomMealProtein] = useState("");
  const [customMealCarbs, setCustomMealCarbs] = useState("");
  const [customMealFat, setCustomMealFat] = useState("");
  const [customMealDescription, setCustomMealDescription] = useState("");
  
  // Query current meal plans
  const { 
    data: currentMealPlans = [],
    isLoading: isLoadingMealPlans 
  } = useQuery({
    queryKey: ['/api/meal-plans/current'],
    staleTime: 30000,
  });
  
  // Query recipes for search
  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    refetch: refetchRecipes
  } = useQuery({
    queryKey: ['/api/recipes', searchQuery],
    enabled: false,
  });
  
  // Query user preferences
  const { 
    data: userPreferences = {}, 
  } = useQuery({
    queryKey: ['/api/preferences'],
    staleTime: 60000,
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
      
      // Reset form
      setCustomMealName("");
      setCustomMealCalories("");
      setCustomMealProtein("");
      setCustomMealCarbs("");
      setCustomMealFat("");
      setCustomMealDescription("");
      setAddMealDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add meal. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating meal plan:', error);
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
      console.error('Error saving meal plan:', error);
    }
  });
  
  // Mutation for deleting a meal plan
  const deleteMealPlanMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/meal-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans/current'] });
      toast({
        title: 'Meal removed',
        description: 'Your meal has been removed from the plan.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove meal. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting meal plan:', error);
    }
  });

  // Helper functions
  const nextWeek = () => {
    const newDate = addWeeks(currentWeekStartDate, 1);
    setCurrentWeekStartDate(newDate);
  };
  
  const prevWeek = () => {
    const newDate = subWeeks(currentWeekStartDate, 1);
    setCurrentWeekStartDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setCurrentWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setActiveDay(format(new Date(), 'yyyy-MM-dd'));
  };
  
  const handleAddMeal = (day: Date, mealType: string) => {
    setActiveDay(format(day, 'yyyy-MM-dd'));
    setSelectedMealType(mealType);
    setAddMealDialogOpen(true);
  };
  
  const handleSaveMealPlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your meal plan.",
        variant: "destructive",
      });
      return;
    }
    
    const startDate = format(currentWeekStartDate, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeekStartDate, 6), 'yyyy-MM-dd');
    
    saveMealPlanMutation.mutate({
      name: planName,
      description: planDescription,
      startDate,
      endDate,
    });
  };
  
  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMealPlan = {
      date: activeDay,
      mealType: selectedMealType,
      name: customMealName,
      description: customMealDescription,
      calories: customMealCalories ? parseInt(customMealCalories) : null,
      protein: customMealProtein ? parseInt(customMealProtein) : null,
      carbs: customMealCarbs ? parseInt(customMealCarbs) : null,
      fat: customMealFat ? parseInt(customMealFat) : null,
    };
    
    createMealPlanMutation.mutate(newMealPlan);
  };
  
  const handleSearchRecipes = (e: React.FormEvent) => {
    e.preventDefault();
    refetchRecipes();
  };
  
  const selectRecipe = (recipe: any) => {
    setCustomMealName(recipe.name);
    setCustomMealCalories(recipe.calories?.toString() || "");
    setCustomMealProtein(recipe.protein?.toString() || "");
    setCustomMealCarbs(recipe.carbs?.toString() || "");
    setCustomMealFat(recipe.fat?.toString() || "");
    setCustomMealDescription(recipe.description || "");
    setSearchDialogOpen(false);
  };
  
  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeekStartDate, i);
    return {
      date: day,
      isToday: isSameDay(day, new Date()),
      formattedDate: format(day, 'EEE d'),
      dayName: format(day, 'EEEE'),
    };
  });
  
  // Get meals for a specific day and meal type
  const getMealsForDayAndType = (day: string, mealType: string) => {
    return Array.isArray(currentMealPlans)
      ? currentMealPlans.filter((meal: any) => 
          meal.date === day && meal.mealType === mealType
        )
      : [];
  };
  
  // Get total calories for a day
  const getDailyCalories = (day: string) => {
    if (!Array.isArray(currentMealPlans)) return 0;
    
    return currentMealPlans
      .filter((meal: any) => meal.date === day)
      .reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
  };
  
  // Format the date range for display
  const formatDateRange = () => {
    const start = format(currentWeekStartDate, 'MMM d');
    const end = format(addDays(currentWeekStartDate, 6), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };

  return (
    <>
      <Helmet>
        <title>Meal Planner | NutriPlan</title>
      </Helmet>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Good {timeOfDay}, </span>
              <span className="text-blue-400">{user?.firstName || 'there'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Plan your meals and track your nutrition goals with ease
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Button 
                variant="outline" 
                className="rounded-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800"
                onClick={() => setSavePlanDialogOpen(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
              
              <Button 
                className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={() => setAddMealDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center rounded-full bg-white shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-full"
                onClick={prevWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="px-4 py-2 text-sm font-medium">
                {formatDateRange()}
              </div>
              
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
              size="sm"
              className="rounded-full text-sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={activeMealType === "all" ? "default" : "outline"}
              className={cn(
                "rounded-full text-sm px-4",
                activeMealType === "all" ? "bg-indigo-500 hover:bg-indigo-600" : ""
              )}
              onClick={() => setActiveMealType("all")}
            >
              All
            </Button>
            
            {getMealTypes().map(mealType => (
              <Button
                key={mealType}
                variant={activeMealType === mealType ? "default" : "outline"}
                className={cn(
                  "rounded-full text-sm px-4 capitalize",
                  activeMealType === mealType ? "bg-indigo-500 hover:bg-indigo-600" : ""
                )}
                onClick={() => setActiveMealType(mealType)}
              >
                {mealType}
              </Button>
            ))}
          </div>
          
          {/* Active Day View */}
          <div className="space-y-8 mb-10">
            {/* Only show selected date information */}
            <div className="relative">
              <div className="absolute -left-28 top-0 bottom-0 w-24 flex flex-col justify-center items-center bg-gray-800 text-white rounded-l-xl">
                <p className="text-xl font-semibold">{format(new Date(activeDay), 'EEEE')}</p>
                <p className="text-sm">{format(new Date(activeDay), 'MMM d')}</p>
                <div className="mt-4 w-full px-4">
                  <div className="text-xs flex justify-between mb-1">
                    <span>Calories</span>
                    <span>{getDailyCalories(activeDay)} / {userPreferences?.calorieGoal || 2000}</span>
                  </div>
                  <Progress 
                    value={Math.min((getDailyCalories(activeDay) / (userPreferences?.calorieGoal || 2000)) * 100, 100)} 
                    className="h-1.5 bg-white/20" 
                  />
                </div>
              </div>
              
              <div className="ml-0 md:ml-24">
                {getMealTypes().map(mealType => {
                  const meals = getMealsForDayAndType(activeDay, mealType);
                  
                  return (
                    <div key={mealType} className={cn(
                      "mb-8 px-6 py-5 rounded-xl",
                      mealType === "breakfast" ? "bg-blue-50 dark:bg-blue-950/20" : "",
                      mealType === "lunch" ? "bg-purple-50 dark:bg-purple-950/20" : "",
                      mealType === "dinner" ? "bg-orange-50 dark:bg-orange-950/20" : "",
                      mealType === "snack" ? "bg-green-50 dark:bg-green-950/20" : ""
                    )}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold capitalize">{mealType}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0"
                          onClick={() => handleAddMeal(new Date(activeDay), mealType)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {meals.length > 0 ? (
                        <div className="space-y-3">
                          {meals.map((meal: any) => (
                            <div 
                              key={meal.id}
                              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{meal.name}</h4>
                                  {meal.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      {meal.description}
                                    </p>
                                  )}
                                </div>
                                
                                {meal.calories && (
                                  <div className="text-sm font-medium text-orange-500 dark:text-orange-400">
                                    {meal.calories} kcal
                                  </div>
                                )}
                              </div>
                              
                              {(meal.protein || meal.carbs || meal.fat) && (
                                <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {meal.protein && (
                                    <div>Protein: {meal.protein}g</div>
                                  )}
                                  {meal.carbs && (
                                    <div>Carbs: {meal.carbs}g</div>
                                  )}
                                  {meal.fat && (
                                    <div>Fat: {meal.fat}g</div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-2">No meals planned</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-indigo-500 hover:text-indigo-600 border-indigo-200 hover:border-indigo-300"
                            onClick={() => handleAddMeal(new Date(activeDay), mealType)}
                          >
                            Add meal
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Add Meal Dialog */}
      <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add a Meal</DialogTitle>
            <DialogDescription>
              {activeDay && `Adding meal for ${format(new Date(activeDay), 'EEE, MMM d')} - ${selectedMealType}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center mt-2 mb-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setSearchDialogOpen(true)}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Recipes
            </Button>
          </div>
          
          <form onSubmit={handleAddCustomMeal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customMealName">Meal Name</Label>
                <Input
                  id="customMealName"
                  placeholder="e.g. Grilled Chicken Salad"
                  value={customMealName}
                  onChange={(e) => setCustomMealName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="customMealCalories">Calories</Label>
                  <Input
                    id="customMealCalories"
                    type="number"
                    placeholder="kcal"
                    value={customMealCalories}
                    onChange={(e) => setCustomMealCalories(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customMealProtein">Protein</Label>
                  <Input
                    id="customMealProtein"
                    type="number"
                    placeholder="g"
                    value={customMealProtein}
                    onChange={(e) => setCustomMealProtein(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="customMealCarbs">Carbs</Label>
                  <Input
                    id="customMealCarbs"
                    type="number"
                    placeholder="g"
                    value={customMealCarbs}
                    onChange={(e) => setCustomMealCarbs(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customMealFat">Fat</Label>
                  <Input
                    id="customMealFat"
                    type="number"
                    placeholder="g"
                    value={customMealFat}
                    onChange={(e) => setCustomMealFat(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="customMealDescription">Description (Optional)</Label>
                <Textarea
                  id="customMealDescription"
                  placeholder="Add any notes about this meal..."
                  value={customMealDescription}
                  onChange={(e) => setCustomMealDescription(e.target.value)}
                  className="resize-none"
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
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={!customMealName || createMealPlanMutation.isPending}
              >
                {createMealPlanMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                    Adding...
                  </>
                ) : "Add Meal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Save Meal Plan Dialog */}
      <Dialog open={savePlanDialogOpen} onOpenChange={setSavePlanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Current Meal Plan</DialogTitle>
            <DialogDescription>
              Save your current week's meal plan to easily load it again in the future.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveMealPlan}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g. My Healthy Week"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="planDescription">Description (Optional)</Label>
                <Textarea
                  id="planDescription"
                  placeholder="Add any notes about this meal plan..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  This will save all meals from{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {format(currentWeekStartDate, 'MMM d')}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {format(addDays(currentWeekStartDate, 6), 'MMM d, yyyy')}
                  </span>
                </p>
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
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={!planName || saveMealPlanMutation.isPending}
              >
                {saveMealPlanMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Recipe Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Recipes</DialogTitle>
            <DialogDescription>
              Find a recipe to add to your meal plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <form onSubmit={handleSearchRecipes} className="flex space-x-2 mb-4">
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={isLoadingRecipes}
              >
                {isLoadingRecipes ? (
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            <div className="space-y-3 mt-2">
              {recipes && Array.isArray(recipes) && recipes.length > 0 ? (
                recipes.map((recipe: any) => (
                  <div 
                    key={recipe.id}
                    className="p-3 border rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer transition-colors"
                    onClick={() => selectRecipe(recipe)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{recipe.name}</h3>
                      {recipe.calories && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {recipe.calories} kcal
                        </span>
                      )}
                    </div>
                    
                    {recipe.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      {recipe.protein && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          P: {recipe.protein}g
                        </span>
                      )}
                      {recipe.carbs && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          C: {recipe.carbs}g
                        </span>
                      )}
                      {recipe.fat && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          F: {recipe.fat}g
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : searchQuery && !isLoadingRecipes ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No recipes found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try a different search term or create a custom meal
                  </p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Type above to search for recipes
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}