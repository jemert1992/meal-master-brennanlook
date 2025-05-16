import { PlusIcon } from "lucide-react";
import { cn, getMealTypeColor } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface MealSlotProps {
  date: string;
  mealType: string;
  meal?: {
    id: number;
    recipeId?: number;
    customMealName?: string;
    calories?: number;
    imageUrl?: string;
  };
  userId: string;
}

export default function MealSlot({ date, mealType, meal, userId }: MealSlotProps) {
  const queryClient = useQueryClient();
  const colors = getMealTypeColor(mealType);

  const removeMealMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/meal-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      toast({
        title: "Meal removed",
        description: "Your meal has been removed from the plan",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveMeal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!meal?.id) return;
    
    removeMealMutation.mutate(meal.id);
  };

  // Function to open the custom meal dialog
  const handleAddCustomMeal = () => {
    // Dispatch a custom event to open the custom meal dialog
    const customEvent = new CustomEvent('addCustomMeal', { 
      detail: { date, mealType }
    });
    document.dispatchEvent(customEvent);
  };

  return (
    <div
      className={cn(
        "meal-slot p-3 mb-3 rounded-lg shadow-sm gradient-border",
        meal ? "border-2" : "border-[1px] border-dashed",
        "transition-all duration-300 hover:shadow-md"
      )}
    >
      <p className="gradient-text text-xs font-semibold mb-2">
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
      </p>
      
      {meal ? (
        <div className="flex items-center space-x-2">
          {meal.imageUrl && (
            <img
              src={meal.imageUrl}
              alt={meal.customMealName || "Meal"}
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
          )}
          <span className="text-sm flex-1 font-medium">{meal.customMealName}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors" 
            onClick={handleRemoveMeal}
          >
            ×
          </Button>
        </div>
      ) : (
        <button 
          className="w-full py-2 flex items-center justify-center rounded-lg bg-transparent hover:bg-primary/5 transition-colors"
          onClick={handleAddCustomMeal}
        >
          <span className="text-sm flex items-center font-medium text-primary">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add meal
          </span>
        </button>
      )}
    </div>
  );
}
