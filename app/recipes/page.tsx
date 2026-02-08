'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { RecipeCardSkeleton } from '@/components/ui/skeleton';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { ImportExportManager } from '@/components/import-export-manager';
import { RecipeWithIngredients } from '@/lib/types/database';
import { Plus, Search, X, Edit, Trash2 } from 'lucide-react';

export default function RecipesPage() {
    const [showForm, setShowForm] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: recipes, isLoading } = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('recipes')
                .select(`
          *,
          ingredients:recipe_ingredients(
            id,
            quantity,
            unit,
            ingredient:ingredients(*)
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as RecipeWithIngredients[];
        },
    });

    const filteredRecipes = recipes?.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDelete = async (recipeId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta receta?')) return;

        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', recipeId);

        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            setSelectedRecipe(null);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingRecipe(null);
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
    };

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 sm:pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Recetas</h1>
                            <p className="text-gray-600 mt-1">
                                {recipes?.length || 0} receta{recipes?.length !== 1 ? 's' : ''} guardada{recipes?.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Receta
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar recetas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Import/Export Section */}
                    <ImportExportManager />

                    {/* Recipe Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <RecipeCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredRecipes.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                {searchQuery ? 'No se encontraron recetas' : 'Aún no tienes recetas'}
                            </p>
                            {!searchQuery && (
                                <Button onClick={() => setShowForm(true)} className="mt-4">
                                    Crear tu primera receta
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRecipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={() => setSelectedRecipe(recipe)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {(showForm || editingRecipe) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingRecipe(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <RecipeForm
                                initialRecipe={editingRecipe || undefined}
                                onSuccess={handleFormSuccess}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingRecipe(null);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Recipe Detail Modal */}
                {selectedRecipe && !editingRecipe && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {selectedRecipe.image_url && (
                                <img
                                    src={selectedRecipe.image_url}
                                    alt={selectedRecipe.title}
                                    className="w-full h-64 object-cover rounded-t-2xl"
                                />
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedRecipe.title}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedRecipe(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {selectedRecipe.prep_time && (
                                    <p className="text-gray-600 mb-4">
                                        ⏱️ Tiempo: {selectedRecipe.prep_time} minutos
                                    </p>
                                )}

                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Ingredientes:</h3>
                                    <ul className="space-y-1">
                                        {selectedRecipe.ingredients?.map((ing) => (
                                            <li key={ing.id} className="text-gray-700">
                                                • {ing.quantity} {ing.unit} de {ing.ingredient.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedRecipe.instructions && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Instrucciones:</h3>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {selectedRecipe.instructions}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingRecipe(selectedRecipe);
                                            setSelectedRecipe(null);
                                        }}
                                        className="flex-1"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(selectedRecipe.id)}
                                        className="flex-1"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
