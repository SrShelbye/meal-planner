'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Recipe, RecipeWithIngredients } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface RecipeFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialRecipe?: RecipeWithIngredients;
}

interface IngredientInput {
    name: string;
    quantity: number;
    unit: string;
}

export function RecipeForm({ onSuccess, onCancel, initialRecipe }: RecipeFormProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(initialRecipe?.title || '');
    const [instructions, setInstructions] = useState(initialRecipe?.instructions || '');
    const [prepTime, setPrepTime] = useState(initialRecipe?.prep_time?.toString() || '');
    const [imageUrl, setImageUrl] = useState(initialRecipe?.image_url || '');

    const [ingredients, setIngredients] = useState<IngredientInput[]>(
        initialRecipe?.ingredients?.map(ing => ({
            name: ing.ingredient.name,
            quantity: Number(ing.quantity),
            unit: ing.unit
        })) || [{ name: '', quantity: 0, unit: 'gramos' }]
    );

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: 0, unit: 'gramos' }]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, field: keyof IngredientInput, value: string | number) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Debes iniciar sesión para crear recetas');
                return;
            }

            // Insert or update recipe
            const recipeData = {
                user_id: user.id,
                title,
                instructions,
                prep_time: prepTime ? parseInt(prepTime) : null,
                image_url: imageUrl || null,
            };

            let recipeId: string;

            if (initialRecipe) {
                // Update existing recipe
                const { error } = await supabase
                    .from('recipes')
                    .update(recipeData)
                    .eq('id', initialRecipe.id);

                if (error) throw error;
                recipeId = initialRecipe.id;

                // Delete old ingredients
                await supabase
                    .from('recipe_ingredients')
                    .delete()
                    .eq('recipe_id', recipeId);
            } else {
                // Create new recipe
                const { data, error } = await supabase
                    .from('recipes')
                    .insert(recipeData)
                    .select()
                    .single();

                if (error) throw error;
                recipeId = data.id;
            }

            // Insert ingredients
            for (const ing of ingredients.filter(i => i.name.trim())) {
                // Check if ingredient exists
                let { data: existingIng } = await supabase
                    .from('ingredients')
                    .select('id')
                    .eq('name', ing.name.toLowerCase())
                    .single();

                let ingredientId: string;

                if (!existingIng) {
                    // Create ingredient
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

                // Link ingredient to recipe
                await supabase
                    .from('recipe_ingredients')
                    .insert({
                        recipe_id: recipeId,
                        ingredient_id: ingredientId,
                        quantity: ing.quantity,
                        unit: ing.unit
                    });
            }

            onSuccess?.();
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Error al guardar la receta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-gray-100">
            <Input
                label="Nombre de la receta *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ej: Pasta al pesto"
            />

            <Textarea
                label="Instrucciones"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                placeholder="Describe paso a paso cómo preparar esta receta..."
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Tiempo de preparación (minutos)"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="30"
                />

                <Input
                    label="URL de imagen"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ingredientes *
                    </label>
                    <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                        <Plus className="w-4 h-4 mr-1" />
                        Añadir
                    </Button>
                </div>

                <div className="space-y-3">
                    {ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder="Ingrediente"
                                value={ing.name}
                                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                placeholder="Cantidad"
                                value={ing.quantity || ''}
                                onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                                className="w-24"
                            />
                            <Input
                                placeholder="Unidad"
                                value={ing.unit}
                                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                className="w-28"
                            />
                            {ingredients.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeIngredient(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Guardando...' : initialRecipe ? 'Actualizar' : 'Crear Receta'}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
}
