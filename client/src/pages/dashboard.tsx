import DashboardOverview from "@/components/dashboard/dashboard-overview";
import WeeklyMealPlan from "@/components/meal-planner/weekly-meal-plan";
import RecipeList from "@/components/recipes/recipe-list";
import NutritionOverview from "@/components/nutrition/nutrition-overview";
import GroceryList from "@/components/grocery/grocery-list";
import ChatWidget from "@/components/health-bot/chat-widget";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: recentRecipes = [] } = useQuery({
    queryKey: ["/api/recipes/recent"],
  });
  
  const { data: suggestedRecipes = [] } = useQuery({
    queryKey: ["/api/recipes/suggested"],
  });
  
  return (
    <>
      <Helmet>
        <title>Dashboard | NutriPlan</title>
        <meta name="description" content="Your personal nutrition dashboard with meal planning, recipes, nutrition tracking, and grocery lists." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Dashboard Overview */}
        <DashboardOverview />
        
        {/* Weekly Meal Plan */}
        <WeeklyMealPlan />
        
        {/* Recent Recipes and Suggested Recipes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecipeList 
            title="Recent Recipes" 
            recipes={recentRecipes}
            actionText="View all"
            actionLink="/recipes"
            emptyText="No recipes yet. Create your first recipe!"
          />
          
          <RecipeList 
            title="Suggested for You" 
            recipes={suggestedRecipes}
            actionText="Refresh"
            variant="vertical"
            layout="grid"
            showAddButtons
            emptyText="No suggested recipes available"
          />
        </div>
        
        {/* Nutrition Overview */}
        <NutritionOverview />
        
        {/* Grocery List */}
        <GroceryList />
        
        {/* Health Bot Chat Widget */}
        <ChatWidget />
      </main>
    </>
  );
}
