'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Download, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeWithIngredients, MealPlanWithRecipe } from '@/lib/types/database';

interface ExportData {
  recipes: RecipeWithIngredients[];
  mealPlans: MealPlanWithRecipe[];
  exportDate: string;
  version: string;
}

export function ImportExportManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const { data: recipes } = useQuery({
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

  const { data: mealPlans } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('meal_plan')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('user_id', user.id)
        .order('planned_date', { ascending: false });

      if (error) throw error;
      return data as MealPlanWithRecipe[];
    },
  });

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        recipes: recipes || [],
        mealPlans: mealPlans || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meal-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      setImportStatus('error');
      setImportMessage('Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    setImportMessage('');

    try {
      const text = await file.text();
      const importedData: ExportData = JSON.parse(text);

      // Validate data structure
      if (!importedData.recipes || !importedData.mealPlans) {
        throw new Error('Formato de archivo inválido');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      let importedRecipes = 0;
      let importedMealPlans = 0;

      // Import recipes
      for (const recipe of importedData.recipes) {
        try {
          // Create ingredients first if they don't exist
          const ingredientIds: string[] = [];
          
          for (const recipeIngredient of recipe.ingredients || []) {
            const { data: ingredientData } = await supabase
              .from('ingredients')
              .select('id')
              .eq('name', recipeIngredient.ingredient.name)
              .single();

            let ingredientId = ingredientData?.id;
            
            if (!ingredientId) {
              const { data: newIngredient } = await supabase
                .from('ingredients')
                .insert({
                  name: recipeIngredient.ingredient.name,
                  default_unit: recipeIngredient.unit
                })
                .select('id')
                .single();
              
              ingredientId = newIngredient?.id;
            }

            if (ingredientId) {
              ingredientIds.push(ingredientId);
            }
          }

          // Create recipe
          const { data: newRecipe } = await supabase
            .from('recipes')
            .insert({
              user_id: user.id,
              title: recipe.title,
              instructions: recipe.instructions,
              image_url: recipe.image_url,
              prep_time: recipe.prep_time,
              macros: recipe.macros
            })
            .select('id')
            .single();

          if (newRecipe) {
            // Create recipe ingredients
            for (let i = 0; i < ingredientIds.length; i++) {
              await supabase
                .from('recipe_ingredients')
                .insert({
                  recipe_id: newRecipe.id,
                  ingredient_id: ingredientIds[i],
                  quantity: recipe.ingredients[i].quantity,
                  unit: recipe.ingredients[i].unit
                });
            }
            
            importedRecipes++;
          }
        } catch (error) {
          console.error('Error importing recipe:', recipe.title, error);
        }
      }

      // Import meal plans
      for (const mealPlan of importedData.mealPlans) {
        try {
          // Find corresponding recipe by title
          const { data: existingRecipe } = await supabase
            .from('recipes')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', mealPlan.recipe.title)
            .single();

          if (existingRecipe) {
            await supabase
              .from('meal_plan')
              .insert({
                user_id: user.id,
                recipe_id: existingRecipe.id,
                planned_date: mealPlan.planned_date,
                meal_type: mealPlan.meal_type
              });
            
            importedMealPlans++;
          }
        } catch (error) {
          console.error('Error importing meal plan:', error);
        }
      }

      setImportStatus('success');
      setImportMessage(`Importación completada: ${importedRecipes} recetas y ${importedMealPlans} planes de comida`);

      // Refresh data
      window.location.reload();

    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setImportMessage('Error al importar datos. Verifica el formato del archivo.');
    } finally {
      setIsImporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      if (!recipes || recipes.length === 0) {
        setImportStatus('error');
        setImportMessage('No hay recetas para exportar');
        return;
      }

      // Create CSV content
      const headers = ['Título', 'Tiempo de preparación', 'Ingredientes', 'Instrucciones'];
      const rows = recipes.map(recipe => [
        recipe.title,
        recipe.prep_time || '',
        recipe.ingredients?.map(ing => `${ing.quantity} ${ing.unit} ${ing.ingredient.name}`).join('; ') || '',
        recipe.instructions || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `meal-planner-recipes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('CSV export failed:', error);
      setImportStatus('error');
      setImportMessage('Error al exportar a CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Importar y Exportar Datos
        </h3>

        <div className="space-y-4">
          {/* Export Section */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Exportar Datos</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={exportData}
                disabled={isExporting || !recipes}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exportando...' : 'Exportar JSON'}
              </Button>
              <Button
                onClick={exportToCSV}
                disabled={isExporting || !recipes}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isExporting ? 'Exportando...' : 'Exportar CSV'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Exporta todas tus recetas y planes de comida para hacer backup
            </p>
          </div>

          {/* Import Section */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Importar Datos</h4>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                disabled={isImporting}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isImporting ? 'Importando...' : 'Importar JSON'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Importa datos previamente exportados desde otro dispositivo
            </p>
          </div>

          {/* Status Messages */}
          {importStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              importStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {importStatus === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{importMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
