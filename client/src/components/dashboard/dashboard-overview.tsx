import { useQuery } from "@tanstack/react-query";
import StatsCard from "./stats-card";
import SimpleChart from "./simple-chart";
import { useAuth } from "@/hooks/useAuth";
import { calculateTotalNutrition } from "@/lib/utils";

export default function DashboardOverview() {
  const { user } = useAuth();
  
  const { data: mealPlans = [] } = useQuery({
    queryKey: ["/api/meal-plans/current"],
  });
  
  const { data: foodLogs = [] } = useQuery({
    queryKey: ["/api/food-logs/today"],
  });
  
  const { data: groceryItems = [] } = useQuery({
    queryKey: ["/api/grocery-lists/current/items"],
  });
  
  // Calculate daily calories from food logs
  const dailyNutrition = calculateTotalNutrition(foodLogs);
  const calorieGoal = user?.calorieGoal || 2200;
  const calorieProgress = Math.min(Math.round((dailyNutrition.calories / calorieGoal) * 100), 100);
  
  // Planned meals count
  const totalPlannedMeals = mealPlans.length;
  const totalWeeklyMeals = 21; // 3 meals a day for 7 days
  const plannedMealsProgress = Math.round((totalPlannedMeals / totalWeeklyMeals) * 100);
  
  // Grocery items
  const groceryItemCount = groceryItems.length;
  
  // Weight goal (mock data as this is not tracked yet)
  const currentWeight = user?.weight || 152.5;
  const goalWeight = 150;
  const remainingWeight = currentWeight - goalWeight;
  
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="font-heading text-heading-2 font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">Your Wellness Dashboard</h2>
        <p className="text-body text-muted-foreground mt-1 leading-relaxed">Track your daily nutrition, plan your meals, and reach your health goals.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Daily Calories"
          value={dailyNutrition.calories}
          icon={<i className="fa-solid fa-chart-column text-lg"></i>}
          iconBgColor="bg-secondary/10"
          iconColor="text-secondary"
          darkBgColor="dark:bg-secondary/20"
          progress={calorieProgress}
          total={calorieGoal}
        />
        
        <StatsCard
          title="Planned Meals"
          value={totalPlannedMeals}
          icon={<i className="fa-solid fa-calendar-days text-lg"></i>}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          darkBgColor="dark:bg-primary/20"
          progress={plannedMealsProgress}
          total={totalWeeklyMeals}
        />
        
        <StatsCard
          title="Grocery Items"
          value={groceryItemCount > 0 ? `${groceryItemCount} items` : "No items"}
          icon={<i className="fa-solid fa-basket-shopping text-lg"></i>}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-500"
          darkBgColor="dark:bg-amber-900/20"
          additionalInfo={groceryItemCount > 0 ? "List updated recently" : "Add items to your list"}
        />
        
        <StatsCard
          title="Weight Goal"
          value={remainingWeight > 0 ? `-${remainingWeight} lbs` : "Goal reached!"}
          icon={<i className="fa-solid fa-weight-scale text-lg"></i>}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
          darkBgColor="dark:bg-purple-900/20"
          additionalInfo={remainingWeight > 0 ? `${remainingWeight} lbs to goal (${goalWeight} lbs)` : `Current: ${currentWeight} lbs`}
        />
      </div>
      
      <div className="mt-8">
        <SimpleChart className="w-full" />
      </div>
    </div>
  );
}
