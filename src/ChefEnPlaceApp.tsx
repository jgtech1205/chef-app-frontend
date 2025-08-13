'use client';

import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { LanguageSelection } from '@/components/LanguageSelection';
import { Login } from '@/components/Login';
import { RestaurantLogin } from '@/components/RestaurantLogin';
import { Dashboard } from '@/components/Dashboard';
import { AddRecipeContent } from '@/components/AddRecipeContent';

import { PlateupFolderList } from '@/components/PlateupFolderList';
import { FolderPlateups } from '@/components/FolderPlateups';
import { NotificationsScreen } from '@/components/NotificationsScreen';
import { ProfileScreen } from '@/components/ProfileScreen';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { ManagePanels } from '@/components/ManagePanels';
import { CreatePanelForm } from '@/components/CreatePanelForm';
import { CreateNotificationForm } from '@/components/CreateNotificationForm';
import { PanelRecipes } from '@/components/PanelRecipes';
import { RecipeDetail } from '@/components/RecipeDetail';
import { ChefRequest } from '@/components/ChefRequest';
import { MyWorkStation } from '@/components/MyWorkStation';
import { TeamManagement } from '@/components/TeamManagement';
import { RestaurantSignup } from '@/components/RestaurantSignup';
import { EmailVerification } from '@/components/EmailVerification';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import { SuperAdminRestaurants } from '@/components/SuperAdminRestaurants';
import { AdminApp } from '@/admin/AdminApp';
import { PrivateRoute } from './routes/PrivateRoute';
import { useAppSelector } from './app/hooks';
import type { Locale } from '@/lib/i18n';
import type { Panel } from '@/lib/types';

export default function ChefEnPlaceApp() {
  const navigate = useNavigate();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    () => (localStorage.getItem('locale') as Locale) || 'en'
  );
  const [activeTab, setActiveTab] = useState('home');
  const [panelToEdit, setPanelToEdit] = useState<Panel | null>(null);

  const user = useAppSelector((state) => state.auth.user);
  const isAuth = useAppSelector((state) => state.auth.isAuthenticated);
  const permissions = user?.permissions;

  // Helper function to get the correct dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === 'super-admin') {
      return '/super-admin';
    }
    return '/dashboard';
  };

  const handleLanguageSelect = (locale: Locale) => {
    setSelectedLocale(locale);
    localStorage.setItem('locale', locale);
    navigate('/login');
  };

  const handleLoginSuccess = () => {
    navigate(getDashboardPath());
  };

  const handleCategoryClick = (category: { id: string; name: string }) => {
    navigate(`/panels/${category.id}`);
  };

  const handleAddPanel = () => {
    setPanelToEdit(null);
    navigate('/create-panel');
  };

  const handleCreatePanel = () => {
    setPanelToEdit(null);
    navigate('/create-panel');
  };

  const handleEditPanel = (panel: Panel) => {
    setPanelToEdit(panel);
    navigate('/create-panel');
  };

  const handleBackFromNotification = () => {
    setActiveTab('alerts');
    navigate('/dashboard');
  };

  const handleSavePanel = () => {
    navigate('/manage-panels');
  };

  const handleCancelCreatePanel = () => {
    navigate('/dashboard');
  };

  const handleTabChange = (tab: string) => {
    if (
      (tab === 'home' && !permissions?.canViewPanels) ||
      (tab === 'add-recipe' && !permissions?.canViewRecipes) ||
      (tab === 'plate-up' && !permissions?.canViewPlateups) ||
      (tab === 'workstation' && !permissions?.canViewRecipes) ||
      (tab === 'alerts' && !permissions?.canViewNotifications)
    ) {
      return;
    }

    setActiveTab(tab);
    if (tab === 'workstation') {
      navigate('/workstation');
    } else {
      navigate('/dashboard');
    }
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'home':
        return permissions?.canViewPanels ? (
          <Dashboard
            locale={selectedLocale}
            onCategoryClick={handleCategoryClick}
            onAddPanel={handleAddPanel}
          />
        ) : null;
      case 'add-recipe':
        return permissions?.canViewRecipes ? (
          <AddRecipeContent locale={selectedLocale} />
        ) : null;
      case 'plate-up':
        return permissions?.canViewPlateups ? (
          <PlateupFolderList locale={selectedLocale} />
        ) : null;
      case 'workstation':
        return permissions?.canViewRecipes ? (
          <MyWorkStation locale={selectedLocale} />
        ) : null;
      case 'alerts':
        return permissions?.canViewNotifications ? (
          <NotificationsScreen locale={selectedLocale} />
        ) : null;
      case 'profile':
        return (
          <ProfileScreen
            locale={selectedLocale}
            onLanguageChange={(l) => {
              localStorage.setItem('locale', l);
              setSelectedLocale(l);
            }}
          />
        );
      default:
        return permissions?.canViewPanels ? (
          <Dashboard
            locale={selectedLocale}
            onCategoryClick={handleCategoryClick}
            onAddPanel={handleAddPanel}
          />
        ) : null;
    }
  };

  return (
    <div className='font-sans'>
      <Routes>
        <Route
          path='/'
          element={
            isAuth ? (
              <Navigate to={user?.role === 'super-admin' ? '/super-admin' : '/dashboard'} replace />
            ) : (
              <LanguageSelection onLanguageSelect={handleLanguageSelect} />
            )
          }
        />

        <Route
          path='/qr/:headChefId'
          element={<ChefRequest locale={selectedLocale} />}
        />

        <Route
          path='/restaurant/:orgId'
          element={
            isAuth ? (
              <Navigate to={user?.role === 'super-admin' ? '/super-admin' : '/dashboard'} replace />
            ) : (
              <Login
                locale={selectedLocale}
                onLoginSuccess={handleLoginSuccess}
                organizationId={window.location.pathname.split('/')[2]}
              />
            )
          }
        />

        <Route
          path='/signup'
          element={
            isAuth ? (
              <Navigate to={user?.role === 'super-admin' ? '/super-admin' : '/dashboard'} replace />
            ) : (
              <RestaurantSignup locale={selectedLocale} />
            )
          }
        />

        <Route
          path='/verify-email/:token'
          element={<EmailVerification locale={selectedLocale} />}
        />

        <Route
          path='/payment-success'
          element={<PaymentSuccess />}
        />

        <Route
          path='/super-admin/restaurants'
          element={
            <PrivateRoute>
              <SuperAdminRestaurants />
            </PrivateRoute>
          }
        />

        <Route
          path='/super-admin/*'
          element={
            <PrivateRoute>
              <AdminApp />
            </PrivateRoute>
          }
        />

        <Route
          path='/login'
          element={
            isAuth ? (
              <Navigate to={user?.role === 'super-admin' ? '/super-admin' : '/dashboard'} replace />
            ) : (
              <Login
                locale={selectedLocale}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        />

        <Route
          path='/login/:restaurantName'
          element={
            isAuth ? (
              <Navigate to={user?.role === 'super-admin' ? '/super-admin' : '/dashboard'} replace />
            ) : (
              <RestaurantLogin
                locale={selectedLocale}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        />

        <Route
          path='/dashboard'
          element={
            <PrivateRoute>
              <LayoutWrapper
                activeTab={activeTab}
                onTabChange={handleTabChange}
                locale={selectedLocale}
                showNavigation={true}
              >
                {renderDashboardContent()}
              </LayoutWrapper>
            </PrivateRoute>
          }
        />

        {permissions?.canViewRecipes && (
          <Route
            path='/workstation'
            element={
              <PrivateRoute>
                <LayoutWrapper
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  locale={selectedLocale}
                  showNavigation={true}
                >
                  <MyWorkStation locale={selectedLocale} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />
        )}

        {permissions?.canViewPanels && (
          <Route
            path='/manage-panels'
            element={
              <PrivateRoute>
                <ManagePanels
                  locale={selectedLocale}
                  onBack={() => navigate('/dashboard')}
                  onCreatePanel={handleCreatePanel}
                  onEditPanel={handleEditPanel}
                />
              </PrivateRoute>
            }
          />
        )}

        {permissions?.canViewPanels && (
          <Route
            path='/create-panel'
            element={
              <PrivateRoute>
                <CreatePanelForm
                  locale={selectedLocale}
                  panel={panelToEdit}
                  onSave={handleSavePanel}
                  onCancel={handleCancelCreatePanel}
                />
              </PrivateRoute>
            }
          />
        )}

        {user?.role === 'head-chef' && permissions?.canCreateNotifications && (
          <Route
            path='/create-notification'
            element={
              <PrivateRoute>
                <CreateNotificationForm
                  locale={selectedLocale}
                  onBack={handleBackFromNotification}
                />
              </PrivateRoute>
            }
          />
        )}

        {permissions?.canViewPlateups && (
          <Route
            path='/plateups'
            element={
              <PrivateRoute>
                <LayoutWrapper
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  locale={selectedLocale}
                  showNavigation={true}
                >
                  <PlateupFolderList locale={selectedLocale} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />
        )}

        {permissions?.canViewPlateups && (
          <Route
            path='/plateups/folder/:id'
            element={
              <PrivateRoute>
                <LayoutWrapper
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  locale={selectedLocale}
                  showNavigation={true}
                >
                  <FolderPlateups locale={selectedLocale} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />
        )}

        {permissions?.canViewPanels && (
          <Route
            path='/panels/:id'
            element={
              <PrivateRoute>
                <LayoutWrapper
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  locale={selectedLocale}
                  showNavigation={true}
                >
                  <PanelRecipes locale={selectedLocale} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />
        )}

        {permissions?.canViewRecipes && (
          <Route
            path='/recipe/:id'
            element={
              <PrivateRoute>
                <LayoutWrapper
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  locale={selectedLocale}
                  showNavigation={true}
                >
                  <RecipeDetail locale={selectedLocale} />
                </LayoutWrapper>
              </PrivateRoute>
            }
          />
        )}

        {(user?.role === 'head-chef' || permissions?.canManageTeam) && (
          <Route
            path='/team-management'
            element={
              <PrivateRoute>
                <TeamManagement locale={selectedLocale} />
              </PrivateRoute>
            }
          />
        )}
      </Routes>
    </div>
  );
}
