'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { RecipeWithIngredients } from '@/lib/types/database';
import { Clock, ChefHat } from 'lucide-react';

interface RecipeCardProps {
    recipe: RecipeWithIngredients;
    onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
        >
            {recipe.image_url ? (
                <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-indigo-300 dark:text-indigo-400" />
                </div>
            )}

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {recipe.title}
                </h3>

                {recipe.instructions && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {recipe.instructions}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    {recipe.prep_time && (
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{recipe.prep_time} min</span>
                        </div>
                    )}

                    {recipe.ingredients && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                            {recipe.ingredients.length} ingredientes
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export function RecipeCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
        </div>
    );
}
