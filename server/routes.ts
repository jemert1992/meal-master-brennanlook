import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { eq, and, like, desc } from "drizzle-orm";
import { 
  users, recipes, mealPlans, foodLogs, groceryLists, groceryItems, chatHistory,
  presetMealPlans, userPreferences, 
  insertUserPreferencesSchema, insertPresetMealPlanSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - only respond with 'OK' for /api/health
  app.get('/api/health', (_req, res) => {
    res.status(200).send('OK');
  });

  // Body parsing middleware
  app.use(express.json());
  
  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Temporary fix for GET requests to /api/login
  app.get('/api/login', (req, res) => {
    // Simple login page that automatically submits a form
    res.send(`
      <html>
        <head>
          <title>Login</title>
          <script>
            window.onload = function() {
              document.getElementById('loginForm').submit();
            }
          </script>
        </head>
        <body>
          <h1>Logging in...</h1>
          <form id="loginForm" method="post" action="/api/login">
            <input type="hidden" name="email" value="demo@example.com">
            <input type="hidden" name="password" value="password">
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `);
  });
  
  // Route for simulating a new user (for testing onboarding flow)
  app.get('/api/new-user', (req, res) => {
    // Simple login page that automatically submits a form with a random email
    const randomEmail = `new-user-${Date.now()}@example.com`;
    res.send(`
      <html>
        <head>
          <title>Login as New User</title>
          <script>
            window.onload = function() {
              document.getElementById('loginForm').submit();
            }
          </script>
        </head>
        <body>
          <h1>Creating new account...</h1>
          <form id="loginForm" method="post" action="/api/login">
            <input type="hidden" name="email" value="${randomEmail}">
            <input type="hidden" name="password" value="password">
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `);
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const { search, category } = req.query;
      const recipes = await storage.getRecipes({ search, category });
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get('/api/recipes/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { search } = req.query;
      const recipes = await storage.getUserRecipes(userId, search);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching user recipes:", error);
      res.status(500).json({ message: "Failed to fetch user recipes" });
    }
  });

  app.get('/api/recipes/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipes = await storage.getRecentRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recent recipes:", error);
      res.status(500).json({ message: "Failed to fetch recent recipes" });
    }
  });

  app.get('/api/recipes/suggested', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipes = await storage.getSuggestedRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching suggested recipes:", error);
      res.status(500).json({ message: "Failed to fetch suggested recipes" });
    }
  });
  
  // Recipe generation endpoint
  app.post('/api/recipes/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { complexity = 'medium', dietaryGoal = '' } = req.body;
      
      // Get user preferences for dietary restrictions and goals
      const userPreferences = await storage.getUserPreferences(userId);
      
      if (!userPreferences) {
        return res.status(400).json({ message: "User preferences not found. Please complete your profile settings first." });
      }
      
      console.log(`Generating recipes for user ${userId} with complexity ${complexity} and dietary goal ${dietaryGoal}`);
      console.log("User preferences:", userPreferences);
      
      // For demonstration, we'll generate 3-5 recipes based on user preferences
      // In a real app, this would connect to an AI service or similar to generate custom recipes
      const suggestedRecipes = await storage.getSuggestedRecipes(userId);
      
      // Create copies of the suggested recipes but set them as user-owned
      const generatedRecipes = [];
      
      for (let i = 0; i < Math.min(suggestedRecipes.length, 5); i++) {
        const recipe = suggestedRecipes[i];
        
        // Skip if recipe is undefined
        if (!recipe) continue;
        
        // Add some variations based on complexity and dietary goal
        let title = recipe.title;
        if (complexity === 'simple') {
          title = `Quick & Easy ${title}`;
        } else if (complexity === 'complex') {
          title = `Gourmet ${title}`;
        }
        
        if (dietaryGoal === 'weight_loss') {
          title = `Lightened ${title}`;
        } else if (dietaryGoal === 'muscle_gain') {
          title = `Protein-Packed ${title}`;
        } else if (dietaryGoal === 'high_protein') {
          title = `High-Protein ${title}`;
        } else if (dietaryGoal === 'low_carb') {
          title = `Low-Carb ${title}`;
        }
        
        // Create a copy of the recipe for the user
        const newRecipe = await storage.createRecipe({
          title,
          ingredients: recipe.ingredients as string[],
          instructions: recipe.instructions as string,
          prepTime: recipe.prepTime as number,
          cookTime: recipe.cookTime as number,
          servings: recipe.servings as number,
          calories: recipe.calories as number,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          imageUrl: recipe.imageUrl,
          tags: recipe.tags,
          userId,
          isPublic: true,
        });
        
        generatedRecipes.push(newRecipe);
      }
      
      res.json(generatedRecipes);
    } catch (error) {
      console.error("Error generating recipes:", error);
      res.status(500).json({ message: "Failed to generate recipes" });
    }
  });

  app.get('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const recipe = await storage.getRecipe(parseInt(id));
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipe = await storage.createRecipe({
        ...req.body,
        userId,
      });
      res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.patch('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const recipe = await storage.getRecipe(parseInt(id));
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      if (recipe.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this recipe" });
      }
      
      const updatedRecipe = await storage.updateRecipe(parseInt(id), req.body);
      res.json(updatedRecipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const recipe = await storage.getRecipe(parseInt(id));
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      if (recipe.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this recipe" });
      }
      
      await storage.deleteRecipe(parseInt(id));
      res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Meal Plan routes
  app.get('/api/meal-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { weekOffset } = req.query;
      const offset = weekOffset ? parseInt(weekOffset) : 0;
      const mealPlans = await storage.getMealPlans(userId, offset);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get('/api/meal-plans/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const mealPlans = await storage.getCurrentMealPlans(userId);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching current meal plans:", error);
      res.status(500).json({ message: "Failed to fetch current meal plans" });
    }
  });

  app.get('/api/meal-plans/saved', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const savedPlans = await storage.getSavedMealPlans(userId);
      res.json(savedPlans);
    } catch (error) {
      console.error("Error fetching saved meal plans:", error);
      res.status(500).json({ message: "Failed to fetch saved meal plans" });
    }
  });
  
  app.get('/api/meal-plans/saved/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const savedPlan = await storage.getSavedMealPlan(parseInt(id));
      
      if (!savedPlan) {
        return res.status(404).json({ message: "Saved meal plan not found" });
      }
      
      if (savedPlan.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to access this meal plan" });
      }
      
      const entries = await storage.getSavedMealPlanEntries(parseInt(id));
      
      res.json({
        ...savedPlan,
        entries
      });
    } catch (error) {
      console.error("Error fetching saved meal plan:", error);
      res.status(500).json({ message: "Failed to fetch saved meal plan" });
    }
  });
  
  // Generate meal plan endpoint
  app.post('/api/meal-plans/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const savedMealPlan = await storage.generateMealPlan(userId, startDate, endDate);
      res.json(savedMealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });
  
  app.post('/api/meal-plans/saved', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, startDate, endDate, entries } = req.body;
      
      // Create the saved meal plan
      const savedPlan = await storage.createSavedMealPlan({
        userId,
        name,
        description,
        startDate,
        endDate
      });
      
      // Create entries if provided
      if (entries && Array.isArray(entries)) {
        for (const entry of entries) {
          await storage.createSavedMealPlanEntry({
            ...entry,
            savedMealPlanId: savedPlan.id
          });
        }
      }
      
      res.json(savedPlan);
    } catch (error) {
      console.error("Error creating saved meal plan:", error);
      res.status(500).json({ message: "Failed to create saved meal plan" });
    }
  });
  
  app.delete('/api/meal-plans/saved/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const savedPlan = await storage.getSavedMealPlan(parseInt(id));
      
      if (!savedPlan) {
        return res.status(404).json({ message: "Saved meal plan not found" });
      }
      
      if (savedPlan.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this meal plan" });
      }
      
      await storage.deleteSavedMealPlan(parseInt(id));
      res.json({ message: "Saved meal plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting saved meal plan:", error);
      res.status(500).json({ message: "Failed to delete saved meal plan" });
    }
  });
  


  app.post('/api/meal-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const mealPlan = await storage.createMealPlan({
        ...req.body,
        userId,
      });
      res.json(mealPlan);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  app.delete('/api/meal-plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const mealPlan = await storage.getMealPlan(parseInt(id));
      
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      if (mealPlan.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this meal plan" });
      }
      
      await storage.deleteMealPlan(parseInt(id));
      res.json({ message: "Meal plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      res.status(500).json({ message: "Failed to delete meal plan" });
    }
  });

  // Food Logs routes
  app.get('/api/food-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { timeRange } = req.query;
      const foodLogs = await storage.getFoodLogs(userId, timeRange || 'today');
      res.json(foodLogs);
    } catch (error) {
      console.error("Error fetching food logs:", error);
      res.status(500).json({ message: "Failed to fetch food logs" });
    }
  });

  app.get('/api/food-logs/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const foodLogs = await storage.getTodayFoodLogs(userId);
      res.json(foodLogs);
    } catch (error) {
      console.error("Error fetching today's food logs:", error);
      res.status(500).json({ message: "Failed to fetch today's food logs" });
    }
  });

  app.post('/api/food-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const foodLog = await storage.createFoodLog({
        ...req.body,
        userId,
      });
      res.json(foodLog);
    } catch (error) {
      console.error("Error creating food log:", error);
      res.status(500).json({ message: "Failed to create food log" });
    }
  });

  app.delete('/api/food-logs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const foodLog = await storage.getFoodLog(parseInt(id));
      
      if (!foodLog) {
        return res.status(404).json({ message: "Food log not found" });
      }
      
      if (foodLog.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this food log" });
      }
      
      await storage.deleteFoodLog(parseInt(id));
      res.json({ message: "Food log deleted successfully" });
    } catch (error) {
      console.error("Error deleting food log:", error);
      res.status(500).json({ message: "Failed to delete food log" });
    }
  });

  // Grocery Lists routes
  app.get('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const groceryLists = await storage.getGroceryLists(userId);
      res.json(groceryLists);
    } catch (error) {
      console.error("Error fetching grocery lists:", error);
      res.status(500).json({ message: "Failed to fetch grocery lists" });
    }
  });

  app.get('/api/grocery-lists/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentList = await storage.getCurrentGroceryList(userId);
      res.json(currentList);
    } catch (error) {
      console.error("Error fetching current grocery list:", error);
      res.status(500).json({ message: "Failed to fetch current grocery list" });
    }
  });

  app.get('/api/grocery-lists/current/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentList = await storage.getCurrentGroceryList(userId);
      
      if (!currentList) {
        return res.json([]);
      }
      
      const items = await storage.getGroceryItems(currentList.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching current grocery items:", error);
      res.status(500).json({ message: "Failed to fetch current grocery items" });
    }
  });

  app.post('/api/grocery-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const groceryList = await storage.createGroceryList({
        ...req.body,
        userId,
      });
      res.json(groceryList);
    } catch (error) {
      console.error("Error creating grocery list:", error);
      res.status(500).json({ message: "Failed to create grocery list" });
    }
  });

  app.post('/api/grocery-items', isAuthenticated, async (req: any, res) => {
    try {
      const groceryItem = await storage.createGroceryItem(req.body);
      res.json(groceryItem);
    } catch (error) {
      console.error("Error creating grocery item:", error);
      res.status(500).json({ message: "Failed to create grocery item" });
    }
  });

  app.patch('/api/grocery-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedItem = await storage.updateGroceryItem(parseInt(id), req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating grocery item:", error);
      res.status(500).json({ message: "Failed to update grocery item" });
    }
  });

  // Chat routes
  app.get('/api/chat-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const history = await storage.getChatHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });
  
  // User Preferences endpoints
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || {});
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  
  app.post('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const preferenceData = req.body;
      preferenceData.userId = userId;
      
      console.log("Received preference data:", JSON.stringify(preferenceData, null, 2));
      const result = insertUserPreferencesSchema.safeParse(preferenceData);
      if (!result.success) {
        console.error("Validation errors:", JSON.stringify(result.error.errors, null, 2));
        return res.status(400).json({ message: "Invalid user preferences data", errors: result.error.errors });
      }
      
      const preferences = await storage.upsertUserPreferences(preferenceData);
      res.json(preferences);
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({ message: "Failed to save user preferences" });
    }
  });
  
  // Preset Meal Plans endpoints
  app.get('/api/meal-plans/presets', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const presets = await storage.getPresetMealPlans(category);
      res.json(presets);
    } catch (error) {
      console.error("Error fetching preset meal plans:", error);
      res.status(500).json({ message: "Failed to fetch preset meal plans" });
    }
  });
  
  app.get('/api/meal-plans/presets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const preset = await storage.getPresetMealPlan(id);
      
      if (!preset) {
        return res.status(404).json({ message: "Preset meal plan not found" });
      }
      
      res.json(preset);
    } catch (error) {
      console.error("Error fetching preset meal plan:", error);
      res.status(500).json({ message: "Failed to fetch preset meal plan" });
    }
  });

  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Save user message
      await storage.saveChatMessage({
        userId,
        message,
        isUserMessage: true,
      });
      
      // Process message and generate response (rule-based)
      const response = generateAIResponse(message);
      
      // Save AI response
      await storage.saveChatMessage({
        userId,
        message: response,
        isUserMessage: false,
      });
      
      res.json({ response });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/health-bot/frequent-questions', isAuthenticated, async (req, res) => {
    // Return predefined frequent questions
    const frequentQuestions = [
      { text: "What are some low-carb breakfast ideas?" },
      { text: "How much protein do I need daily?" },
      { text: "What foods are good for weight loss?" },
      { text: "How can I meal prep for the week?" },
      { text: "What should I eat before and after a workout?" }
    ];
    
    res.json(frequentQuestions);
  });
  
  // Admin routes for preset meal plans
  app.post('/api/admin/meal-plans/presets', isAuthenticated, async (req: any, res) => {
    try {
      // For demo purposes, we'll allow all authenticated users to access admin functions
      // In a real app, you would check for admin role: if (req.user.role !== 'admin') return res.status(403).json({...})
      
      const presetData = req.body;
      const result = insertPresetMealPlanSchema.safeParse(presetData);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid preset meal plan data", errors: result.error.errors });
      }
      
      const preset = await storage.createPresetMealPlan(presetData);
      res.status(201).json(preset);
    } catch (error) {
      console.error("Error creating preset meal plan:", error);
      res.status(500).json({ message: "Failed to create preset meal plan" });
    }
  });
  
  app.patch('/api/admin/meal-plans/presets/:id', isAuthenticated, async (req: any, res) => {
    try {
      // For demo purposes, we'll allow all authenticated users to access admin functions
      const id = parseInt(req.params.id);
      const preset = await storage.updatePresetMealPlan(id, req.body);
      res.json(preset);
    } catch (error) {
      console.error("Error updating preset meal plan:", error);
      res.status(500).json({ message: "Failed to update preset meal plan" });
    }
  });
  
  app.delete('/api/admin/meal-plans/presets/:id', isAuthenticated, async (req: any, res) => {
    try {
      // For demo purposes, we'll allow all authenticated users to access admin functions
      const id = parseInt(req.params.id);
      await storage.deletePresetMealPlan(id);
      res.json({ message: "Preset meal plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting preset meal plan:", error);
      res.status(500).json({ message: "Failed to delete preset meal plan" });
    }
  });
  
  // Preset Meal Plans Routes
  app.get('/api/meal-plans/presets', isAuthenticated, async (req: any, res) => {
    try {
      const category = req.query.category as string | undefined;
      const presets = await storage.getPresetMealPlans(category);
      res.json(presets);
    } catch (error) {
      console.error("Error fetching preset meal plans:", error);
      res.status(500).json({ message: "Failed to fetch preset meal plans" });
    }
  });
  
  app.get('/api/meal-plans/presets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const preset = await storage.getPresetMealPlan(id);
      
      if (!preset) {
        return res.status(404).json({ message: "Preset meal plan not found" });
      }
      
      res.json(preset);
    } catch (error) {
      console.error("Error fetching preset meal plan:", error);
      res.status(500).json({ message: "Failed to fetch preset meal plan" });
    }
  });
  
  // User Preferences endpoints are already defined earlier in the file
  // Removed duplicate code to avoid conflicts in route handling

  const httpServer = createServer(app);
  return httpServer;
}

// Simple rule-based health bot response generator
function generateAIResponse(message: string): string {
  message = message.toLowerCase();
  
  if (message.includes("low-carb") && message.includes("breakfast")) {
    return "Great question! Here are some low-carb breakfast options: 1) Greek yogurt with berries and nuts, 2) Avocado and egg breakfast bowl, 3) Spinach and feta omelette, 4) Chia seed pudding with unsweetened almond milk. Would you like a specific recipe for any of these?";
  }
  
  if (message.includes("protein") && (message.includes("need") || message.includes("daily") || message.includes("much"))) {
    return "The recommended daily protein intake is about 0.8g per kg of body weight for average adults. For active individuals or those looking to build muscle, 1.2-2.0g per kg is often recommended. For a 70kg person, that's about 56-140g of protein per day, depending on your activity level and goals.";
  }
  
  if (message.includes("weight loss") && message.includes("food")) {
    return "Foods that support weight loss include: 1) High-protein foods like lean meats, fish, eggs, and legumes, 2) Fiber-rich vegetables and fruits, 3) Complex carbohydrates like whole grains, 4) Healthy fats from nuts, seeds, and avocados. The key is creating a sustainable calorie deficit while getting proper nutrition.";
  }

  if (message.includes("meal prep") || (message.includes("prepare") && message.includes("meals"))) {
    return "Meal prepping for the week is a great habit! Here's a simple approach: 1) Plan your menu for the week, 2) Shop for all ingredients on the weekend, 3) Prepare large batches of proteins, grains, and vegetables, 4) Store in portioned containers in the fridge or freezer. Would you like specific meal prep recipes?";
  }

  if (message.includes("before") && message.includes("after") && message.includes("workout")) {
    return "Pre-workout: Eat a meal with carbs and some protein 2-3 hours before, or a small snack 30-60 minutes before (banana or toast with nut butter). Post-workout: Within 30-45 minutes, consume protein to repair muscles and carbs to replenish glycogen (protein shake with fruit, chicken with rice, etc.).";
  }
  
  // Default response if no specific rule matches
  return "Thanks for your question about " + message.split(" ").slice(0, 3).join(" ") + "... I'd be happy to help with that. Could you provide more specific details about what you're looking for so I can give you tailored nutrition advice?";
}
