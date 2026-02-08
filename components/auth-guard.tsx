'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const publicPages = ['/', '/login', '/register'];
    const isPublicPage = publicPages.includes(pathname);

    useEffect(() => {
        if (!loading && !user && !isPublicPage) {
            router.push('/login');
        }
    }, [user, loading, isPublicPage, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user && !isPublicPage) {
        return null;
    }

    return <>{children}</>;
}
