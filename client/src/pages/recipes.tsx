import { useState } from "react";
import RecipeList from "@/components/recipes/recipe-list";
import RecipeCard from "@/components/recipes/recipe-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";

const recipeSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, { message: "Ingredient name is required" }),
      quantity: z.string().optional(),
      unit: z.string().optional(),
    })
  ).min(1, { message: "At least one ingredient is required" }),
  instructions: z.string().min(10, { message: "Instructions must be at least 10 characters." }),
  prepTime: z.coerce.number().min(0).optional(),
  cookTime: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(1).optional(),
  calories: z.coerce.number().min(0).optional(),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export default function Recipes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // For recipe generation
  const [recipeComplexity, setRecipeComplexity] = useState("medium");
  const [dietaryGoal, setDietaryGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: allRecipes = [] } = useQuery({
    queryKey: ["/api/recipes", searchQuery, activeTab],
  });
  
  const { data: myRecipes = [] } = useQuery({
    queryKey: ["/api/recipes/my", searchQuery],
    enabled: activeTab === "my",
  });
  
  // Get user preferences to check if they're set up
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/preferences"],
  });
  
  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      ingredients: [{ name: "", quantity: "", unit: "" }],
      instructions: "",
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      imageUrl: "",
      tags: [],
      isPublic: true,
    },
  });
  
  const createRecipeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof recipeSchema>) => {
      return await apiRequest("POST", "/api/recipes", {
        ...values,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Recipe created",
        description: "Your recipe has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Generate AI recipes mutation
  const generateRecipesMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      // Call API to generate recipes based on preferences and parameters
      return await apiRequest("POST", "/api/recipes/generate", {
        userId: user?.id,
        complexity: recipeComplexity,
        dietaryGoal: dietaryGoal
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipes generated",
        description: "Your personalized recipes have been generated successfully",
      });
      setIsGenerateDialogOpen(false);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to generate recipes",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });
  
  const onSubmit = (values: z.infer<typeof recipeSchema>) => {
    createRecipeMutation.mutate(values);
  };
  
  const addIngredient = () => {
    const currentIngredients = form.getValues().ingredients;
    form.setValue("ingredients", [...currentIngredients, { name: "", quantity: "", unit: "" }]);
  };
  
  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues().ingredients;
    if (currentIngredients.length > 1) {
      form.setValue("ingredients", currentIngredients.filter((_, i) => i !== index));
    }
  };
  
  const displayedRecipes = activeTab === "my" ? myRecipes : allRecipes;
  
  return (
    <>
      <Helmet>
        <title>Recipes | NutriPlan</title>
        <meta name="description" content="Browse, create and save healthy recipes with detailed nutritional information and cooking instructions." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Preferences warning if not set */}
        {!userPreferences && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md shadow-sm dark:bg-amber-900/20 dark:border-amber-400">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Set Your Preferences</h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-200">
                  <p>For the best recipe recommendations, please set your dietary preferences in the <Link to="/preferences" className="font-medium underline">Preferences</Link> section first.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Recipes</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* AI Recipe Generator Dialog */}
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!userPreferences}
                  title={!userPreferences ? "Set your preferences first" : "Generate personalized recipes"}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 12H17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 12H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate AI Recipes
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Personalized Recipes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Recipe Complexity</Label>
                    <Select
                      value={recipeComplexity}
                      onValueChange={setRecipeComplexity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple (quick & easy)</SelectItem>
                        <SelectItem value="medium">Medium (balanced effort)</SelectItem>
                        <SelectItem value="complex">Complex (gourmet, advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dietary Goal</Label>
                    <Select
                      value={dietaryGoal}
                      onValueChange={setDietaryGoal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="high_protein">High Protein</SelectItem>
                        <SelectItem value="low_carb">Low Carb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Based on your preferences:
                    </p>
                    <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
                      <li>Dietary restrictions will be automatically applied</li>
                      <li>Generated recipes will consider your nutritional goals</li>
                      <li>Recipes will be added to your personal collection</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsGenerateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => generateRecipesMutation.mutate()}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : "Generate Recipes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Chicken Stir Fry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Ingredients</FormLabel>
                      {form.getValues().ingredients.map((_, index) => (
                        <div key={index} className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormControl>
                                  <Input placeholder="Ingredient name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="w-20">
                                <FormControl>
                                  <Input placeholder="Qty" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unit`}
                            render={({ field }) => (
                              <FormItem className="w-20">
                                <FormControl>
                                  <Input placeholder="Unit" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIngredient(index)}
                            className="h-10 w-10"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addIngredient}
                      >
                        Add Ingredient
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Step by step instructions..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="prepTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prep Time (min)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cookTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cook Time (min)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="servings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servings</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="calories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calories (per serving)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="protein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carbs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                          </FormControl>
                          <FormLabel className="m-0">Make this recipe public</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createRecipeMutation.isPending}>
                        {createRecipeMutation.isPending ? "Creating..." : "Create Recipe"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="my">My Recipes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.length > 0 ? (
                displayedRecipes.map((recipe: any) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    variant="vertical"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery 
                      ? `No recipes matching "${searchQuery}"`
                      : "No recipes available. Create your first recipe!"
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="my" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.length > 0 ? (
                myRecipes.map((recipe: any) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    variant="vertical"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery 
                      ? `No personal recipes matching "${searchQuery}"`
                      : "You haven't created any recipes yet. Click 'Create Recipe' to get started!"
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            <div className="text-center py-12 bg-gray-50 rounded-lg dark:bg-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                Your favorite recipes will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
