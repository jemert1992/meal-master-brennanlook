import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddCustomMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  weekOffset: number;
  mealTypes: string[];
  initialMealType?: string;
}

export default function AddCustomMealDialog({ 
  open, 
  onOpenChange, 
  date, 
  weekOffset,
  mealTypes,
  initialMealType
}: AddCustomMealDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Form state
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState(initialMealType || "");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  
  // Add custom meal mutation
  const addCustomMealMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/meal-plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans", weekOffset] });
      resetForm();
      onOpenChange(false);
      toast({
        title: "Custom meal added",
        description: "Your custom meal has been added to your meal plan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding custom meal",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Reset form
  const resetForm = () => {
    setMealName("");
    setMealType("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  };
  
  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!mealName || !mealType) {
      toast({
        title: "Missing information",
        description: "Please provide a meal name and type.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add meals.",
        variant: "destructive",
      });
      return;
    }
    
    // Create meal plan data
    const mealData = {
      userId: user.id,
      date,
      mealType,
      customMealName: mealName,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
    };
    
    addCustomMealMutation.mutate(mealData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Meal</DialogTitle>
          <DialogDescription>
            Add your own meal to your meal plan without creating a recipe.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meal-name" className="text-right">
                Meal Name
              </Label>
              <Input
                id="meal-name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Protein Smoothie"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meal-type" className="text-right">
                Meal Type
              </Label>
              <div className="col-span-3">
                <Select
                  value={mealType}
                  onValueChange={setMealType}
                  required
                >
                  <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                min="0"
                max="5000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protein" className="text-right">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                min="0"
                max="500"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carbs" className="text-right">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                max="500"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fat" className="text-right">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                min="0"
                max="500"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addCustomMealMutation.isPending}>
              {addCustomMealMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : "Add Meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}