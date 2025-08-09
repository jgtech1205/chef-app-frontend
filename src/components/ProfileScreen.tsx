'use client';

import {
  Check,
  Users,
  ChevronRight,
  LogOut,
  Settings,
  Globe,
} from 'lucide-react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation, useGetMyRestaurantQuery } from '@/features/api/apiSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout as logoutAction } from '@/features/auth/authSlice';
import { toast } from 'react-hot-toast';

interface ProfileScreenProps {
  readonly locale: Locale;
  readonly onLanguageChange: (locale: Locale) => void;
}

export function ProfileScreen({
  locale,
  onLanguageChange,
}: ProfileScreenProps) {
  const t = getTranslations(locale);
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: restaurant, isLoading: isRestaurantLoading } = useGetMyRestaurantQuery();

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

  const permissions = Object.entries(user?.permissions || {})
    .filter(([key, value]) => {
      // Hide view permissions as they're default for everyone
      const isViewPermission = key.toLowerCase().includes('view');
      return value === true && !isViewPermission;
    })
    .map(([key]) => key);

  // Group permissions for better organization
  const groupedPermissions = {
    recipes: permissions.filter(p => p.toLowerCase().includes('recipe')),
    plateups: permissions.filter(p => p.toLowerCase().includes('plateup')),
    notifications: permissions.filter(p => p.toLowerCase().includes('notification')),
    panels: permissions.filter(p => p.toLowerCase().includes('panel')),
    administration: permissions.filter(p => p.toLowerCase().includes('team') || p.toLowerCase().includes('admin')),
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-[#0F1A24] px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-[#D4B896] text-2xl md:text-3xl font-bold text-center'>
            <p className='text-[white] font-semibold text-lg'>
              {isRestaurantLoading ? 'Loading...' : restaurant?.name || 'Chef En Place'}
            </p>
          </h1>
        </div>
      </div>

      {/* <div className='bg-[#0F1A24] px-4 pb-8 md:px-8 md:pb-12'>
        <div className='max-w-4xl mx-auto text-center space-y-2'>
          <h2 className='text-white text-2xl md:text-3xl font-bold'>
            {user?.name}
          </h2>
          <p className='text-[#D4B896] font-semibold text-lg'>
            {isRestaurantLoading ? 'Loading...' : restaurant?.name || 'Chef En Place'}
          </p>
        </div>
      </div> */}

      {/* Main Content */}
      <div className='px-4 py-6 pb-24'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Settings Section */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='p-4 border-b border-gray-100'>
              <div className='flex items-center space-x-2'>
                <Settings className='w-5 h-5 text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900'>
                  {t.settings}
                </h3>
              </div>
            </div>

            <div className='divide-y divide-gray-100'>
              {/* Language Setting */}
              <div className='p-4'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Globe className='w-5 h-5 text-blue-600' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-medium text-gray-900 mb-1'>
                      {t.language}
                    </h4>
                    <select
                      value={locale}
                      onChange={(e) =>
                        onLanguageChange(e.target.value as Locale)
                      }
                      className='w-full text-sm border-gray-200 rounded-lg p-2 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'
                    >
                      <option value='en'>{t.english}</option>
                      <option value='es'>{t.spanish}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Team Management - Only for head-chef */}
              {user?.role === 'head-chef' && (
                <button
                  onClick={() => navigate('/team-management')}
                  className='w-full p-4 text-left hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Users className='w-5 h-5 text-purple-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-medium text-gray-900 mb-1'>
                        {t.teamManagement}
                      </h4>
                      <p className='text-xs text-gray-500'>
                        {t.manageTeamInvites}
                      </p>
                    </div>
                    <ChevronRight className='w-5 h-5 text-gray-400 flex-shrink-0' />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Permissions Section - Only for non-head-chef users */}
          {user?.role !== 'head-chef' && permissions.length > 0 && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='p-4 border-b border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {t.permissions}
                </h3>
              </div>
              <div className='p-4 space-y-4'>
                {/* Recipes Group */}
                {groupedPermissions.recipes.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide'>
                      Recipes
                    </h4>
                    <div className='space-y-2'>
                      {groupedPermissions.recipes.map((permission) => (
                        <div className='flex items-center space-x-3' key={permission}>
                          <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Check className='w-2.5 h-2.5 text-white' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {t[permission as keyof typeof t] || permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plateups Group */}
                {groupedPermissions.plateups.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide'>
                      Plateups
                    </h4>
                    <div className='space-y-2'>
                      {groupedPermissions.plateups.map((permission) => (
                        <div className='flex items-center space-x-3' key={permission}>
                          <div className='w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Check className='w-2.5 h-2.5 text-white' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {t[permission as keyof typeof t] || permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notifications Group */}
                {groupedPermissions.notifications.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide'>
                      Notifications
                    </h4>
                    <div className='space-y-2'>
                      {groupedPermissions.notifications.map((permission) => (
                        <div className='flex items-center space-x-3' key={permission}>
                          <div className='w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Check className='w-2.5 h-2.5 text-white' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {t[permission as keyof typeof t] || permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Panels Group */}
                {groupedPermissions.panels.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide'>
                      Panels
                    </h4>
                    <div className='space-y-2'>
                      {groupedPermissions.panels.map((permission) => (
                        <div className='flex items-center space-x-3' key={permission}>
                          <div className='w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Check className='w-2.5 h-2.5 text-white' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {t[permission as keyof typeof t] || permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Administration Group */}
                {groupedPermissions.administration.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide'>
                      Administration
                    </h4>
                    <div className='space-y-2'>
                      {groupedPermissions.administration.map((permission) => (
                        <div className='flex items-center space-x-3' key={permission}>
                          <div className='w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Check className='w-2.5 h-2.5 text-white' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {t[permission as keyof typeof t] || permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout Button - Mobile Only */}
          <button
            onClick={handleLogout}
            className='w-full bg-red-500 hover:bg-red-600 rounded-xl p-4 flex items-center justify-center text-white font-medium transition-colors md:hidden'
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                className='animate-spin mr-2 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                ></path>
              </svg>
            )}
            <LogOut className='w-5 h-5 mr-2' />
            {t.logout}
          </button>

          {/* Logout Button - Desktop Only */}
          <button
            onClick={handleLogout}
            className='hidden md:flex w-full bg-red-500 hover:bg-red-600 rounded-xl p-4 items-center justify-center text-white font-medium transition-colors'
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                className='animate-spin mr-2 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                ></path>
              </svg>
            )}
            <LogOut className='w-5 h-5 mr-2' />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
