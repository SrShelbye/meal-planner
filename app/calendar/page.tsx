'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { MealPlanWithRecipe, Recipe } from '@/lib/types/database';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_LABELS = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Merienda'
};

export default function CalendarPage() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showRecipeSelector, setShowRecipeSelector] = useState<{
        date: Date;
        mealType: typeof MEAL_TYPES[number];
    } | null>(null);
    const queryClient = useQueryClient();

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Fetch meal plan
    const { data: mealPlan } = useQuery({
        queryKey: ['mealPlan', weekStart.toISOString()],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const weekEnd = addDays(weekStart, 6);

            const { data, error } = await supabase
                .from('meal_plan')
                .select(`
          *,
          recipe:recipes(*)
        `)
                .eq('user_id', user.id)
                .gte('planned_date', weekStart.toISOString().split('T')[0])
                .lte('planned_date', weekEnd.toISOString().split('T')[0]);

            if (error) throw error;
            return data as MealPlanWithRecipe[];
        },
    });

    // Fetch all recipes for selector
    const { data: recipes } = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id)
                .order('title');

            if (error) throw error;
            return data as Recipe[];
        },
    });

    const addMealToCalendar = async (recipeId: string) => {
        if (!showRecipeSelector) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('meal_plan')
            .insert({
                user_id: user.id,
                recipe_id: recipeId,
                planned_date: format(showRecipeSelector.date, 'yyyy-MM-dd'),
                meal_type: showRecipeSelector.mealType
            });

        if (!error) {
            // Ask if user wants to add ingredients to shopping list
            const shouldAddToList = confirm(
                '¿Deseas añadir los ingredientes de esta receta a la lista de compras?'
            );

            if (shouldAddToList) {
                await addIngredientsToShoppingList(recipeId);
            }

            queryClient.invalidateQueries({ queryKey: ['mealPlan'] });
            setShowRecipeSelector(null);
        }
    };

    const addIngredientsToShoppingList = async (recipeId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get recipe ingredients
        const { data: recipeIngredients } = await supabase
            .from('recipe_ingredients')
            .select('*, ingredient:ingredients(*)')
            .eq('recipe_id', recipeId);

        if (!recipeIngredients) return;

        // Add each ingredient to shopping list
        for (const ing of recipeIngredients) {
            await supabase
                .from('shopping_list')
                .insert({
                    user_id: user.id,
                    ingredient_id: ing.ingredient_id,
                    ingredient_name: ing.ingredient.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    is_purchased: false
                });
        }

        queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    };

    const removeMeal = async (mealId: string) => {
        const { error } = await supabase
            .from('meal_plan')
            .delete()
            .eq('id', mealId);

        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['mealPlan'] });
        }
    };

    const getMealsForSlot = (date: Date, mealType: typeof MEAL_TYPES[number]) => {
        return mealPlan?.filter(meal =>
            isSameDay(new Date(meal.planned_date), date) && meal.meal_type === mealType
        ) || [];
    };

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 sm:pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Calendario de Comidas</h1>

                        {/* Week Navigator */}
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <span className="font-semibold text-lg text-gray-900 dark:text-white">
                                {format(weekStart, "d 'de' MMMM", { locale: es })} - {format(addDays(weekStart, 6), "d 'de' MMMM yyyy", { locale: es })}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-indigo-50 dark:bg-indigo-900/20 text-gray-900 dark:text-white">
                                        <th className="p-4 text-left font-semibold w-32">Comida</th>
                                        {weekDays.map((day) => (
                                            <th key={day.toISOString()} className="p-4 text-center font-semibold bg-indigo-50 dark:bg-indigo-900/20">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {format(day, 'EEEE', { locale: es })}
                                                </div>
                                                <div className="text-lg">
                                                    {format(day, 'd')}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {MEAL_TYPES.map((mealType) => (
                                        <tr key={mealType} className="border-t">
                                            <td className="p-4 font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                                                {MEAL_LABELS[mealType]}
                                            </td>
                                            {weekDays.map((day) => {
                                                const meals = getMealsForSlot(day, mealType);
                                                return (
                                                    <td key={day.toISOString()} className="p-2 align-top">
                                                        <div className="min-h-[80px] space-y-2">
                                                            {meals.map((meal) => (
                                                                <div
                                                                    key={meal.id}
                                                                    className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2 group relative"
                                                                >
                                                                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 line-clamp-2">
                                                                        {meal.recipe.title}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => removeMeal(meal.id)}
                                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-0.5"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => setShowRecipeSelector({ date: day, mealType })}
                                                                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                                                            >
                                                                <Plus className="w-5 h-5 mx-auto" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden">
                            {weekDays.map((day) => (
                                <div key={day.toISOString()} className="border-b dark:border-gray-700 last:border-b-0">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 font-semibold text-gray-900 dark:text-white">
                                        {format(day, "EEEE d 'de' MMMM", { locale: es })}
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {MEAL_TYPES.map((mealType) => {
                                            const meals = getMealsForSlot(day, mealType);
                                            return (
                                                <div key={mealType}>
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {MEAL_LABELS[mealType]}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {meals.map((meal) => (
                                                            <div
                                                                key={meal.id}
                                                                className="bg-indigo-100 rounded-lg p-3 flex justify-between items-center"
                                                            >
                                                                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                                                                    {meal.recipe.title}
                                                                </p>
                                                                <button
                                                                    onClick={() => removeMeal(meal.id)}
                                                                    className="text-red-500"
                                                                >
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => setShowRecipeSelector({ date: day, mealType })}
                                                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center"
                                                        >
                                                            <Plus className="w-5 h-5 mr-2" />
                                                            Añadir receta
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recipe Selector Modal */}
                {showRecipeSelector && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Selecciona una receta
                                </h2>
                                <button
                                    onClick={() => setShowRecipeSelector(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {format(showRecipeSelector.date, "EEEE d 'de' MMMM", { locale: es })} - {MEAL_LABELS[showRecipeSelector.mealType]}
                            </p>

                            <div className="space-y-2">
                                {recipes?.map((recipe) => (
                                    <button
                                        key={recipe.id}
                                        onClick={() => addMealToCalendar(recipe.id)}
                                        className="w-full text-left p-4 border dark:border-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-500 transition-colors"
                                    >
                                        <p className="font-medium text-gray-900 dark:text-white">{recipe.title}</p>
                                        {recipe.prep_time && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {recipe.prep_time} minutos
                                            </p>
                                        )}
                                    </button>
                                ))}

                                {(!recipes || recipes.length === 0) && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No tienes recetas aún. Crea una primero.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
