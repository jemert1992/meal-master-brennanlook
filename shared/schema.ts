import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, date, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Additional user profile fields
  weight: integer("weight"),
  height: integer("height"),
  age: integer("age"),
  calorieGoal: integer("calorie_goal").default(2200),
  dietaryPreferences: text("dietary_preferences").array(),
  allergies: text("allergies").array(),
  fitnessGoal: text("fitness_goal"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Recipe table
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  ingredients: jsonb("ingredients").notNull(),
  instructions: text("instructions").notNull(),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("recipe_user_id_idx").on(table.userId),
  };
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

// Meal Plan table
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  recipeId: integer("recipe_id").references(() => recipes.id),
  customMealName: text("custom_meal_name"),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("meal_plan_user_id_idx").on(table.userId),
    dateIdx: index("meal_plan_date_idx").on(table.date),
    uniqueMeal: uniqueIndex("unique_meal").on(table.userId, table.date, table.mealType),
  };
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;

// Food Log table
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  recipeId: integer("recipe_id").references(() => recipes.id),
  foodName: text("food_name").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("food_log_user_id_idx").on(table.userId),
    dateIdx: index("food_log_date_idx").on(table.date),
  };
});

export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogs.$inferSelect;

// Grocery List table
export const groceryLists = pgTable("grocery_lists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("grocery_list_user_id_idx").on(table.userId),
  };
});

export const insertGroceryListSchema = createInsertSchema(groceryLists).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGroceryList = z.infer<typeof insertGroceryListSchema>;
export type GroceryList = typeof groceryLists.$inferSelect;

// Grocery Items table
export const groceryItems = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull().references(() => groceryLists.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // produce, protein, dairy, pantry, etc.
  quantity: text("quantity"),
  isChecked: boolean("is_checked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    listIdIdx: index("grocery_item_list_id_idx").on(table.listId),
  };
});

export const insertGroceryItemSchema = createInsertSchema(groceryItems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type GroceryItem = typeof groceryItems.$inferSelect;

// Saved Meal Plans table
export const savedMealPlans = pgTable("saved_meal_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("saved_meal_plan_user_id_idx").on(table.userId),
  };
});

export const insertSavedMealPlanSchema = createInsertSchema(savedMealPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSavedMealPlan = z.infer<typeof insertSavedMealPlanSchema>;
export type SavedMealPlan = typeof savedMealPlans.$inferSelect;

// Saved Meal Plan Entries table
export const savedMealPlanEntries = pgTable("saved_meal_plan_entries", {
  id: serial("id").primaryKey(),
  savedMealPlanId: integer("saved_meal_plan_id").notNull().references(() => savedMealPlans.id),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id),
  customMealName: text("custom_meal_name"),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    savedMealPlanIdIdx: index("saved_meal_plan_entry_plan_id_idx").on(table.savedMealPlanId),
    dateIdx: index("saved_meal_plan_entry_date_idx").on(table.date),
  };
});

export const insertSavedMealPlanEntrySchema = createInsertSchema(savedMealPlanEntries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSavedMealPlanEntry = z.infer<typeof insertSavedMealPlanEntrySchema>;
export type SavedMealPlanEntry = typeof savedMealPlanEntries.$inferSelect;

// Chat history table
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("chat_history_user_id_idx").on(table.userId),
  };
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({ id: true, timestamp: true });
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;

// Preset Meal Plans table
export const presetMealPlans = pgTable("preset_meal_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // e.g., "high-protein", "low-carb", "vegan"
  planData: jsonb("plan_data").notNull(), // Structured meal plan data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPresetMealPlanSchema = createInsertSchema(presetMealPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPresetMealPlan = z.infer<typeof insertPresetMealPlanSchema>;
export type PresetMealPlan = typeof presetMealPlans.$inferSelect;

// User Preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dietaryRestrictions: jsonb("dietary_restrictions"), // e.g., { vegan: true, glutenFree: false }
  goals: text("goals"), // e.g., 'weight_loss', 'muscle_gain'
  activityLevel: text("activity_level"), // e.g., 'sedentary', 'active'
  mealFrequency: integer("meal_frequency").default(3), // Number of meals per day
  snacksPerDay: integer("snacks_per_day").default(1), // Number of snacks
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
    userIdUnique: uniqueIndex("user_preferences_user_id_unique").on(table.userId),
  };
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
