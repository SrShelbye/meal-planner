'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';

interface GeneratedRecipe {
    title: string;
    instructions: string;
    prep_time: number;
    ingredients: Array<{
        name: string;
        quantity: number;
        unit: string;
    }>;
    macros?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
}

export default function AIGeneratorPage() {
    const [ingredients, setIngredients] = useState<string[]>(['']);
    const [preferences, setPreferences] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    const addIngredientField = () => {
        setIngredients([...ingredients, '']);
    };

    const removeIngredientField = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, value: string) => {
        const updated = [...ingredients];
        updated[index] = value;
        setIngredients(updated);
    };

    const generateRecipe = async () => {
        const validIngredients = ingredients.filter(i => i.trim());

        if (validIngredients.length === 0) {
            setError('Añade al menos un ingrediente');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedRecipe(null);

        try {
            const response = await fetch('/api/ai/generate-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients: validIngredients,
                    preferences: preferences || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al generar receta');
            }

            setGeneratedRecipe(data.recipe);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al generar receta');
        } finally {
            setLoading(false);
        }
    };

    const saveRecipe = async () => {
        if (!generatedRecipe) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Debes iniciar sesión');
                return;
            }

            // Create recipe
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert({
                    user_id: user.id,
                    title: generatedRecipe.title,
                    instructions: generatedRecipe.instructions,
                    prep_time: generatedRecipe.prep_time,
                    macros: generatedRecipe.macros || {}
                })
                .select()
                .single();

            if (recipeError) throw recipeError;

            // Add ingredients
            for (const ing of generatedRecipe.ingredients) {
                // Check if ingredient exists
                let { data: existingIng } = await supabase
                    .from('ingredients')
                    .select('id')
                    .eq('name', ing.name.toLowerCase())
                    .single();

                let ingredientId: string;

                if (!existingIng) {
                    const { data: newIng, error } = await supabase
                        .from('ingredients')
                        .insert({ name: ing.name.toLowerCase(), default_unit: ing.unit })
                        .select()
                        .single();

                    if (error) throw error;
                    ingredientId = newIng.id;
                } else {
                    ingredientId = existingIng.id;
                }

                await supabase
                    .from('recipe_ingredients')
                    .insert({
                        recipe_id: recipe.id,
                        ingredient_id: ingredientId,
                        quantity: ing.quantity,
                        unit: ing.unit
                    });
            }

            alert('¡Receta guardada exitosamente!');
            queryClient.invalidateQueries({ queryKey: ['recipes'] });

            // Reset form
            setGeneratedRecipe(null);
            setIngredients(['']);
            setPreferences('');
        } catch (err) {
            console.error('Error saving recipe:', err);
            alert('Error al guardar la receta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 pb-24 sm:pb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Generador de Recetas con IA
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Dime qué ingredientes tienes y crearé una receta para ti
                        </p>
                    </div>

                    {!generatedRecipe ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
                            {/* Ingredients Input */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ingredientes disponibles *
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addIngredientField}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Añadir
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {ingredients.map((ing, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="Ej: pollo, arroz, tomate..."
                                                value={ing}
                                                onChange={(e) => updateIngredient(index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {ingredients.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeIngredientField(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preferences */}
                            <Textarea
                                label="Preferencias dietéticas (opcional)"
                                placeholder="Ej: vegetariano, bajo en carbohidratos, sin gluten, para 4 personas..."
                                value={preferences}
                                onChange={(e) => setPreferences(e.target.value)}
                                rows={3}
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={generateRecipe}
                                disabled={loading}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generando receta...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generar Receta con IA
                                    </>
                                )}
                            </Button>

                            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                <p className="text-sm text-indigo-900 dark:text-indigo-200">
                                    💡 <strong>Tip:</strong> Cuantos más ingredientes proporciones, más creativa será la receta generada.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
                            {/* Generated Recipe Display */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full mb-2">
                                        ✨ Generada con IA
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {generatedRecipe.title}
                                    </h2>
                                    {generatedRecipe.prep_time && (
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            ⏱️ {generatedRecipe.prep_time} minutos
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setGeneratedRecipe(null)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Macros */}
                            {generatedRecipe.macros && (
                                <div className="grid grid-cols-4 gap-4">
                                    {generatedRecipe.macros.calories && (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {generatedRecipe.macros.calories}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Calorías</p>
                                        </div>
                                    )}
                                    {generatedRecipe.macros.protein && (
                                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {generatedRecipe.macros.protein}g
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Proteína</p>
                                        </div>
                                    )}
                                    {generatedRecipe.macros.carbs && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {generatedRecipe.macros.carbs}g
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Carbos</p>
                                        </div>
                                    )}
                                    {generatedRecipe.macros.fat && (
                                        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 text-center">
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {generatedRecipe.macros.fat}g
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Grasas</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ingredients */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Ingredientes:</h3>
                                <ul className="space-y-2">
                                    {generatedRecipe.ingredients.map((ing, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {ing.quantity} {ing.unit} de {ing.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Instrucciones:</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {generatedRecipe.instructions}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={saveRecipe}
                                    disabled={loading}
                                    className="flex-1"
                                    size="lg"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Receta'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setGeneratedRecipe(null)}
                                    className="flex-1"
                                    size="lg"
                                >
                                    Generar Otra
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
