import RecipeCard from "./recipe-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecipeListProps {
  title: string;
  recipes: any[];
  actionText?: string;
  actionLink?: string;
  emptyText?: string;
  variant?: "horizontal" | "vertical";
  layout?: "grid" | "list";
  onAction?: () => void;
  showAddButtons?: boolean;
  onAddClick?: (recipeId: number) => void;
  className?: string;
}

export default function RecipeList({
  title,
  recipes,
  actionText,
  actionLink,
  emptyText = "No recipes found",
  variant = "horizontal",
  layout = "list",
  onAction,
  showAddButtons = false,
  onAddClick,
  className
}: RecipeListProps) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">{title}</h2>
        {actionText && (
          actionLink ? (
            <a href={actionLink} className="text-sm font-medium gradient-text hover:opacity-90 transition-opacity">
              {actionText}
            </a>
          ) : (
            <Button variant="link" onClick={onAction} className="text-sm font-medium gradient-text p-0 h-auto">
              {actionText}
            </Button>
          )
        )}
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-dark-card dark:border-gray-700">
          <div className="bg-purple-50 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M10 3.2C10 2.1 8.9 1.5 8 2l-4 2.3C3.4 4.5 3 5 3 5.5v2.3c0 .8.8 1.3 1.5 1l6-3a1 1 0 0 0 .5-.9V3.2Z"/><path d="M10 7.8c0-1.1-1.1-1.7-2-1.2l-4 2.3c-.6.3-1 .8-1 1.4v2.3c0 .8.8 1.3 1.5 1l6-3a1 1 0 0 0 .5-.9V7.8Z"/><path d="M19 5.3V3a1 1 0 0 0-1.4-.9l-6 3c-.4.2-.6.5-.6.9v6c0 .4.2.7.6.9l6 3a1 1 0 0 0 1.4-.9v-8.4c0-.3.3-.6.7-.5l2.1.5a1 1 0 0 0 1.2-.7v-.M12 12v6"/></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{emptyText}</p>
        </div>
      ) : (
        layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                variant={variant}
                showAddButton={showAddButtons}
                onAddClick={() => onAddClick && onAddClick(recipe.id)}
                className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {recipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                variant={variant}
                showAddButton={showAddButtons}
                onAddClick={() => onAddClick && onAddClick(recipe.id)}
                className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
