import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function PreferencesForm() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Default preferences state
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
      lowCarb: false,
    },
    goals: "weight_maintenance",
    activityLevel: "moderate",
    mealFrequency: 3,
    snacksPerDay: 1,
  });
  
  // Fetch user preferences
  const { data: userPreferences, isLoading } = useQuery({
    queryKey: ["/api/preferences"],
  });
  
  // Set form values when data is loaded
  useEffect(() => {
    if (userPreferences && Object.keys(userPreferences).length > 0) {
      setPreferences({
        dietaryRestrictions: userPreferences.dietaryRestrictions || preferences.dietaryRestrictions,
        goals: userPreferences.goals || preferences.goals,
        activityLevel: userPreferences.activityLevel || preferences.activityLevel,
        mealFrequency: userPreferences.mealFrequency || preferences.mealFrequency,
        snacksPerDay: userPreferences.snacksPerDay || preferences.snacksPerDay,
      });
    }
  }, [userPreferences]);
  
  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your meal planning preferences have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving preferences",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSave = () => {
    savePreferencesMutation.mutate(preferences);
  };
  
  // Handle dietary restriction toggle
  const handleRestrictionToggle = (restriction: string) => {
    setPreferences({
      ...preferences,
      dietaryRestrictions: {
        ...preferences.dietaryRestrictions,
        [restriction]: !preferences.dietaryRestrictions[restriction as keyof typeof preferences.dietaryRestrictions],
      },
    });
  };
  
  // Process loading or saving state
  const isProcessing = isLoading || savePreferencesMutation.isPending;
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Meal Planning Preferences</CardTitle>
        <CardDescription>
          Customize your meal planning experience based on your dietary needs and goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dietary Restrictions */}
        <div>
          <h3 className="text-lg font-medium mb-3">Dietary Restrictions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="vegan" className="cursor-pointer">Vegan</Label>
              <Switch 
                id="vegan" 
                checked={preferences.dietaryRestrictions.vegan}
                onCheckedChange={() => handleRestrictionToggle("vegan")}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vegetarian" className="cursor-pointer">Vegetarian</Label>
              <Switch 
                id="vegetarian" 
                checked={preferences.dietaryRestrictions.vegetarian}
                onCheckedChange={() => handleRestrictionToggle("vegetarian")}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gluten-free" className="cursor-pointer">Gluten-Free</Label>
              <Switch 
                id="gluten-free" 
                checked={preferences.dietaryRestrictions.glutenFree}
                onCheckedChange={() => handleRestrictionToggle("glutenFree")}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dairy-free" className="cursor-pointer">Dairy-Free</Label>
              <Switch 
                id="dairy-free" 
                checked={preferences.dietaryRestrictions.dairyFree}
                onCheckedChange={() => handleRestrictionToggle("dairyFree")}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nut-free" className="cursor-pointer">Nut-Free</Label>
              <Switch 
                id="nut-free" 
                checked={preferences.dietaryRestrictions.nutFree}
                onCheckedChange={() => handleRestrictionToggle("nutFree")}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="low-carb" className="cursor-pointer">Low-Carb</Label>
              <Switch 
                id="low-carb" 
                checked={preferences.dietaryRestrictions.lowCarb}
                onCheckedChange={() => handleRestrictionToggle("lowCarb")}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
        
        {/* Goals and Activity Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="goals" className="block mb-2">Nutritional Goal</Label>
            <Select
              value={preferences.goals}
              onValueChange={(value) => setPreferences({ ...preferences, goals: value })}
              disabled={isProcessing}
            >
              <SelectTrigger id="goals">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="weight_maintenance">Weight Maintenance</SelectItem>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="high_protein">High Protein</SelectItem>
                <SelectItem value="low_carb">Low Carb</SelectItem>
                <SelectItem value="better_health">Better Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="activity-level" className="block mb-2">Activity Level</Label>
            <Select
              value={preferences.activityLevel}
              onValueChange={(value) => setPreferences({ ...preferences, activityLevel: value })}
              disabled={isProcessing}
            >
              <SelectTrigger id="activity-level">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (hard daily exercise & physical job)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Meal Frequency */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="meal-frequency">Meals Per Day: {preferences.mealFrequency}</Label>
          </div>
          <Slider
            id="meal-frequency"
            min={1}
            max={5}
            step={1}
            value={[preferences.mealFrequency]}
            onValueChange={(value) => setPreferences({ ...preferences, mealFrequency: value[0] })}
            disabled={isProcessing}
            className="mb-6"
          />
          
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="snacks-per-day">Snacks Per Day: {preferences.snacksPerDay}</Label>
          </div>
          <Slider
            id="snacks-per-day"
            min={0}
            max={3}
            step={1}
            value={[preferences.snacksPerDay]}
            onValueChange={(value) => setPreferences({ ...preferences, snacksPerDay: value[0] })}
            disabled={isProcessing}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
}