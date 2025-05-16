import {
  users,
  recipes,
  mealPlans,
  foodLogs,
  groceryLists,
  groceryItems,
  chatHistory,
  savedMealPlans,
  savedMealPlanEntries,
  presetMealPlans,
  userPreferences,
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type MealPlan,
  type InsertMealPlan,
  type FoodLog,
  type InsertFoodLog,
  type GroceryList,
  type InsertGroceryList,
  type PresetMealPlan,
  type InsertPresetMealPlan,
  type UserPreferences,
  type InsertUserPreferences,
  type GroceryItem,
  type InsertGroceryItem,
  type ChatHistory,
  type InsertChatHistory,
  type SavedMealPlan,
  type InsertSavedMealPlan,
  type SavedMealPlanEntry,
  type InsertSavedMealPlanEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, and, like, desc, gte, lte, sql, not, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  
  // Recipe operations
  getRecipes(options?: { search?: string, category?: string }): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  getUserRecipes(userId: string, search?: string): Promise<Recipe[]>;
  getRecentRecipes(userId: string): Promise<Recipe[]>;
  getSuggestedRecipes(userId: string): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipeData: Partial<Recipe>): Promise<Recipe>;
  deleteRecipe(id: number): Promise<void>;
  
  // Meal Plan operations
  getMealPlans(userId: string, weekOffset?: number): Promise<MealPlan[]>;
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  getCurrentMealPlans(userId: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  deleteMealPlan(id: number): Promise<void>;
  
  // Saved Meal Plan operations
  getSavedMealPlans(userId: string): Promise<SavedMealPlan[]>;
  getSavedMealPlan(id: number): Promise<SavedMealPlan | undefined>;
  getSavedMealPlanEntries(planId: number): Promise<SavedMealPlanEntry[]>;
  createSavedMealPlan(plan: InsertSavedMealPlan): Promise<SavedMealPlan>;
  createSavedMealPlanEntry(entry: InsertSavedMealPlanEntry): Promise<SavedMealPlanEntry>;
  deleteSavedMealPlan(id: number): Promise<void>;
  generateMealPlan(userId: string, startDate: string, endDate: string): Promise<SavedMealPlan>;
  
  // Food Log operations
  getFoodLogs(userId: string, timeRange: string): Promise<FoodLog[]>;
  getFoodLog(id: number): Promise<FoodLog | undefined>;
  getTodayFoodLogs(userId: string): Promise<FoodLog[]>;
  createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog>;
  deleteFoodLog(id: number): Promise<void>;
  
  // Grocery operations
  getGroceryLists(userId: string): Promise<GroceryList[]>;
  getCurrentGroceryList(userId: string): Promise<GroceryList | undefined>;
  getGroceryItems(listId: number): Promise<GroceryItem[]>;
  createGroceryList(groceryList: InsertGroceryList): Promise<GroceryList>;
  createGroceryItem(groceryItem: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: number, itemData: Partial<GroceryItem>): Promise<GroceryItem>;
  
  // Chat operations
  getChatHistory(userId: string): Promise<ChatHistory[]>;
  saveChatMessage(message: InsertChatHistory): Promise<ChatHistory>;
  
  // User Preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  
  // Preset Meal Plans operations
  getPresetMealPlans(category?: string): Promise<PresetMealPlan[]>;
  getPresetMealPlan(id: number): Promise<PresetMealPlan | undefined>;
  createPresetMealPlan(plan: InsertPresetMealPlan): Promise<PresetMealPlan>;
  updatePresetMealPlan(id: number, planData: Partial<PresetMealPlan>): Promise<PresetMealPlan>;
  deletePresetMealPlan(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Recipe operations
  async getRecipes(options?: { search?: string, category?: string }): Promise<Recipe[]> {
    let query = db.select().from(recipes);
    
    if (options?.search) {
      query = query.where(like(recipes.title, `%${options.search}%`));
    }
    
    if (options?.category) {
      // This assumes tags are stored as an array; adapt as needed based on your schema
      query = query.where(sql`${recipes.tags} @> ARRAY[${options.category}]::text[]`);
    }
    
    // Show public recipes and those created by the requesting user
    query = query.where(eq(recipes.isPublic, true));
    
    return await query.orderBy(desc(recipes.createdAt));
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async getUserRecipes(userId: string, search?: string): Promise<Recipe[]> {
    let query = db.select().from(recipes).where(eq(recipes.userId, userId));
    
    if (search) {
      query = query.where(like(recipes.title, `%${search}%`));
    }
    
    return await query.orderBy(desc(recipes.createdAt));
  }

  async getRecentRecipes(userId: string): Promise<Recipe[]> {
    try {
      // First try to get this user's recipes
      const userRecipes = await db
        .select()
        .from(recipes)
        .where(eq(recipes.userId, userId))
        .orderBy(desc(recipes.createdAt))
        .limit(3);
      
      // If we have at least 3 recipes from this user, return them
      if (userRecipes.length >= 3) {
        return userRecipes;
      }
      
      // Otherwise, get some public recipes to supplement
      // Get fewer public recipes based on how many user recipes we have
      const neededRecipes = 3 - userRecipes.length;
      
      // Using Drizzle's query builder for safety
      const publicRecipes = await db
        .select()
        .from(recipes)
        .where(and(
          eq(recipes.isPublic, true),
          ne(recipes.userId, userId)
        ))
        .orderBy(desc(recipes.createdAt))
        .limit(neededRecipes);
      
      // Combine the user's recipes with public ones
      return [...userRecipes, ...publicRecipes];
    } catch (error) {
      console.error("Error in getRecentRecipes:", error);
      return [];
    }
  }

  async getSuggestedRecipes(userId: string): Promise<Recipe[]> {
    try {
      // Get user preferences to filter recipes
      const userPrefs = await this.getUserPreferences(userId);
      
      console.log("Suggesting recipes for user with preferences:", userPrefs);
      
      // Start with a simple query that will work
      const baseQuery = db.select().from(recipes).where(eq(recipes.isPublic, true));
      
      // If user has preferences, apply them as filters
      if (userPrefs) {
        let goalBasedQuery;
        let dietaryQuery;
        
        // Handle dietary restrictions if present
        if (userPrefs.dietaryRestrictions) {
          try {
            let restrictions = [];
            
            // Handle both array and object formats for backward compatibility
            if (Array.isArray(userPrefs.dietaryRestrictions)) {
              restrictions = userPrefs.dietaryRestrictions;
              console.log("Dietary restrictions array format:", restrictions);
            } 
            else if (typeof userPrefs.dietaryRestrictions === 'object') {
              restrictions = Object.keys(userPrefs.dietaryRestrictions)
                .filter(key => userPrefs.dietaryRestrictions[key] === true);
              console.log("Dietary restrictions object format:", restrictions);
            }
            
            // Only apply filter if user has restrictions
            if (restrictions.length > 0) {
              // Match recipes that have the appropriate tags
              // For example, if user is gluten-free, find recipes with gluten-free tag
              const matchingTags = restrictions.map(restriction => {
                // Convert format like "Gluten-Free" to a tag like "gluten-free" for matching
                let tagName = restriction.toLowerCase().replace(/\s+/g, '-');
                return tagName;
              });
              
              console.log("Looking for recipes with tags:", matchingTags);
              
              // Get recipes that have any of the matching tags
              dietaryQuery = db.select().from(recipes)
                .where(
                  and(
                    eq(recipes.isPublic, true),
                    sql`${recipes.tags} && ARRAY[${matchingTags}]::text[]`
                  )
                );
            }
          } catch (err) {
            console.error("Error processing dietary restrictions:", err);
          }
        }
        
        // Handle goals-based filtering
        if (userPrefs.goals) {
          try {
            let goals = [];
            
            // Handle both array and string formats for backward compatibility
            if (Array.isArray(userPrefs.goals)) {
              goals = userPrefs.goals.map(g => typeof g === 'string' ? g.toLowerCase() : '');
              console.log("Goals array format:", goals);
            } 
            else if (typeof userPrefs.goals === 'string') {
              goals = [userPrefs.goals.toLowerCase()];
              console.log("Goals string format:", goals);
            }
            
            // Check if any of the goals match our filtering criteria
            const hasWeightLossGoal = goals.some(g => 
              g.includes('weight loss') || g.includes('lose weight'));
            
            const hasMuscleGoal = goals.some(g => 
              g.includes('muscle') || g.includes('strength') || g.includes('gain'));
            
            // Apply the appropriate filter based on user goals
            if (hasWeightLossGoal) {
              console.log("Applying weight loss filter");
              goalBasedQuery = db.select().from(recipes)
                .where(eq(recipes.isPublic, true))
                .orderBy(recipes.calories);
                
            } else if (hasMuscleGoal) {
              console.log("Applying muscle gain filter"); 
              goalBasedQuery = db.select().from(recipes)
                .where(eq(recipes.isPublic, true))
                .orderBy(desc(recipes.protein));
            }
          } catch (err) {
            console.error("Error processing fitness goals:", err);
          }
        }
        
        // Combine results from different queries, prioritizing dietary restrictions
        let results = [];
        
        if (dietaryQuery) {
          const dietaryResults = await dietaryQuery.limit(5);
          results = [...dietaryResults];
        }
        
        if (goalBasedQuery && results.length < 8) {
          const goalResults = await goalBasedQuery.limit(8 - results.length);
          
          // Add only recipes that aren't already in results
          const existingIds = new Set(results.map(r => r.id));
          const newGoalResults = goalResults.filter(r => !existingIds.has(r.id));
          
          results = [...results, ...newGoalResults];
        }
        
        // If we still need more recipes, get random ones
        if (results.length < 8) {
          const randomQuery = db.select().from(recipes)
            .where(eq(recipes.isPublic, true))
            .orderBy(sql`RANDOM()`)
            .limit(8 - results.length);
            
          const randomResults = await randomQuery;
          
          // Add only recipes that aren't already in results
          const existingIds = new Set(results.map(r => r.id));
          const newRandomResults = randomResults.filter(r => !existingIds.has(r.id));
          
          results = [...results, ...newRandomResults];
        }
        
        console.log(`Found ${results.length} suggested recipes for user ${userId}`);
        return results;
      }
      
      // If we don't have user preferences or combining results didn't work,
      // fall back to random recipes
      const fallbackResults = await baseQuery
        .orderBy(sql`RANDOM()`)
        .limit(8);
        
      console.log(`Found ${fallbackResults.length} suggested recipes (fallback) for user ${userId}`);
      return fallbackResults;
    } catch (error) {
      console.error("Error generating suggested recipes:", error);
      // Fallback to some random recipes if there's an error
      try {
        return await db
          .select()
          .from(recipes)
          .where(eq(recipes.isPublic, true))
          .orderBy(sql`RANDOM()`)
          .limit(4);
      } catch (fallbackError) {
        console.error("Even fallback query failed:", fallbackError);
        return [];
      }
    }
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: number, recipeData: Partial<Recipe>): Promise<Recipe> {
    const [updatedRecipe] = await db
      .update(recipes)
      .set({
        ...recipeData,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id))
      .returning();
    return updatedRecipe;
  }

  async deleteRecipe(id: number): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  // Meal Plan operations
  async getMealPlans(userId: string, weekOffset: number = 0): Promise<MealPlan[]> {
    // Calculate start and end dates based on week offset
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startDate = new Date(today);
    
    // Adjust to start from Monday of the current week + offset
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(today.getDate() - daysFromMonday + (weekOffset * 7));
    
    // End date is 6 days later (Sunday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(mealPlans)
      .where(and(
        eq(mealPlans.userId, userId),
        gte(mealPlans.date, startDateStr),
        lte(mealPlans.date, endDateStr)
      ));
  }

  async getMealPlan(id: number): Promise<MealPlan | undefined> {
    const [mealPlan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return mealPlan;
  }

  async getCurrentMealPlans(userId: string): Promise<MealPlan[]> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get meal plans for the current week (starting from today)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const endDate = sevenDaysLater.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(mealPlans)
      .where(and(
        eq(mealPlans.userId, userId),
        gte(mealPlans.date, today),
        lte(mealPlans.date, endDate)
      ));
  }

  async getSavedMealPlans(userId: string): Promise<SavedMealPlan[]> {
    return await db
      .select()
      .from(savedMealPlans)
      .where(eq(savedMealPlans.userId, userId))
      .orderBy(desc(savedMealPlans.createdAt));
  }

  async getSavedMealPlan(id: number): Promise<SavedMealPlan | undefined> {
    const [savedMealPlan] = await db.select().from(savedMealPlans).where(eq(savedMealPlans.id, id));
    return savedMealPlan;
  }

  async getSavedMealPlanEntries(planId: number): Promise<SavedMealPlanEntry[]> {
    return await db
      .select()
      .from(savedMealPlanEntries)
      .where(eq(savedMealPlanEntries.savedMealPlanId, planId))
      .orderBy(savedMealPlanEntries.date, savedMealPlanEntries.mealType);
  }

  async createSavedMealPlan(plan: InsertSavedMealPlan): Promise<SavedMealPlan> {
    const [savedMealPlan] = await db
      .insert(savedMealPlans)
      .values(plan)
      .returning();
    return savedMealPlan;
  }

  async createSavedMealPlanEntry(entry: InsertSavedMealPlanEntry): Promise<SavedMealPlanEntry> {
    const [savedMealPlanEntry] = await db
      .insert(savedMealPlanEntries)
      .values(entry)
      .returning();
    return savedMealPlanEntry;
  }

  async deleteSavedMealPlan(id: number): Promise<void> {
    // First delete all entries associated with this plan
    await db.delete(savedMealPlanEntries).where(eq(savedMealPlanEntries.savedMealPlanId, id));
    // Then delete the plan itself
    await db.delete(savedMealPlans).where(eq(savedMealPlans.id, id));
  }

  async generateMealPlan(userId: string, startDate: string, endDate: string): Promise<SavedMealPlan> {
    console.log(`Generating meal plan for user ${userId} from ${startDate} to ${endDate}`);
    
    // Create a new saved meal plan
    const planName = `Meal Plan: ${startDate} to ${endDate}`;
    const [savedMealPlan] = await db
      .insert(savedMealPlans)
      .values({
        userId,
        name: planName,
        description: "Generated meal plan based on your preferences and available recipes",
        startDate,
        endDate
      })
      .returning();
    
    // Get user preferences to determine meal frequency and types
    const userPrefs = await this.getUserPreferences(userId);
    console.log("User preferences for meal planning:", userPrefs);
    
    // Get suitable recipes - already filtered by preferences in getSuggestedRecipes
    let recipes = await this.getSuggestedRecipes(userId);
    
    // If we don't have enough recipes, get some more recipes (possibly unfiltered)
    if (recipes.length < 5) {
      const additionalRecipes = await db
        .select()
        .from(recipes)
        .where(eq(recipes.isPublic, true))
        .orderBy(sql`RANDOM()`)
        .limit(10);
        
      recipes = [...recipes, ...additionalRecipes];
    }
    
    console.log(`Got ${recipes.length} recipes for meal planning`);
    
    // Determine meal types based on user preferences
    let mealTypes = ["breakfast", "lunch", "dinner"];
    
    // Add snacks if user preferences specify them
    if (userPrefs?.snacksPerDay && userPrefs.snacksPerDay > 0) {
      for (let i = 0; i < Math.min(userPrefs.snacksPerDay, 3); i++) {
        mealTypes.push("snack");
      }
    }
    
    // Generate entries for each day in the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    // First delete any existing meal plans in this date range
    try {
      await db
        .delete(mealPlans)
        .where(and(
          eq(mealPlans.userId, userId),
          gte(mealPlans.date, startDate),
          lte(mealPlans.date, endDate)
        ));
      console.log(`Deleted existing meal plans for date range ${startDate} to ${endDate}`);
    } catch (error) {
      console.error("Error deleting existing meal plans:", error);
    }
    
    const createdEntries = [];
    
    for (let i = 0; i < daysBetween; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Add entries for each meal type based on user preferences
      for (const mealType of mealTypes) {
        if (recipes.length > 0) {
          // Get a subset of recipes for this specific meal type
          // In a real app, you'd match recipes to meal types more intelligently
          // Maybe using recipe tags or other attributes
          const availableRecipes = [...recipes]; // Copy array to avoid modifying original
          
          // For variety, shuffle the recipes
          for (let i = availableRecipes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableRecipes[i], availableRecipes[j]] = [availableRecipes[j], availableRecipes[i]];
          }
          
          // Take the first recipe from the shuffled list
          const selectedRecipe = availableRecipes[0];
          
          // Create the saved meal plan entry
          const [savedEntry] = await db
            .insert(savedMealPlanEntries)
            .values({
              savedMealPlanId: savedMealPlan.id,
              date: dateStr,
              mealType,
              recipeId: selectedRecipe.id,
              customMealName: null,
              calories: selectedRecipe.calories,
              protein: selectedRecipe.protein,
              carbs: selectedRecipe.carbs,
              fat: selectedRecipe.fat
            })
            .returning();
          
          createdEntries.push(savedEntry);
          
          // ALSO create a regular meal plan entry so it shows in the calendar view
          await db
            .insert(mealPlans)
            .values({
              userId,
              date: dateStr,
              mealType,
              name: selectedRecipe.title || '', 
              description: '',
              recipeId: selectedRecipe.id,
              calories: selectedRecipe.calories,
              protein: selectedRecipe.protein,
              carbs: selectedRecipe.carbs,
              fat: selectedRecipe.fat
            });
            
          // Remove the selected recipe to avoid duplicates in the same day
          // But keep at least 3 recipes in the pool
          if (recipes.length > 3) {
            recipes.splice(recipes.indexOf(selectedRecipe), 1);
          }
        }
      }
    }
    
    console.log(`Successfully generated meal plan with ID ${savedMealPlan.id}`);
    return savedMealPlan;
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    try {
      // First check if there's already a meal plan for this user, date, and meal type
      const existingPlans = await db
        .select()
        .from(mealPlans)
        .where(and(
          eq(mealPlans.userId, mealPlan.userId),
          eq(mealPlans.date, mealPlan.date),
          eq(mealPlans.mealType, mealPlan.mealType)
        ));
      
      // If one exists, update it
      if (existingPlans.length > 0) {
        const [updatedPlan] = await db
          .update(mealPlans)
          .set({
            ...mealPlan,
            updatedAt: new Date(),
          })
          .where(eq(mealPlans.id, existingPlans[0].id))
          .returning();
        return updatedPlan;
      }
      
      // Otherwise, create a new one
      const [newMealPlan] = await db
        .insert(mealPlans)
        .values(mealPlan)
        .returning();
      return newMealPlan;
    } catch (error) {
      console.error("Error in createMealPlan:", error);
      throw error;
    }
  }

  async deleteMealPlan(id: number): Promise<void> {
    await db.delete(mealPlans).where(eq(mealPlans.id, id));
  }

  // Food Log operations
  async getFoodLogs(userId: string, timeRange: string): Promise<FoodLog[]> {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    
    // Adjust dates based on time range
    if (timeRange === 'today') {
      // Keep startDate as today
    } else if (timeRange === 'week') {
      // Start from beginning of current week (Monday)
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to start from Monday
      startDate.setDate(today.getDate() - diff);
    } else if (timeRange === 'month') {
      // Start from beginning of current month
      startDate.setDate(1);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(foodLogs)
      .where(and(
        eq(foodLogs.userId, userId),
        gte(foodLogs.date, startDateStr),
        lte(foodLogs.date, endDateStr)
      ))
      .orderBy(foodLogs.mealType);
  }

  async getFoodLog(id: number): Promise<FoodLog | undefined> {
    const [foodLog] = await db.select().from(foodLogs).where(eq(foodLogs.id, id));
    return foodLog;
  }

  async getTodayFoodLogs(userId: string): Promise<FoodLog[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(foodLogs)
      .where(and(
        eq(foodLogs.userId, userId),
        eq(foodLogs.date, today)
      ))
      .orderBy(foodLogs.mealType);
  }

  async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
    const [newFoodLog] = await db
      .insert(foodLogs)
      .values(foodLog)
      .returning();
    return newFoodLog;
  }

  async deleteFoodLog(id: number): Promise<void> {
    await db.delete(foodLogs).where(eq(foodLogs.id, id));
  }

  // Grocery operations
  async getGroceryLists(userId: string): Promise<GroceryList[]> {
    return await db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.userId, userId))
      .orderBy(desc(groceryLists.createdAt));
  }

  async getCurrentGroceryList(userId: string): Promise<GroceryList | undefined> {
    // Get the most recently created grocery list for this user
    const [currentList] = await db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.userId, userId))
      .orderBy(desc(groceryLists.createdAt))
      .limit(1);
    
    return currentList;
  }

  async getGroceryItems(listId: number): Promise<GroceryItem[]> {
    return await db
      .select()
      .from(groceryItems)
      .where(eq(groceryItems.listId, listId))
      .orderBy(groceryItems.category);
  }

  async createGroceryList(groceryList: InsertGroceryList): Promise<GroceryList> {
    const [newList] = await db
      .insert(groceryLists)
      .values(groceryList)
      .returning();
    return newList;
  }

  async createGroceryItem(groceryItem: InsertGroceryItem): Promise<GroceryItem> {
    const [newItem] = await db
      .insert(groceryItems)
      .values(groceryItem)
      .returning();
    return newItem;
  }

  async updateGroceryItem(id: number, itemData: Partial<GroceryItem>): Promise<GroceryItem> {
    const [updatedItem] = await db
      .update(groceryItems)
      .set({
        ...itemData,
        updatedAt: new Date(),
      })
      .where(eq(groceryItems.id, id))
      .returning();
    return updatedItem;
  }

  // Chat operations
  async getChatHistory(userId: string): Promise<ChatHistory[]> {
    return await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(chatHistory.timestamp);
  }

  async saveChatMessage(message: InsertChatHistory): Promise<ChatHistory> {
    const [savedMessage] = await db
      .insert(chatHistory)
      .values(message)
      .returning();
    return savedMessage;
  }
  
  // User Preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }
  
  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [existingPreferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, preferences.userId));
    
    if (existingPreferences) {
      const [updatedPreferences] = await db
        .update(userPreferences)
        .set({
          ...preferences,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, preferences.userId))
        .returning();
      return updatedPreferences;
    } else {
      const [newPreferences] = await db
        .insert(userPreferences)
        .values(preferences)
        .returning();
      return newPreferences;
    }
  }
  
  // Preset Meal Plans operations
  async getPresetMealPlans(category?: string): Promise<PresetMealPlan[]> {
    let query = db.select().from(presetMealPlans);
    
    if (category) {
      query = query.where(eq(presetMealPlans.category, category));
    }
    
    return await query;
  }
  
  async getPresetMealPlan(id: number): Promise<PresetMealPlan | undefined> {
    const [plan] = await db
      .select()
      .from(presetMealPlans)
      .where(eq(presetMealPlans.id, id));
    return plan;
  }
  
  async createPresetMealPlan(plan: InsertPresetMealPlan): Promise<PresetMealPlan> {
    const [newPlan] = await db
      .insert(presetMealPlans)
      .values(plan)
      .returning();
    return newPlan;
  }
  
  async updatePresetMealPlan(id: number, planData: Partial<PresetMealPlan>): Promise<PresetMealPlan> {
    const [updatedPlan] = await db
      .update(presetMealPlans)
      .set({
        ...planData,
        updatedAt: new Date(),
      })
      .where(eq(presetMealPlans.id, id))
      .returning();
    return updatedPlan;
  }
  
  async deletePresetMealPlan(id: number): Promise<void> {
    await db
      .delete(presetMealPlans)
      .where(eq(presetMealPlans.id, id));
  }
}

export const storage = new DatabaseStorage();
