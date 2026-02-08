'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingListItem } from '@/lib/types/database';
import { Check, Plus, Trash2, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF types
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export default function ShoppingListPage() {
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');
    const queryClient = useQueryClient();

    const { data: items, isLoading } = useQuery({
        queryKey: ['shoppingList'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('shopping_list')
                .select('*')
                .eq('user_id', user.id)
                .order('is_purchased')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as ShoppingListItem[];
        },
    });

    // Aggregate items with same name and unit
    const aggregatedItems = items?.reduce((acc, item) => {
        const key = `${item.ingredient_name}-${item.unit}`;
        const existing = acc.find(i => `${i.ingredient_name}-${i.unit}` === key);

        if (existing && !item.is_purchased && !existing.is_purchased) {
            existing.quantity = Number(existing.quantity) + Number(item.quantity);
            existing._ids = [...(existing._ids || [existing.id]), item.id];
        } else {
            acc.push({ ...item, _ids: [item.id] });
        }

        return acc;
    }, [] as (ShoppingListItem & { _ids?: string[] })[]) || [];

    const togglePurchased = async (itemId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('shopping_list')
            .update({ is_purchased: !currentStatus })
            .eq('id', itemId);

        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
        }
    };

    const addManualItem = async () => {
        if (!newItemName || !newItemQuantity) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('shopping_list')
            .insert({
                user_id: user.id,
                ingredient_name: newItemName.toLowerCase(),
                quantity: parseFloat(newItemQuantity),
                unit: newItemUnit || 'unidad',
                is_purchased: false
            });

        if (!error) {
            setNewItemName('');
            setNewItemQuantity('');
            setNewItemUnit('');
            queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
        }
    };

    const deleteItem = async (itemId: string) => {
        const { error } = await supabase
            .from('shopping_list')
            .delete()
            .eq('id', itemId);

        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
        }
    };

    const clearPurchased = async () => {
        if (!confirm('¿Eliminar todos los items comprados?')) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('shopping_list')
            .delete()
            .eq('user_id', user.id)
            .eq('is_purchased', true);

        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Lista de Compras', 14, 20);

        doc.setFontSize(10);
        doc.text(`Generada: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

        const pendingItems = aggregatedItems.filter(item => !item.is_purchased);
        const tableData = pendingItems.map((item, index) => [
            index + 1,
            item.ingredient_name,
            `${item.quantity} ${item.unit}`,
            '☐'
        ]);

        doc.autoTable({
            startY: 35,
            head: [['#', 'Ingrediente', 'Cantidad', 'Check']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
        });

        doc.save('lista-de-compras.pdf');
    };

    const pendingCount = aggregatedItems.filter(i => !i.is_purchased).length;
    const completedCount = aggregatedItems.filter(i => i.is_purchased).length;

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 sm:pb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lista de Compras</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{completedCount} completado{completedCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Add Manual Item */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Añadir item manual</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ingrediente"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                placeholder="Cantidad"
                                value={newItemQuantity}
                                onChange={(e) => setNewItemQuantity(e.target.value)}
                                className="w-24"
                            />
                            <Input
                                placeholder="Unidad"
                                value={newItemUnit}
                                onChange={(e) => setNewItemUnit(e.target.value)}
                                className="w-28"
                            />
                            <Button onClick={addManualItem}>
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-6">
                        <Button
                            variant="outline"
                            onClick={exportToPDF}
                            disabled={pendingCount === 0}
                            className="flex-1"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={clearPurchased}
                            disabled={completedCount === 0}
                            className="flex-1"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Limpiar comprados
                        </Button>
                    </div>

                    {/* Shopping List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">
                                Cargando...
                            </div>
                        ) : aggregatedItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                Tu lista de compras está vacía. Añade recetas al calendario o agrega items manualmente.
                            </div>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {/* Pending Items */}
                                {aggregatedItems.filter(i => !i.is_purchased).map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-4"
                                    >
                                        <button
                                            onClick={() => togglePurchased(item.id, item.is_purchased)}
                                            className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 flex items-center justify-center flex-shrink-0"
                                        >
                                            {item.is_purchased && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                                        </button>

                                        <div className="flex-1">
                                            <p className="font-medium capitalize text-gray-900 dark:text-white">
                                                {item.ingredient_name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {/* Completed Items */}
                                {aggregatedItems.filter(i => i.is_purchased).length > 0 && (
                                    <>
                                        <div className="bg-gray-100 dark:bg-gray-700/50 px-4 py-2">
                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Completados</p>
                                        </div>
                                        {aggregatedItems.filter(i => i.is_purchased).map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-4 opacity-60"
                                            >
                                                <button
                                                    onClick={() => togglePurchased(item.id, item.is_purchased)}
                                                    className="w-6 h-6 rounded border-2 border-indigo-500 flex items-center justify-center flex-shrink-0 bg-indigo-500"
                                                >
                                                    <Check className="w-4 h-4 text-white" />
                                                </button>

                                                <div className="flex-1">
                                                    <p className="font-medium capitalize line-through text-gray-900 dark:text-white">
                                                        {item.ingredient_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.quantity} {item.unit}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
