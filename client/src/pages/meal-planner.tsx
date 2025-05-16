import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Edit,
  Flame,
  ListChecks,
  Loader,
  Plus,
  Save,
  Search,
  Settings,
  Trash,
  Utensils,
  X,
} from "lucide-react";

export default function MealPlanner() {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeMealType, setActiveMealType] = useState("all");
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(currentDate));
  const [createMealDialogOpen, setCreateMealDialogOpen] = useState(false);
  const [savePlanDialogOpen, setSavePlanDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  
  // Custom meal dialog state
  const [addCustomMealDialogOpen, setAddCustomMealDialogOpen] = useState(false);
  const [selectedMealDate, setSelectedMealDate] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: suggestedRecipes = [] } = useQuery({
    queryKey: ["/api/recipes/suggested"],
  });
  
  const { data: savedMealPlans = [] } = useQuery({
    queryKey: ["/api/meal-plans/saved"],
  });
  
  const { data: currentMealPlans = [] } = useQuery({
    queryKey: ["/api/meal-plans", weekOffset],
  });
  
  // Get user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/preferences"],
  });
  
  // Save current meal plan mutation
  const saveMealPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/meal-plans/saved", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/saved"] });
      setSavePlanDialogOpen(false);
      toast({
        title: "Meal plan saved",
        description: "Your meal plan has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Generate meal plan mutation
  const generateMealPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/meal-plans/generate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/saved"] });
      setGeneratePlanDialogOpen(false);
      toast({
        title: "Meal plan generated",
        description: "A new meal plan has been generated based on your preferences",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete meal plan mutation
  const deleteMealPlanMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/meal-plans/saved/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/saved"] });
      toast({
        title: "Meal plan deleted",
        description: "Your meal plan has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Load meal plan
  const loadMealPlan = async (planId: number) => {
    try {
      const response = await fetch(`/api/meal-plans/saved/${planId}`);
      const plan = await response.json();
      
      if (plan.entries && plan.entries.length > 0) {
        // Clear current meal plan for the week
        const startDate = new Date(plan.startDate);
        const endDate = new Date(plan.endDate);
        
        // Calculate week offset from today
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - daysSinceMonday);
        
        const targetMonday = new Date(startDate);
        const mondayOffset = Math.round((targetMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        // Set the week offset to show the correct week
        setWeekOffset(mondayOffset);
        
        toast({
          title: "Meal plan loaded",
          description: "Your saved meal plan has been loaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to load meal plan",
        description: "An error occurred while loading the meal plan",
        variant: "destructive",
      });
    }
  };
  
  const handleSavePlan = () => {
    if (!planName) {
      toast({
        title: "Missing plan name",
        description: "Please provide a name for your meal plan",
        variant: "destructive",
      });
      return;
    }
    
    // Get current date range from the weekly meal plan
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday + (weekOffset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const startDateStr = monday.toISOString().split('T')[0];
    const endDateStr = sunday.toISOString().split('T')[0];
    
    // Create entries from the current meal plan
    const entries = currentMealPlans.map((meal: any) => ({
      date: meal.date,
      mealType: meal.mealType,
      recipeId: meal.recipeId,
      customMealName: meal.customMealName,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    }));
    
    saveMealPlanMutation.mutate({
      name: planName,
      description: planDescription,
      startDate: startDateStr,
      endDate: endDateStr,
      entries
    });
  };
  
  const handleGeneratePlan = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please provide start and end dates for your meal plan",
        variant: "destructive",
      });
      return;
    }
    
    generateMealPlanMutation.mutate({
      startDate,
      endDate
    });
  };
  
  // Handle opening custom meal dialog
  const handleAddCustomMeal = (date: string, mealType?: string) => {
    setSelectedMealDate(date);
    if (mealType) {
      setSelectedMealType(mealType);
    } else {
      setSelectedMealType(""); // Reset if no meal type is provided
    }
    setAddCustomMealDialogOpen(true);
  };
  
  // Listen for custom meal events
  useEffect(() => {
    const handleCustomMealEvent = (e: CustomEvent) => {
      const { date, mealType } = e.detail;
      handleAddCustomMeal(date, mealType);
    };
    
    // Add event listener
    document.addEventListener('addCustomMeal', handleCustomMealEvent as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener('addCustomMeal', handleCustomMealEvent as EventListener);
    };
  }, []);
  
  // Apply a preset meal plan
  const applyPresetMealPlan = async (preset: any) => {
    try {
      // Clear any existing meal plans for this week
      const deleteRequests = currentMealPlans.map((meal: any) => 
        apiRequest("DELETE", `/api/meal-plans/${meal.id}`)
      );
      
      await Promise.all(deleteRequests);
      
      // Get the current week's dates based on weekOffset
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysFromMonday + (weekOffset * 7));
      
      // Generate meal plans for each day of the week based on the preset
      const createRequests = [];
      
      // Default meal types
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
      
      // Use preset meal count to determine how many meals per day
      const mealsPerDay = preset.mealCount || 3;
      const usedMealTypes = mealTypes.slice(0, mealsPerDay);
      
      // For each day of the week
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // For each meal type
        usedMealTypes.forEach(mealType => {
          // Create a meal plan entry
          createRequests.push(
            apiRequest("POST", "/api/meal-plans", {
              date: dateStr,
              mealType,
              calories: Math.round(preset.calorieTarget / usedMealTypes.length),
              protein: Math.round(preset.proteinTarget / usedMealTypes.length),
              carbs: Math.round(preset.carbsTarget / usedMealTypes.length),
              fat: Math.round(preset.fatTarget / usedMealTypes.length),
              customMealName: `${mealType} (${preset.category.replace('_', ' ')})`
            })
          );
        });
      }
      
      await Promise.all(createRequests);
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans", weekOffset] });
      
      toast({
        title: "Preset meal plan applied",
        description: `${preset.name} meal plan has been applied to your weekly calendar.`,
      });
    } catch (error) {
      console.error("Error applying preset meal plan:", error);
      toast({
        title: "Error applying preset meal plan",
        description: "Failed to apply the preset meal plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Meal Planner | NutriPlan</title>
        <meta name="description" content="Plan your weekly meals with our intuitive drag-and-drop meal planner. Create balanced meal plans and save them for later." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold gradient-text">Meal Planner</h1>
          
          <div className="flex flex-wrap gap-3">
            <PresetMealPlanSelector 
              onSelect={applyPresetMealPlan} 
              userPreferences={userPreferences}
            />
            <Button 
              variant="outline" 
              onClick={() => setSavePlanDialogOpen(true)}
              className="rounded-full border-2 gradient-border px-4 py-2 font-medium shadow-sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
            <Button 
              onClick={() => setGeneratePlanDialogOpen(true)}
              className="rounded-full gradient-button px-5 py-2 font-medium shadow-sm"
            >
              Generate Plan
            </Button>
          </div>
        </div>
        
        {/* Weekly Meal Plan Component */}
        <WeeklyMealPlan onAddCustomMeal={handleAddCustomMeal} />
        
        {/* Suggested Recipes */}
        {showSuggestions && (
          <div className="mt-8">
            <RecipeList 
              title="Recipe Suggestions"
              recipes={suggestedRecipes}
              variant="horizontal"
              showAddButtons
              actionText="Hide Suggestions"
              onAction={() => setShowSuggestions(false)}
              emptyText="No suggested recipes available"
            />
          </div>
        )}
        
        {/* Saved Meal Plans */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold gradient-text mb-6">Saved Meal Plans</h2>
          
          {savedMealPlans.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-10 text-center dark:bg-dark-card dark:border-gray-700">
              <div className="bg-purple-50 dark:bg-purple-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Calendar className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">No Saved Meal Plans</h3>
              <p className="text-gray-500 mb-6 dark:text-gray-400 max-w-md mx-auto">
                Save your weekly meal plans for quick access in the future.
              </p>
              <Button 
                onClick={() => setSavePlanDialogOpen(true)}
                className="rounded-full gradient-button px-6 py-2 font-medium shadow-sm"
              >
                Create Your First Meal Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedMealPlans.map((plan: any) => (
                <div 
                  key={plan.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden dark:bg-dark-card dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 dark:border-gray-700">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-sm mb-5">{plan.description || "No description"}</p>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20"
                        onClick={() => deleteMealPlanMutation.mutate(plan.id)}
                      >
                        Delete
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 rounded-full gradient-button"
                        onClick={() => loadMealPlan(plan.id)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Save Plan Dialog */}
        <Dialog open={savePlanDialogOpen} onOpenChange={setSavePlanDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">Save Current Meal Plan</DialogTitle>
              <DialogDescription>
                Save your current weekly meal plan for future use.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Weekly Plan"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="A balanced weekly meal plan"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSavePlanDialogOpen(false)}
                className="rounded-full px-4 py-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSavePlan}
                disabled={!planName || saveMealPlanMutation.isPending}
                className="rounded-full gradient-button px-5 py-2 font-medium shadow-sm"
              >
                {saveMealPlanMutation.isPending ? (
                  <>
                    <div className="gradient-spinner mr-2"></div>
                    Saving...
                  </>
                ) : "Save Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Generate Plan Dialog */}
        <Dialog open={generatePlanDialogOpen} onOpenChange={setGeneratePlanDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">Generate a Meal Plan</DialogTitle>
              <DialogDescription>
                Create a new meal plan based on your preferences and nutritional goals.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="start-date" className="text-right text-sm font-medium">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="end-date" className="text-right text-sm font-medium">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setGeneratePlanDialogOpen(false)}
                className="rounded-full px-4 py-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGeneratePlan}
                disabled={!startDate || !endDate || generateMealPlanMutation.isPending}
                className="rounded-full gradient-button px-5 py-2 font-medium shadow-sm"
              >
                {generateMealPlanMutation.isPending ? (
                  <>
                    <div className="gradient-spinner mr-2"></div>
                    Generating...
                  </>
                ) : "Generate Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Add Custom Meal Dialog */}
        <AddCustomMealDialog 
          open={addCustomMealDialogOpen}
          onOpenChange={setAddCustomMealDialogOpen}
          date={selectedMealDate}
          weekOffset={weekOffset}
          mealTypes={getMealTypes()}
          initialMealType={selectedMealType}
        />
      </main>
    </>
  );
}
