import { Helmet } from "react-helmet";
import PreferencesForm from "@/components/user/preferences-form";

export default function PreferencesPage() {
  return (
    <>
      <Helmet>
        <title>Meal Planning Preferences | NutriPlan</title>
        <meta name="description" content="Customize your meal planning experience with dietary preferences, nutritional goals, and meal frequency options." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Preferences</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Personalize your meal planning experience by setting your dietary needs and goals.
          </p>
        </div>
        
        {/* User Preferences Form */}
        <PreferencesForm />
        
        {/* Additional Information Section */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Why Set Preferences?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Personalized Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get meal and recipe suggestions that match your dietary needs and preferences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Accurate Nutritional Goals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll use your activity level and goals to calculate appropriate calorie and macronutrient targets.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Simplified Meal Planning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate meal plans that respect your dietary restrictions and meal frequency preferences.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}