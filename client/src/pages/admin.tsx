import { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PresetMealPlans from "@/components/admin/preset-meal-plans";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("presets");
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | NutriPlan</title>
        <meta name="description" content="Admin dashboard for managing preset meal plans, user data, and system settings." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage meal plan presets, user data, and system settings.
          </p>
        </div>
        
        <Tabs defaultValue="presets" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto mb-6">
            <TabsTrigger value="presets">Preset Meal Plans</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-4">
            <PresetMealPlans />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
              User management functionality will be implemented in a future update.
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
              System settings will be implemented in a future update.
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}