import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
// Import the enhanced meal planner component
import MealPlanner from "@/pages/meal-planner-enhanced";
import Recipes from "@/pages/recipes";
import NutritionTracker from "@/pages/nutrition-tracker";
import GroceryLists from "@/pages/grocery-lists";
import HealthBot from "@/pages/health-bot";
import Profile from "@/pages/profile";
import Preferences from "@/pages/preferences";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import LoginEnhanced from "@/pages/login-enhanced";
import Debug from "@/pages/debug";
import Header from "@/components/layout/header";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "./hooks/useAuth";
import OnboardingCheck from "@/components/onboarding/onboarding-check";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <OnboardingCheck>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navbar />
        <Component />
        <Footer />
      </div>
    </OnboardingCheck>
  );
}

function RouterWithAuth() {
  return (
    <Switch>
      <Route path="/login" component={LoginEnhanced} />
      <Route path="/debug" component={Debug} /> {/* Debug route that doesn't require auth */}
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/meal-planner" component={() => <ProtectedRoute component={MealPlanner} />} />
      <Route path="/recipes" component={() => <ProtectedRoute component={Recipes} />} />
      <Route path="/nutrition-tracker" component={() => <ProtectedRoute component={NutritionTracker} />} />
      <Route path="/grocery-lists" component={() => <ProtectedRoute component={GroceryLists} />} />
      <Route path="/health-bot" component={() => <ProtectedRoute component={HealthBot} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/preferences" component={() => <ProtectedRoute component={Preferences} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterWithAuth />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
