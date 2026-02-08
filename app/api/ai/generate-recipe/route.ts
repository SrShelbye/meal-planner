import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { ingredients, preferences } = await request.json();

        if (!ingredients || ingredients.length === 0) {
            return NextResponse.json(
                { error: 'Se requieren ingredientes' },
                { status: 400 }
            );
        }

        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key no configurada' },
                { status: 500 }
            );
        }

        console.log('Starting recipe generation with ingredients:', ingredients);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Genera una receta usando estos ingredientes: ${ingredients.join(', ')}.
Preferencias dietéticas: ${preferences || 'ninguna'}.

Devuelve SOLO un objeto JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "title": "Nombre de la receta",
  "instructions": "Instrucciones paso a paso detalladas",
  "prep_time": 30,
  "ingredients": [
    { "name": "ingrediente", "quantity": 200, "unit": "gramos" }
  ],
  "macros": { "calories": 450, "protein": 25, "carbs": 30, "fat": 15 }
}

Asegúrate de incluir todos los ingredientes proporcionados en la lista de ingredientes de la receta.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('AI Response received');

        // Extract JSON from response (Gemini sometimes adds markdown formatting)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo extraer JSON de la respuesta');
        }

        const recipe = JSON.parse(jsonMatch[0]);

        // Validate response structure
        if (!recipe.title || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
            throw new Error('Respuesta de IA inválida');
        }

        return NextResponse.json({ recipe });
    } catch (error) {
        console.error('Error generating recipe:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json(
            { error: 'Error al generar receta', details: errorMessage },
            { status: 500 }
        );
    }
}
