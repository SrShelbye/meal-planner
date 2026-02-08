export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    dietary_preferences?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Ingredient {
    id: string;
    name: string;
    default_unit: string;
    created_at: string;
}

export interface Recipe {
    id: string;
    user_id: string;
    title: string;
    instructions?: string;
    image_url?: string;
    prep_time?: number;
    macros?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
    created_at: string;
    updated_at: string;
}

export interface RecipeIngredient {
    id: string;
    recipe_id: string;
    ingredient_id: string;
    quantity: number;
    unit: string;
    created_at: string;
}

export interface MealPlan {
    id: string;
    user_id: string;
    recipe_id: string;
    planned_date: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    created_at: string;
}

export interface ShoppingListItem {
    id: string;
    user_id: string;
    ingredient_id?: string;
    ingredient_name: string;
    quantity: number;
    unit: string;
    is_purchased: boolean;
    created_at: string;
    updated_at: string;
}

export interface RecipeWithIngredients extends Recipe {
    ingredients: Array<RecipeIngredient & { ingredient: Ingredient }>;
}

export interface MealPlanWithRecipe extends MealPlan {
    recipe: RecipeWithIngredients;
}
