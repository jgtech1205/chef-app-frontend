'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Utensils, MoreVertical, Edit, Trash2, X, QrCode, Copy, Download, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getTranslations, type Locale } from '@/lib/i18n';
import type { RecipeCategory, Panel, Recipe } from '@/lib/types';
import { useGetPanelsQuery, useGetRecipesQuery, useUpdatePanelMutation, useDeletePanelMutation, useGetPlateupsQuery } from '@/features/api/apiSlice';
import { useAppSelector } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

interface DashboardProps {
  readonly locale: Locale;
  readonly onCategoryClick: (category: RecipeCategory) => void;
  readonly onAddPanel: () => void;
}

export function Dashboard({
  locale,
  onCategoryClick,
  onAddPanel,
}: DashboardProps) {
  const t = getTranslations(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 250);
  const { data: panels, isLoading: isLoadingPanels, refetch: refetchPanels } = useGetPanelsQuery();
  const { data: recipes, isLoading: isLoadingRecipes } = useGetRecipesQuery();
  const { data: plateups, isLoading: isLoadingPlateups } = useGetPlateupsQuery();
  const [updatePanel] = useUpdatePanelMutation();
  const [deletePanel] = useDeletePanelMutation();
  const user = useAppSelector((state) => state.auth.user);
  
  // Get the actual restaurant name from multiple sources
  const getRestaurantName = () => {
    // First try localStorage
    const storedName = localStorage.getItem('organizationName');
    if (storedName && storedName !== 'Organization' && storedName !== 'restaurant') {
      return storedName;
    }
    
    // Then try user organization (it's a string, not an object)
    if (user?.organization && user.organization !== 'restaurant') {
      return user.organization;
    }
    
    // Fallback to a more descriptive name
    return 'my-restaurant';
  };
  
  const organizationName = getRestaurantName();
  const navigate = useNavigate();

  // Panel menu and edit states
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [panelToDelete, setPanelToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState<{ id: string; name: string } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // QR Code states
  const [showQrModal, setShowQrModal] = useState(false);

  // Generate restaurant login URL
  const restaurantLoginUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    const formattedName = organizationName.toLowerCase().replace(/\s+/g, '-');
    const finalUrl = `${baseUrl}/login/${formattedName}`;
    
    // Debug logging
    console.log('QR Code URL Generation:', {
      organizationName,
      formattedName,
      finalUrl,
      userOrganization: user?.organization
    });
    
    return finalUrl;
  }, [organizationName, user?.organization]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Login URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  // Download QR code as image
  const downloadQrCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${organizationName}-login-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Panel handlers
  const handlePanelDeleteClick = (panel: { id: string; name: string }) => {
    setPanelToDelete(panel);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handlePanelDeleteConfirm = async () => {
    if (!panelToDelete) return;
    
    setDeletingId(panelToDelete.id);
    setShowDeleteConfirm(false);
    try {
      await deletePanel(panelToDelete.id).unwrap();
      toast.success('Panel deleted successfully');
      refetchPanels();
    } catch (err) {
      toast.error('Failed to delete panel');
      console.error('Delete panel failed', err);
    } finally {
      setDeletingId(null);
      setPanelToDelete(null);
    }
  };

  const handlePanelDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPanelToDelete(null);
  };

  const handlePanelEdit = (panel: { id: string; name: string }) => {
    setEditingPanel(panel);
    setEditTitle(panel.name);
    setShowEditForm(true);
    setOpenMenuId(null);
  };

  const handlePanelEditSave = async () => {
    if (!editingPanel) return;
    
    setEditError(null);
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    
    setEditLoading(true);
    const formData = new FormData();
    formData.append('name', editTitle.trim());
    
    try {
      await updatePanel({ id: editingPanel.id, data: formData }).unwrap();
      toast.success('Panel updated successfully');
      refetchPanels();
      setShowEditForm(false);
      setEditingPanel(null);
      setEditTitle('');
    } catch (err) {
      setEditError('Update panel failed. Please try again.');
      toast.error('Failed to update panel');
      console.error('Update panel failed', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePanelEditCancel = () => {
    setShowEditForm(false);
    setEditingPanel(null);
    setEditTitle('');
    setEditError(null);
  };

  const categories: RecipeCategory[] = useMemo(
    () =>
      (panels ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((p) => ({
          id: p.id,
          name: p.name,
          recipeCount: p.recipeCount,
          icon: 'utensils',
        })),
    [panels]
  );

  // Panel search
  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [categories, debouncedSearch]
  );

  // Recipe search (with panel name)
  const panelMap = useMemo(() => {
    const map: Record<string, Panel> = {};
    (panels ?? []).forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [panels]);

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    const q = debouncedSearch.toLowerCase();
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        panelMap[r.panel]?.name?.toLowerCase().includes(q)
    );
  }, [recipes, debouncedSearch, panelMap]);

  // Plateup search
  const filteredPlateups = useMemo(() => {
    if (!plateups) return [];
    const q = debouncedSearch.toLowerCase();
    return plateups.filter(
      (p) => p.name.toLowerCase().includes(q)
    );
  }, [plateups, debouncedSearch]);

  

  const handleRecipeClick = useCallback(
    (recipe: Recipe) => {
      navigate(`/recipe/${recipe.id}`);
    },
    [navigate]
  );

  const handlePanelClick = useCallback(
    (panelId: string, panelName: string) => {
      onCategoryClick({
        id: panelId,
        name: panelName,
        recipeCount: 0,
        icon: 'utensils',
      });
    },
    [onCategoryClick]
  );

  const showSearchResults = debouncedSearch.trim().length > 0;

  return (
    <div className='min-h-screen'>
      <div className='bg-[#0F1A24] px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-4xl mx-auto flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <h2 className='text-white text-xl md:text-2xl font-medium'>
              {organizationName}
            </h2>
          </div>
          
          {/* QR Code Button for Head Chefs */}
          {user?.role === 'head-chef' && (
            <Button
              onClick={() => setShowQrModal(true)}
              className='bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] px-4 py-2 rounded-lg flex items-center gap-2'
            >
              <QrCode className='w-4 h-4' />
              Team Access
            </Button>
          )}
        </div>
      </div>

      <div className='px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='relative mb-8 mt-4'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <Input
              type='text'
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full h-14 pl-12 pr-4 bg-white border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:border-[#D4B896] focus:ring-[#D4B896] shadow-sm'
            />
          </div>

          {isLoadingPanels || isLoadingRecipes || isLoadingPlateups ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-16 h-16 md:w-20 md:h-20 mb-6'>
                <div className='animate-spin rounded-full h-full w-full border-4 border-[#D4B896] border-t-transparent'></div>
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.loading}
              </p>
            </div>
          ) : showSearchResults ? (
            <div className='mb-8'>
              {/* Folders Section */}
              <h3 className='text-lg font-semibold mb-2 text-gray-700'>
                Folders
              </h3>
              {filteredCategories.length === 0 ? (
                <div className='mb-4 text-gray-400'>{t.noPanels}</div>
              ) : (
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                  {filteredCategories.map((category) => {
                    const panel = panels?.find(p => p.id === category.id);
                    return (
                      <div
                        key={category.id}
                        className="w-full bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                      >
                        <button
                          onClick={() => handlePanelClick(category.id, category.name)}
                          className="w-full text-left"
                        >
                          <div className="text-center">
                            <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                          </div>
                        </button>
                        
                        {/* Three dots menu */}
                        {panel && (user?.permissions?.canUpdatePanels || user?.permissions?.canDeletePanels) && (
                          <div className='absolute top-2 right-2'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === panel.id ? null : panel.id);
                              }}
                              className='p-1 rounded-full hover:bg-gray-100 transition-colors'
                              disabled={deletingId === panel.id}
                            >
                              {deletingId === panel.id ? (
                                <div className='w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600'></div>
                              ) : (
                                <MoreVertical className='w-4 h-4 text-gray-500' />
                              )}
                            </button>
                            
                            {/* Dropdown menu */}
                            {openMenuId === panel.id && (
                              <>
                                <button
                                  className='fixed inset-0 z-10 bg-transparent cursor-default'
                                  onClick={() => setOpenMenuId(null)}
                                  aria-label="Close menu"
                                />
                                <div className='absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]'>
                                  {user?.permissions?.canUpdatePanels && (
                                    <button
                                      onClick={() => handlePanelEdit(panel)}
                                      className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
                                    >
                                      <Edit className='w-4 h-4 mr-2' />
                                      Edit
                                    </button>
                                  )}
                                  {user?.permissions?.canDeletePanels && (
                                    <button
                                      onClick={() => handlePanelDeleteClick(panel)}
                                      className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center'
                                    >
                                      <Trash2 className='w-4 h-4 mr-2' />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Recipes Section */}
              <h3 className='text-lg font-semibold mb-2 text-gray-700 mt-6'>
                Recipes
              </h3>
              {filteredRecipes.length === 0 ? (
                <div className='text-gray-400'>{t.noRecipes}</div>
              ) : (
                <div className='space-y-2'>
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleRecipeClick(recipe)}
                      className='w-full flex items-center bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden text-left'
                    >
                      <img
                        src={recipe.image?.url || '/placeholder.jpg'}
                        alt={recipe.title}
                        className='w-16 h-16 object-cover flex-shrink-0'
                      />
                      <div className='p-4 flex-1'>
                        <h2 className='text-base font-semibold text-gray-800'>
                          {recipe.title}
                        </h2>
                        <div className='text-xs text-gray-500'>
                          {panelMap[recipe.panel]?.name || 'Unknown Folder'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Plate Ups Section */}
              <h3 className='text-lg font-semibold mb-2 text-gray-700 mt-6'>
                Plate Ups
              </h3>
              {isLoadingPlateups ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='w-8 h-8 animate-spin rounded-full border-2 border-[#D4B896] border-t-transparent'></div>
                </div>
              ) : filteredPlateups.length === 0 ? (
                <div className='text-gray-400'>No plate ups found</div>
              ) : (
                <div className='space-y-2'>
                  {filteredPlateups.map((plateup) => (
                    <div
                      key={plateup.id}
                      onClick={() => setSelected(plateup.image?.url || '')}
                      className='w-full flex items-center bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden'
                    >
                      <img
                        src={plateup.image?.url || '/placeholder.jpg'}
                        alt={plateup.name}
                        className='w-16 h-16 object-cover flex-shrink-0'
                      />
                      <div className='p-4 flex-1'>
                        <h2 className='text-base font-semibold text-gray-800'>
                          {plateup.name}
                        </h2>
                        <div className='text-xs text-gray-500'>
                          Plateup
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-2xl flex items-center justify-center mb-6'>
                <Utensils className='w-12 h-12 md:w-16 md:h-16 text-gray-500' />
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.noPanels}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
              {filteredCategories.map((category) => {
                const panel = panels?.find(p => p.id === category.id);
                return (
                  <div
                    key={category.id}
                    className="w-full bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                  >
                    <button
                      onClick={() => handlePanelClick(category.id, category.name)}
                      className="w-full text-left"
                    >
                      <div className="text-center">
                        <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                      </div>
                    </button>
                    
                    {/* Three dots menu */}
                    {panel && (user?.permissions?.canUpdatePanels || user?.permissions?.canDeletePanels) && (
                      <div className='absolute top-2 right-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === panel.id ? null : panel.id);
                          }}
                          className='p-1 rounded-full hover:bg-gray-100 transition-colors'
                          disabled={deletingId === panel.id}
                        >
                          {deletingId === panel.id ? (
                            <div className='w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600'></div>
                          ) : (
                            <MoreVertical className='w-4 h-4 text-gray-500' />
                          )}
                        </button>
                        
                        {/* Dropdown menu */}
                        {openMenuId === panel.id && (
                          <>
                            <button
                              className='fixed inset-0 z-10 bg-transparent cursor-default'
                              onClick={() => setOpenMenuId(null)}
                              aria-label="Close menu"
                            />
                            <div className='absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]'>
                              {user?.permissions?.canUpdatePanels && (
                                <button
                                  onClick={() => handlePanelEdit(panel)}
                                  className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
                                >
                                  <Edit className='w-4 h-4 mr-2' />
                                  Edit
                                </button>
                              )}
                              {user?.permissions?.canDeletePanels && (
                                <button
                                  onClick={() => handlePanelDeleteClick(panel)}
                                  className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center'
                                >
                                  <Trash2 className='w-4 h-4 mr-2' />
                                  Delete
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {user?.permissions && (user.permissions.canCreatePanels || user.permissions.canUpdatePanels || user.permissions.canDeletePanels) && (
            <div className='fixed bottom-4 right-4 bg-white rounded-md p-2 shadow-lg hover:shadow-xl transition-shadow duration-200 w-16 h-16 z-50'>
              <button
                onClick={onAddPanel}
                className='w-full h-full flex flex-col items-center justify-center space-y-1 text-center group'
              >
                <div className='w-4 h-4 bg-[#D4B896] rounded-full flex items-center justify-center group-hover:bg-[#C4A886] transition-colors duration-200'>
                  <Plus className='w-2 h-2 text-white' />
                </div>
                <h3 className='text-xs font-semibold text-gray-900 group-hover:text-[#D4B896] transition-colors duration-200'>
                  {t.addPanel}
                </h3>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Panel Form Modal */}
      {showEditForm && editingPanel && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Edit Panel</h2>
              <button onClick={handlePanelEditCancel}>
                <X className='w-5 h-5' />
              </button>
            </div>
            <input
              type='text'
              placeholder='Panel name'
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className='w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#D4B896] focus:border-transparent'
              disabled={editLoading}
            />
            {editError && <div className='text-red-600 text-sm'>{editError}</div>}
            <div className='flex justify-end gap-2'>
              <button 
                onClick={handlePanelEditCancel} 
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePanelEditSave}
                className={`px-4 py-2 bg-[#0F1A24] text-white rounded hover:bg-gray-800 ${
                  editLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                disabled={editLoading || !editTitle.trim()}
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Panel Confirmation Modal */}
      {showDeleteConfirm && panelToDelete && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Delete Panel</h2>
            </div>
            <p className='text-gray-600'>
              Are you sure you want to delete the panel "{panelToDelete.name}"? All recipes inside will be deleted and this action cannot be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <button 
                onClick={handlePanelDeleteCancel} 
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
              >
                Cancel
              </button>
              <button
                onClick={handlePanelDeleteConfirm}
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <button
          type='button'
          className='fixed inset-0 bg-black/90 flex items-center justify-center z-50'
          onClick={() => setSelected(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSelected(null);
            }
          }}
          aria-label='Close image preview'
        >
          <img
            src={selected}
            alt='plateup'
            className='max-h-full max-w-full object-contain'
          />
        </button>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-md p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-gray-800'>Team Member Access</h2>
              <button 
                onClick={() => setShowQrModal(false)}
                className='p-1 hover:bg-gray-100 rounded-full'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            <div className='text-center space-y-4'>
              <div className='flex justify-center'>
                <div className='bg-white p-4 rounded-lg border-2 border-gray-200'>
                  <QRCode
                    id="qr-code-svg"
                    value={restaurantLoginUrl}
                    size={200}
                    level="M"
                    fgColor="#0F1A24"
                    bgColor="#FFFFFF"
                  />
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='text-lg font-medium text-gray-800'>Restaurant Login URL</h3>
                <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg'>
                  <Input
                    value={restaurantLoginUrl}
                    readOnly
                    className='flex-1 text-sm bg-transparent border-none focus:ring-0'
                  />
                  <Button
                    onClick={() => copyToClipboard(restaurantLoginUrl)}
                    className='bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] p-2'
                  >
                    <Copy className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              <div className='flex gap-2 justify-center'>
                <Button
                  onClick={downloadQrCode}
                  className='bg-[#0F1A24] text-white hover:bg-gray-800 flex items-center gap-2'
                >
                  <Download className='w-4 h-4' />
                  Download QR Code
                </Button>
                <Button
                  onClick={() => copyToClipboard(restaurantLoginUrl)}
                  className='bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] flex items-center gap-2'
                >
                  <Copy className='w-4 h-4' />
                  Copy URL
                </Button>
              </div>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <Users className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                <div className='text-sm text-blue-800'>
                  <h4 className='font-medium mb-2'>How to share with team members:</h4>
                  <ul className='space-y-1 text-left'>
                    <li>• Print or display the QR code in your kitchen</li>
                    <li>• Share the login URL via email or messaging</li>
                    <li>• Team members can scan the QR code or visit the URL</li>
                    <li>• They'll be redirected to a name-based login page</li>
                    <li>• No passwords required - just first and last name</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
