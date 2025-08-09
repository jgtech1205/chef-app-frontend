'use client';

import {
  Home,
  Plus,
  Circle,
  Bell,
  ClipboardList,
  ChefHat,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useLogoutMutation } from '@/features/api/apiSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout as logoutAction } from '@/features/auth/authSlice';
import { toast } from 'react-hot-toast';
import type { User as AppUser } from '@/lib/types';

interface SidebarNavigationProps {
  readonly activeTab: string;
  readonly onTabChange: (tab: string) => void;
  readonly locale: Locale;
}

export function SidebarNavigation({
  activeTab,
  onTabChange,
  locale,
}: SidebarNavigationProps) {
  const t = getTranslations(locale);
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const user: AppUser | null = useAppSelector((state) => state.auth.user);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    setHasUnreadNotifications(
      typeof localStorage !== 'undefined' &&
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

  const handleLogout = () => {
    logout()
      .unwrap()
      .then(() => {
        dispatch(logoutAction());
        toast.success('Logged out');
      })
      .catch((err) => {
        console.error('Logout failed', err);
        toast.error('Logout failed');
      });
  };

  const tabs = [
    ...(user?.permissions?.canViewPanels
      ? [{ id: 'home', icon: Home, label: t.home }]
      : []),
    ...((user?.role === 'head-chef' || user?.permissions?.canManageTeam) && user?.permissions?.canViewRecipes
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
    { id: 'profile', icon: Settings, label: t.profile },
  ];

  return (
    <div className='hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-[#0F1A24] md:border-r md:border-slate-700'>
      <div className='flex items-center px-6 py-4 border-b border-slate-700'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-[#D4B896] rounded-full flex items-center justify-center'>
            <ChefHat className='w-5 h-5 text-[#0F1A24]' />
          </div>
          <div>
            <h2 className='text-[#D4B896] font-semibold text-lg'>
              {t.appTitle}
            </h2>
          </div>
        </div>
      </div>

      <nav className='flex-1 px-4 py-1 space-y-2'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-[#D4B896] text-[#0F1A24] font-medium'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              } relative`}
            >
              <Icon className='w-5 h-5 mr-3' />
              {tab.id === 'alerts' && hasUnreadNotifications && (
                <span className='absolute left-6 top-2 w-2 h-2 bg-red-500 rounded-full'></span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className='px-4 py-4 border-t border-slate-700 space-y-2'>
        <div className='flex items-center px-4 py-2'>
          <div className='w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center'>
            <User className='w-4 h-4 text-white' />
          </div>
          <div className='ml-3'>
            <p className='text-sm font-medium text-white'>{user?.name}</p>
            <p className='text-xs text-gray-400'>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className='w-full flex items-center px-4 py-2 text-left rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition-colors'
        >
          <LogOut className='w-5 h-5 mr-3' />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
}
