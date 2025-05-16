import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  recipe: {
    id: number;
    title: string;
    prepTime?: number;
    cookTime?: number;
    calories?: number;
    tags?: string[];
    imageUrl?: string;
  };
  variant?: "horizontal" | "vertical";
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export default function RecipeCard({ 
  recipe, 
  variant = "horizontal",
  showAddButton = false,
  onAddClick,
  className
}: RecipeCardProps & { className?: string }) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  if (variant === "vertical") {
    return (
      <div className={cn(
        "recipe-card bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden dark:bg-dark-card dark:border-gray-700",
        className
      )}>
        <div className="relative">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <Flame className="h-12 w-12 text-purple-300 dark:text-purple-500" />
            </div>
          )}
          
          {recipe.calories && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/70 py-1 px-2 rounded-full text-xs font-medium flex items-center shadow-sm">
              <Flame className="h-3 w-3 mr-1 text-orange-500" />
              <span>{recipe.calories} cal</span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="font-semibold text-gray-800 mb-2 dark:text-white text-lg">{recipe.title}</h3>
          
          {totalTime > 0 && (
            <div className="flex items-center text-sm text-gray-500 mb-3 dark:text-gray-400">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-purple-400" />
                {totalTime} min
              </span>
            </div>
          )}
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {showAddButton && (
            <button 
              className="w-full px-4 py-2 rounded-full text-sm font-medium gradient-button shadow-sm mt-2"
              onClick={onAddClick}
            >
              Add to Meal Plan
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "recipe-card bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex dark:bg-dark-card dark:border-gray-700",
      className
    )}>
      {recipe.imageUrl ? (
        <div className="relative w-28 h-auto">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          {recipe.calories && (
            <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-black/70 py-0.5 px-1.5 rounded-full text-xs font-medium flex items-center shadow-sm text-[10px]">
              <Flame className="h-2.5 w-2.5 mr-0.5 text-orange-500" />
              <span>{recipe.calories}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-28 h-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
          <Flame className="h-8 w-8 text-purple-300 dark:text-purple-500" />
        </div>
      )}
      
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-gray-800 mb-1.5 dark:text-white">{recipe.title}</h3>
        
        {totalTime > 0 && (
          <div className="flex items-center text-sm text-gray-500 mb-2 dark:text-gray-400">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-purple-400" />
              {totalTime} min
            </span>
          </div>
        )}
        
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {showAddButton && (
          <button 
            className="mt-3 px-4 py-1.5 rounded-full text-xs font-medium gradient-button shadow-sm"
            onClick={onAddClick}
          >
            Add to Meal Plan
          </button>
        )}
      </div>
    </div>
  );
}
