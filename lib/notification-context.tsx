'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: number;
  read: boolean;
  type?: 'recipe' | 'meal' | 'shopping' | 'system';
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  showBrowserNotification: (title: string, body: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }

    // Schedule periodic notifications
    scheduleMealReminders();
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      return permission === 'granted';
    }

    return false;
  };

  const showBrowserNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (permissionGranted && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permission granted
    if (permissionGranted) {
      showBrowserNotification(notification.title, notification.body, {
        tag: notification.type || 'general',
        requireInteraction: notification.type === 'meal',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const scheduleMealReminders = () => {
    // Schedule meal reminders at 8:00 AM, 1:00 PM, and 7:00 PM
    const scheduleReminder = (hour: number, mealType: string) => {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        addNotification({
          title: `Recordatorio: ${mealType}`,
          body: `¡Es hora de ${mealType}! Revisa tu planificador para ver qué tienes preparado.`,
          type: 'meal',
          icon: '🍽️',
        });

        // Schedule next day's reminder
        scheduleReminder(hour, mealType);
      }, timeUntilReminder);
    };

    scheduleReminder(8, 'desayuno');
    scheduleReminder(13, 'almuerzo');
    scheduleReminder(19, 'cena');
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearAll,
        unreadCount,
        requestPermission,
        showBrowserNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
