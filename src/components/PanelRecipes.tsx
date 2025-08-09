'use client';

import { ArrowLeft, Utensils, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import placeholderImg from '@/assets/images/placeholder.jpg';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGetPanelQuery, useGetRecipesQuery, useUpdateRecipeMutation, useDeleteRecipeMutation } from '@/features/api/apiSlice';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useAppSelector } from '@/app/hooks';

interface PanelRecipesProps {
  readonly locale: Locale;
}

export function PanelRecipes({ locale }: PanelRecipesProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const panelId = id || '';
  const { data: panel } = useGetPanelQuery(panelId, { skip: !panelId });
  const { data: recipes, isLoading, refetch } = useGetRecipesQuery(
    { panelId },
    { skip: !panelId }
  );
  const [updateRecipe] = useUpdateRecipeMutation();
  const [deleteRecipe] = useDeleteRecipeMutation();
  const user = useAppSelector((state) => state.auth.user);
  const t = getTranslations(locale);

  // Recipe menu and edit states
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<{ id: string; title: string } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Recipe handlers
  const handleRecipeDeleteClick = (recipe: { id: string; title: string }) => {
    setRecipeToDelete(recipe);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleRecipeDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    
    setDeletingId(recipeToDelete.id);
    setShowDeleteConfirm(false);
    try {
      await deleteRecipe(recipeToDelete.id).unwrap();
      toast.success('Recipe deleted successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to delete recipe');
      console.error('Delete recipe failed', err);
    } finally {
      setDeletingId(null);
      setRecipeToDelete(null);
    }
  };

  const handleRecipeDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setRecipeToDelete(null);
  };

  const handleRecipeEdit = (recipe: { id: string; title: string }) => {
    setEditingRecipe(recipe);
    setEditTitle(recipe.title);
    setShowEditForm(true);
    setOpenMenuId(null);
  };

  const handleRecipeEditSave = async () => {
    if (!editingRecipe) return;
    
    setEditError(null);
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    
    setEditLoading(true);
    try {
      await updateRecipe({ id: editingRecipe.id, title: editTitle.trim() }).unwrap();
      toast.success('Recipe updated successfully');
      refetch();
      setShowEditForm(false);
      setEditingRecipe(null);
      setEditTitle('');
    } catch (err) {
      setEditError('Update recipe failed. Please try again.');
      toast.error('Failed to update recipe');
      console.error('Update recipe failed', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleRecipeEditCancel = () => {
    setShowEditForm(false);
    setEditingRecipe(null);
    setEditTitle('');
    setEditError(null);
  };

  let content;
  if (isLoading) {
    content = (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <div className='w-16 h-16 md:w-20 md:h-20 mb-6'>
          <div className='animate-spin rounded-full h-full w-full border-4 border-[#D4B896] border-t-transparent'></div>
        </div>
        <p className='text-xl md:text-2xl text-gray-500 font-medium'>
          {t.loadingRecipes}
        </p>
      </div>
    );
  } else if (recipes && recipes.length === 0) {
    content = (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <div className='w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-2xl flex items-center justify-center mb-6'>
          <Utensils className='w-12 h-12 md:w-16 md:h-16 text-gray-500' />
        </div>
        <p className='text-xl md:text-2xl text-gray-500 font-medium'>
          {t.noRecipes}
        </p>
      </div>
    );
  } else {
    content = (
      <div className='space-y-3 mt-4'>
        {recipes?.map((recipe) => (
          <div
            key={recipe?.id}
            className='w-full flex items-center bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden relative'
          >
            <button
              onClick={() => navigate(`/recipe/${recipe?.id}`)}
              className='flex items-center flex-1 text-left'
              disabled={deletingId === recipe?.id}
            >
              <img
                src={recipe?.image?.url || placeholderImg}
                alt={recipe?.title}
                className='w-20 h-20 object-cover flex-shrink-0'
              />
              <div className='p-4 flex-1'>
                <h2 className='text-base font-semibold text-gray-800'>
                  {recipe?.title}
                </h2>
              </div>
            </button>
            
            {/* Three dots menu */}
            {recipe && (user?.permissions?.canUpdateRecipes || user?.permissions?.canDeleteRecipes) && (
              <div className='absolute top-2 right-2'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === recipe.id ? null : recipe.id);
                  }}
                  className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                  disabled={deletingId === recipe.id}
                >
                  {deletingId === recipe.id ? (
                    <div className='w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600'></div>
                  ) : (
                    <MoreVertical className='w-4 h-4 text-gray-500' />
                  )}
                </button>
                
                {/* Dropdown menu */}
                {openMenuId === recipe.id && (
                  <>
                    <button
                      className='fixed inset-0 z-10 bg-transparent cursor-default'
                      onClick={() => setOpenMenuId(null)}
                      aria-label="Close menu"
                    />
                    <div className='absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]'>
                      {/* {user?.permissions?.canUpdateRecipes && (
                        <button
                          onClick={() => handleRecipeEdit(recipe)}
                          className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
                        >
                          <Edit className='w-4 h-4 mr-2' />
                          Edit
                        </button>
                      )} */}
                      {user?.permissions?.canDeleteRecipes && (
                        <button
                          onClick={() => handleRecipeDeleteClick(recipe)}
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
        ))}
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-[#0F1A24] px-4 py-4 md:px-8 md:py-1'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <button
            onClick={() => navigate(-1)}
            className='text-[#D4B896] hover:text-white transition-colors p-1'
          >
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className='text-[#D4B896] text-xl md:text-2xl font-semibold text-center flex-1 md:flex-none'>
            {panel?.name || 'Recipes'}
          </h1>
          <div className='w-6' />
        </div>
      </div>

      <div className='px-4 py-1 md:px-8 md:py-8 pb-24'>
        <div className='max-w-4xl mx-auto'>
          {content}
        </div>
      </div>

      {/* Edit Recipe Form Modal */}
      {/* {showEditForm && editingRecipe && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Edit Recipe</h2>
              <button onClick={handleRecipeEditCancel}>
                <X className='w-5 h-5' />
              </button>
            </div>
            <input
              type='text'
              placeholder='Recipe title'
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className='w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#D4B896] focus:border-transparent'
              disabled={editLoading}
            />
            {editError && <div className='text-red-600 text-sm'>{editError}</div>}
            <div className='flex justify-end gap-2'>
              <button 
                onClick={handleRecipeEditCancel} 
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRecipeEditSave}
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
      )} */}

      {/* Delete Recipe Confirmation Modal */}
      {showDeleteConfirm && recipeToDelete && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Delete Recipe</h2>
            </div>
            <p className='text-gray-600'>
              Are you sure you want to delete the recipe "{recipeToDelete.title}"? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <button 
                onClick={handleRecipeDeleteCancel} 
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
              >
                Cancel
              </button>
              <button
                onClick={handleRecipeDeleteConfirm}
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
