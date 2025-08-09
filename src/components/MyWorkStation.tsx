'use client';

import { useState } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useGetSavedRecipesQuery, useSaveRecipeMutation, useUnsaveRecipeMutation } from '@/features/api/apiSlice';
import { useAppSelector } from '@/app/hooks';
import { Bookmark, BookmarkCheck, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface MyWorkStationProps {
  locale: Locale;
}

export function MyWorkStation({ locale }: MyWorkStationProps) {
  const t = getTranslations(locale);
  const user = useAppSelector((state) => state.auth.user);
  const { data: savedRecipes, isLoading } = useGetSavedRecipesQuery();
  const [saveRecipe] = useSaveRecipeMutation();
  const [unsaveRecipe] = useUnsaveRecipeMutation();

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      await saveRecipe(recipeId).unwrap();
      toast.success('Recipe saved to workstation');
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    try {
      await unsaveRecipe(recipeId).unwrap();
      toast.success('Recipe removed from workstation');
    } catch (error) {
      toast.error('Failed to remove recipe');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-[#0F1A24] px-4 py-1 md:px-8 md:py-8 shadow-md sticky top-0 z-10'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-[#D4B896] text-2xl md:text-3xl font-bold text-center'>
            My Work Station
          </h1>
          <p className='text-slate-400 text-center mt-2'>
            Your saved recipes and quick access
          </p>
        </div>
      </header>

      <div className='px-4 py-6 md:px-8 md:py-8'>
        <div className='max-w-4xl mx-auto'>
          {isLoading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B896]'></div>
            </div>
          ) : savedRecipes && savedRecipes.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {savedRecipes.map((recipe) => (
                <div key={recipe.id} className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
                  {recipe.image?.url && (
                    <div className='h-48 bg-gray-200'>
                      <img
                        src={recipe.image.url}
                        alt={recipe.title}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                        {recipe.title}
                      </h3>
                      <button
                        onClick={() => handleUnsaveRecipe(recipe.id)}
                        className='text-[#D4B896] hover:text-[#C4A886] transition-colors'
                        title='Remove from workstation'
                      >
                        <BookmarkCheck className='w-5 h-5' />
                      </button>
                    </div>
                    
                    <div className='space-y-2 text-sm text-gray-600'>
                      {recipe.prepTime > 0 && (
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>Prep: {recipe.prepTime} min</span>
                        </div>
                      )}
                      {recipe.cookTime > 0 && (
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>Cook: {recipe.cookTime} min</span>
                        </div>
                      )}
                      {recipe.createdBy && (
                        <div className='flex items-center gap-2'>
                          <User className='w-4 h-4' />
                          <span>By: {recipe.createdBy.name}</span>
                        </div>
                      )}
                    </div>

                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <div className='mt-4'>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Ingredients:</h4>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {recipe.ingredients.slice(0, 3).map((ingredient: any, index: number) => (
                            <li key={index} className='flex items-center gap-2'>
                              <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                              {ingredient.name}
                            </li>
                          ))}
                          {recipe.ingredients.length > 3 && (
                            <li className='text-gray-500 text-xs'>
                              +{recipe.ingredients.length - 3} more ingredients
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <Bookmark className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-600 mb-2'>No saved recipes yet</h3>
              <p className='text-gray-500'>
                Browse recipes from the main folders and save them to your workstation for quick access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
