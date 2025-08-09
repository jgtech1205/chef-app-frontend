'use client';

import { useEffect, useState } from 'react';
import { Home, Plus, Circle, Bell, ClipboardList } from 'lucide-react';
import { getTranslations, type Locale } from '@/lib/i18n';
import type { User } from '@/lib/types';

interface BottomNavigationProps {
  readonly activeTab: string;
  readonly onTabChange: (tab: string) => void;
  readonly locale: Locale;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  locale,
}: BottomNavigationProps) {
  const t = getTranslations(locale);

  let user: User | null = null;
  try {
    user = JSON.parse(localStorage.getItem('user') ?? 'null');
  } catch {
    user = null;
  }

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    setHasUnreadNotifications(
      localStorage.getItem('unreadNotifications') === 'true'
    );

    const handler = (e: StorageEvent) => {
      if (e.key === 'unreadNotifications') {
        setHasUnreadNotifications(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const tabs = [
    ...(user?.permissions?.canViewPanels
      ? [{ id: 'home', icon: Home, label: t.home }]
      : []),
    ...(user?.role === 'head-chef' && user?.permissions?.canViewRecipes
      ? [{ id: 'add-recipe', icon: Plus, label: t.addRecipe }]
      : []),
    ...(user?.permissions?.canViewPlateups
      ? [{ id: 'plate-up', icon: Circle, label: t.plateUp }]
      : []),
    ...(user?.role !== 'head-chef' && user?.permissions?.canViewRecipes
      ? [{ id: 'workstation', icon: ClipboardList, label: t.myWorkStation }]
      : []),
    ...(user?.permissions?.canViewNotifications
      ? [{ id: 'alerts', icon: Bell, label: t.alerts }]
      : []),
    { id: 'profile', icon: ClipboardList, label: t.profile },
  ];

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 bg-[#0F1A24] border-t border-slate-700 z-50 pb-6 pb-safe'>
      <div className='flex items-center justify-around py-2'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className='flex flex-col items-center py-2 px-3 min-w-0 flex-1 relative'
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-[#D4B896]' : 'text-gray-400'
                }`}
              />
              {tab.id === 'alerts' && hasUnreadNotifications && (
                <span className='absolute top-1 w-2 h-2 bg-red-500 rounded-full'></span>
              )}
              <span
                className={`text-[10px] truncate ${
                  isActive ? 'text-[#D4B896]' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
