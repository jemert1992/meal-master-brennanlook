import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Activity } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  age: z.coerce.number().min(0).max(120).optional(),
  weight: z.coerce.number().min(0).max(500).optional(),
  height: z.coerce.number().min(0).max(300).optional(),
  calorieGoal: z.coerce.number().min(500).max(5000).optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  fitnessGoal: z.string().optional(),
});

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: userData } = useQuery({
    queryKey: ["/api/profile"],
  });
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      age: userData?.age || 0,
      weight: userData?.weight || 0,
      height: userData?.height || 0,
      calorieGoal: userData?.calorieGoal || 2200,
      dietaryPreferences: userData?.dietaryPreferences || [],
      allergies: userData?.allergies || [],
      fitnessGoal: userData?.fitnessGoal || "",
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      return await apiRequest("PATCH", "/api/profile", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };
  
  // Reset form when user data is loaded
  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        age: userData.age || 0,
        weight: userData.weight || 0,
        height: userData.height || 0,
        calorieGoal: userData.calorieGoal || 2200,
        dietaryPreferences: userData.dietaryPreferences || [],
        allergies: userData.allergies || [],
        fitnessGoal: userData.fitnessGoal || "",
      });
    }
  }, [userData, form]);
  
  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "pescatarian", label: "Pescatarian" },
    { value: "keto", label: "Keto" },
    { value: "paleo", label: "Paleo" },
    { value: "gluten-free", label: "Gluten-Free" },
    { value: "dairy-free", label: "Dairy-Free" },
    { value: "low-carb", label: "Low-Carb" },
  ];
  
  const allergyOptions = [
    { value: "peanuts", label: "Peanuts" },
    { value: "tree-nuts", label: "Tree Nuts" },
    { value: "milk", label: "Milk" },
    { value: "eggs", label: "Eggs" },
    { value: "fish", label: "Fish" },
    { value: "shellfish", label: "Shellfish" },
    { value: "soy", label: "Soy" },
    { value: "wheat", label: "Wheat" },
  ];
  
  const fitnessGoalOptions = [
    { value: "weight-loss", label: "Weight Loss" },
    { value: "muscle-gain", label: "Muscle Gain" },
    { value: "maintenance", label: "Maintenance" },
    { value: "general-health", label: "General Health" },
    { value: "athletic-performance", label: "Athletic Performance" },
  ];
  
  return (
    <>
      <Helmet>
        <title>Profile | NutriPlan</title>
        <meta name="description" content="Manage your profile preferences, dietary restrictions, and health goals." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-500 mb-4">{user?.email}</p>
                  <a href="/api/logout" className="w-full">
                    <Button variant="outline" className="w-full">
                      Sign Out
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal">
              <TabsList className="mb-6">
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="nutritional">
                  <Settings className="h-4 w-4 mr-2" />
                  Nutritional Preferences
                </TabsTrigger>
                <TabsTrigger value="goals">
                  <Activity className="h-4 w-4 mr-2" />
                  Health Goals
                </TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <TabsContent value="personal">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weight (lbs)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height (cm)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="nutritional">
                    <Card>
                      <CardHeader>
                        <CardTitle>Nutritional Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="dietaryPreferences"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dietary Preferences</FormLabel>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {dietaryOptions.map((option) => (
                                  <div key={option.value} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`diet-${option.value}`}
                                      checked={field.value?.includes(option.value)}
                                      onChange={(e) => {
                                        const newValue = e.target.checked
                                          ? [...(field.value || []), option.value]
                                          : (field.value || []).filter((val) => val !== option.value);
                                        field.onChange(newValue);
                                      }}
                                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <label htmlFor={`diet-${option.value}`}>{option.label}</label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allergies</FormLabel>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {allergyOptions.map((option) => (
                                  <div key={option.value} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`allergy-${option.value}`}
                                      checked={field.value?.includes(option.value)}
                                      onChange={(e) => {
                                        const newValue = e.target.checked
                                          ? [...(field.value || []), option.value]
                                          : (field.value || []).filter((val) => val !== option.value);
                                        field.onChange(newValue);
                                      }}
                                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <label htmlFor={`allergy-${option.value}`}>{option.label}</label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="goals">
                    <Card>
                      <CardHeader>
                        <CardTitle>Health Goals</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="calorieGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Calorie Goal</FormLabel>
                              <FormControl>
                                <Input type="number" min="500" max="5000" {...field} />
                              </FormControl>
                              <FormDescription>
                                Recommended daily calorie intake based on your profile is around 2,000-2,400 calories.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fitnessGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fitness Goal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a fitness goal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fitnessGoalOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}
