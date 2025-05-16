import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar, Filter, Loader } from "lucide-react";

interface PresetMealPlanSelectorProps {
  onSelect: (preset: any) => void;
  userPreferences?: any;
}

export default function PresetMealPlanSelector({ onSelect, userPreferences }: PresetMealPlanSelectorProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [filteredPresets, setFilteredPresets] = useState<any[]>([]);
  
  // Fetch preset meal plans
  const { data: presets, isLoading } = useQuery({
    queryKey: ["/api/meal-plans/presets", category],
    queryFn: async () => {
      const url = category 
        ? `/api/meal-plans/presets?category=${category}`
        : "/api/meal-plans/presets";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch preset meal plans");
      }
      return response.json();
    }
  });
  
  // Filter presets based on user preferences
  useEffect(() => {
    if (!presets) {
      setFilteredPresets([]);
      return;
    }
    
    let filtered = [...presets];
    
    // If user has preferences, prioritize matching ones
    if (userPreferences) {
      // Sort by preferences match (this is a simple example algorithm)
      filtered.sort((a, b) => {
        let aScore = 0;
        let bScore = 0;
        
        // Match category with user goals
        if (userPreferences.goals === "weight_loss" && a.category === "weight_loss") aScore += 3;
        if (userPreferences.goals === "weight_loss" && b.category === "weight_loss") bScore += 3;
        
        if (userPreferences.goals === "weight_gain" && a.category === "weight_gain") aScore += 3;
        if (userPreferences.goals === "weight_gain" && b.category === "weight_gain") bScore += 3;
        
        if (userPreferences.goals === "muscle_building" && a.category === "muscle_building") aScore += 3;
        if (userPreferences.goals === "muscle_building" && b.category === "muscle_building") bScore += 3;
        
        // Match dietary restrictions
        if (userPreferences.dietaryRestrictions?.vegetarian && a.category === "vegetarian") aScore += 2;
        if (userPreferences.dietaryRestrictions?.vegetarian && b.category === "vegetarian") bScore += 2;
        
        if (userPreferences.dietaryRestrictions?.vegan && a.category === "vegan") aScore += 2;
        if (userPreferences.dietaryRestrictions?.vegan && b.category === "vegan") bScore += 2;
        
        if (userPreferences.dietaryRestrictions?.lowCarb && a.category === "low_carb") aScore += 2;
        if (userPreferences.dietaryRestrictions?.lowCarb && b.category === "low_carb") bScore += 2;
        
        // Match meal count
        if (Math.abs(a.mealCount - userPreferences.mealFrequency) < 
            Math.abs(b.mealCount - userPreferences.mealFrequency)) {
          aScore += 1;
        } else if (Math.abs(a.mealCount - userPreferences.mealFrequency) > 
                  Math.abs(b.mealCount - userPreferences.mealFrequency)) {
          bScore += 1;
        }
        
        return bScore - aScore; // Higher score first
      });
    }
    
    setFilteredPresets(filtered);
  }, [presets, userPreferences]);
  
  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategory(value === "all" ? undefined : value);
  };
  
  // Handle preset selection
  const handleSelectPreset = (preset: any) => {
    onSelect(preset);
    setOpen(false);
    toast({
      title: "Preset applied",
      description: `"${preset.name}" meal plan has been applied to your planner.`,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          <Calendar className="mr-2 h-4 w-4" />
          Apply Preset Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Apply Preset Meal Plan</DialogTitle>
          <DialogDescription>
            Choose from our preset meal plans to quickly set up your weekly meals.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Available Presets</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select
                value={category || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="weight_gain">Weight Gain</SelectItem>
                  <SelectItem value="muscle_building">Muscle Building</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="low_carb">Low Carb</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPresets && filteredPresets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
              {filteredPresets.map((preset) => (
                <Card key={preset.id} className="relative overflow-hidden">
                  {userPreferences && preset.category === (
                    userPreferences.dietaryRestrictions?.vegetarian ? "vegetarian" :
                    userPreferences.dietaryRestrictions?.vegan ? "vegan" :
                    userPreferences.dietaryRestrictions?.lowCarb ? "low_carb" :
                    userPreferences.goals === "weight_loss" ? "weight_loss" :
                    userPreferences.goals === "weight_gain" ? "weight_gain" :
                    userPreferences.goals === "muscle_building" ? "muscle_building" : ""
                  ) && (
                    <div className="absolute -right-8 -top-8 transform rotate-45 bg-primary w-32 h-8 flex items-end justify-center">
                      <span className="text-xs text-white pb-1">Recommended</span>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-1">
                          {preset.description || `A ${preset.category.replace('_', ' ')} focused meal plan`}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {preset.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Meals:</span> {preset.mealCount}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Calories:</span> {preset.calorieTarget}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Protein:</span> {preset.proteinTarget}g
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Carbs:</span> {preset.carbsTarget}g
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => handleSelectPreset(preset)}
                    >
                      Apply This Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {category 
                ? `No preset meal plans found for category "${category.replace('_', ' ')}".` 
                : "No preset meal plans available."}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}