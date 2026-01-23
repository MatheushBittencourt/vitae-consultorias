-- Migration: Add recipe support to meal_foods
-- Allows meals to include recipes with their ingredients

-- Add recipe_id column to meal_foods table
ALTER TABLE meal_foods 
ADD COLUMN recipe_id INT NULL AFTER food_id,
ADD FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_meal_foods_recipe ON meal_foods(recipe_id);

-- Update comment for clarity
-- meal_foods can now reference:
--   1. food_id (from food_library) - single food item
--   2. recipe_id (from recipes) - a recipe with multiple ingredients
--   3. manual entry (name only, no food_id or recipe_id)
