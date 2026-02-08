'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any> | string) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Skip during development
    if (process.env.NODE_ENV !== 'production') return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      window.gtag('js', new Date().toISOString());
      window.gtag('config', measurementId, {
        page_path: window.location.pathname,
      });
    };

    return () => {
      // Cleanup script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [measurementId]);

  return null;
}

// Custom hook for tracking events
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', eventName, parameters);
    } else {
      console.log('Analytics Event:', eventName, parameters);
    }
  };

  const trackPageView = (path: string) => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
        page_path: path,
      });
    } else {
      console.log('Analytics Page View:', path);
    }
  };

  const trackRecipeCreated = (recipeTitle: string) => {
    trackEvent('recipe_created', {
      recipe_title: recipeTitle,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRecipeViewed = (recipeTitle: string) => {
    trackEvent('recipe_viewed', {
      recipe_title: recipeTitle,
      timestamp: new Date().toISOString(),
    });
  };

  const trackMealPlanned = (mealType: string, date: Date) => {
    trackEvent('meal_planned', {
      meal_type: mealType,
      date: date.toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    });
  };

  const trackShoppingListGenerated = (itemsCount: number) => {
    trackEvent('shopping_list_generated', {
      items_count: itemsCount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackAIRecipeGenerated = (ingredientsCount: number) => {
    trackEvent('ai_recipe_generated', {
      ingredients_count: ingredientsCount,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackRecipeCreated,
    trackRecipeViewed,
    trackMealPlanned,
    trackShoppingListGenerated,
    trackAIRecipeGenerated,
  };
}
