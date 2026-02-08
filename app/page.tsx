import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 sm:pb-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Planifica tus comidas
              <span className="block text-indigo-600 dark:text-indigo-400 mt-2">sin estrés</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Organiza tu menú semanal, genera listas de compras inteligentes y ahorra tiempo con recetas generadas por IA
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Gestión de Recetas</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Crea, edita y organiza todas tus recetas favoritas en un solo lugar
              </p>
              <Link href="/recipes">
                <Button variant="outline" className="mt-4 w-full">
                  Ver Recetas
                </Button>
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Calendario de Comidas</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Planifica tu semana arrastrando recetas al calendario interactivo
              </p>
              <Link href="/calendar">
                <Button variant="outline" className="mt-4 w-full">
                  Abrir Calendario
                </Button>
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Lista Inteligente</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Genera automáticamente tu lista de compras consolidada por semana
              </p>
              <Link href="/shopping-list">
                <Button variant="outline" className="mt-4 w-full">
                  Ver Lista
                </Button>
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Generador con IA</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Crea recetas personalizadas usando ingredientes que ya tienes
              </p>
              <Link href="/ai-generator">
                <Button className="mt-4 w-full">
                  Generar Receta
                </Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 rounded-2xl p-6 shadow-lg text-white md:col-span-2 lg:col-span-2">
              <h3 className="text-2xl font-bold mb-2">100% Gratis para Siempre</h3>
              <p className="text-indigo-100 dark:text-indigo-200 mb-4">
                Instálala como app en tu móvil. Sin anuncios, sin suscripciones, sin costos ocultos.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">📱 PWA</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">🔒 Segura</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">⚡ Rápida</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">🌐 Offline</span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Link href="/recipes">
              <Button size="lg" className="shadow-lg">
                Comenzar Ahora →
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
