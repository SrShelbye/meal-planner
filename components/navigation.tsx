'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, ShoppingCart, BookOpen, Sparkles, Moon, Sun, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { NotificationBell } from '@/components/notification-bell';

const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Recetas', href: '/recipes', icon: BookOpen },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Lista de Compras', href: '/shopping-list', icon: ShoppingCart },
    { name: 'IA Generador', href: '/ai-generator', icon: Sparkles },
];

export function Navigation() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                🍽️ <span className="hidden xs:inline">Meal Planner</span>
                            </span>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                        isActive
                                            ? 'border-indigo-500 text-gray-900 dark:text-white'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                                    {item.name}
                                </Link>
                            );
                        })}

                        <div className="flex items-center gap-4 ml-4 border-l pl-4 dark:border-gray-700">
                            <NotificationBell />
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="hidden lg:flex flex-col items-end">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                            {user.user_metadata.full_name || user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Cerrar sesión"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <Button size="sm" variant="outline">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Entrar
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu right side */}
                    <div className="flex sm:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        {user ? (
                            <button
                                onClick={() => signOut()}
                                className="p-2 text-red-500"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        ) : (
                            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 p-2">
                                <LogIn className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile bottom navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
                <div className="grid grid-cols-5 gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset',
                                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <item.icon className="w-5 h-5 mb-1" aria-hidden="true" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
