import { db } from './db';
import { recipes, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Sample recipe data with tags for different dietary preferences
const sampleRecipes = [
  {
    title: "High-Protein Chicken Breast",
    description: "Lean chicken breast with vegetables, perfect for muscle building",
    ingredients: ["chicken breast", "broccoli", "olive oil", "garlic", "salt", "pepper"],
    instructions: "1. Preheat oven to 375°F. 2. Season chicken breast. 3. Bake for 25 minutes. 4. Serve with steamed broccoli.",
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    calories: 350,
    protein: 40,
    carbs: 10,
    fat: 15,
    tags: ["high-protein", "muscle-gain", "gluten-free", "dairy-free"],
    category: "main",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=2574&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "Protein-Packed Quinoa Bowl",
    description: "Nutritious quinoa bowl with mixed vegetables and lean protein",
    ingredients: ["quinoa", "chicken", "bell peppers", "kale", "olive oil", "lemon juice"],
    instructions: "1. Cook quinoa according to package. 2. Grill chicken. 3. Sauté vegetables. 4. Combine and drizzle with olive oil and lemon.",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 15,
    tags: ["high-protein", "gluten-free", "muscle-gain", "balanced"],
    category: "main",
    imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=2574&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "Muscle-Building Salmon Plate",
    description: "Omega-rich salmon with sweet potatoes and greens",
    ingredients: ["salmon fillet", "sweet potato", "spinach", "olive oil", "lemon", "garlic"],
    instructions: "1. Bake salmon at 400°F for 15 minutes. 2. Roast sweet potatoes. 3. Sauté spinach with garlic. 4. Serve together.",
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    calories: 500,
    protein: 30,
    carbs: 40,
    fat: 25,
    tags: ["high-protein", "omega-3", "gluten-free", "muscle-gain"],
    category: "main",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2570&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "Vegan Protein Stir-Fry",
    description: "Plant-based protein with colorful vegetables",
    ingredients: ["tofu", "broccoli", "bell peppers", "carrots", "brown rice", "soy sauce", "garlic"],
    instructions: "1. Press and cube tofu. 2. Stir-fry vegetables and tofu. 3. Add sauce and simmer. 4. Serve over brown rice.",
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    calories: 380,
    protein: 20,
    carbs: 45,
    fat: 12,
    tags: ["vegan", "plant-based", "gluten-free", "dairy-free"],
    category: "main",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2570&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "High-Protein Breakfast Bowl",
    description: "Greek yogurt with nuts, seeds, and fresh fruit",
    ingredients: ["Greek yogurt", "almonds", "chia seeds", "berries", "honey"],
    instructions: "1. Add yogurt to a bowl. 2. Top with nuts, seeds, and berries. 3. Drizzle with honey.",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 320,
    protein: 25,
    carbs: 30,
    fat: 15,
    tags: ["breakfast", "high-protein", "vegetarian", "quick"],
    category: "breakfast",
    imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=2564&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "Protein Pancakes",
    description: "Fluffy pancakes with added protein powder",
    ingredients: ["oats", "protein powder", "egg whites", "banana", "cinnamon", "baking powder"],
    instructions: "1. Blend all ingredients. 2. Cook on a non-stick pan. 3. Serve with fresh fruit.",
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    calories: 350,
    protein: 30,
    carbs: 35,
    fat: 8,
    tags: ["breakfast", "high-protein", "muscle-gain"],
    category: "breakfast",
    imageUrl: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=2574&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "Turkey and Avocado Wrap",
    description: "High-protein lunch option with lean turkey",
    ingredients: ["turkey slices", "avocado", "lettuce", "tomato", "whole grain wrap", "mustard"],
    instructions: "1. Lay out wrap. 2. Layer ingredients. 3. Roll up tightly. 4. Cut in half to serve.",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 400,
    protein: 30,
    carbs: 30,
    fat: 20,
    tags: ["lunch", "high-protein", "quick"],
    category: "lunch",
    imageUrl: "https://images.unsplash.com/photo-1603046891746-c8925bd71e96?q=80&w=2574&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  },
  {
    title: "Power Protein Smoothie",
    description: "Perfect post-workout protein shake",
    ingredients: ["protein powder", "banana", "spinach", "almond milk", "peanut butter", "ice"],
    instructions: "1. Add all ingredients to blender. 2. Blend until smooth. 3. Serve immediately.",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 300,
    protein: 25,
    carbs: 30,
    fat: 10,
    tags: ["smoothie", "high-protein", "post-workout", "quick", "gluten-free"],
    category: "snack",
    imageUrl: "https://images.unsplash.com/photo-1553530979-fbb9e4aee36f?q=80&w=2574&auto=format&fit=crop",
    isPublic: true,
    userId: "system"
  }
];

export async function seedRecipes() {
  try {
    // First, check if we have a system user and create one if needed
    const [systemUser] = await db.select().from(users).where(eq(users.id, 'system'));
    
    if (!systemUser) {
      console.log('Creating system user for recipes...');
      await db.insert(users).values({
        id: 'system',
        email: 'system@meals.app',
        firstName: 'System',
        lastName: 'Generated',
        profileImageUrl: null
      });
      console.log('System user created successfully.');
    }
    
    // Check if we already have recipes in the database
    const existingRecipes = await db.select().from(recipes).where(eq(recipes.userId, 'system'));
    
    if (existingRecipes.length === 0) {
      console.log('Seeding database with initial recipes...');
      
      // Create recipes with proper userId format
      const recipesWithUserId = sampleRecipes.map(recipe => ({
        ...recipe,
        userId: 'system'
      }));
      
      // Insert all sample recipes
      await db.insert(recipes).values(recipesWithUserId);
      
      console.log(`Successfully seeded ${sampleRecipes.length} recipes.`);
    } else {
      console.log(`Database already has ${existingRecipes.length} system recipes. Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding recipes:', error);
  }
}