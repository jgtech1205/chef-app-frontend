'use client'

import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetRecipeQuery } from '@/features/api/apiSlice'
import { getTranslations, type Locale } from '@/lib/i18n'

interface RecipeDetailProps {
  locale: Locale
}

export function RecipeDetail({ locale }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recipeId = id || ''
  const { data: recipe, isLoading } = useGetRecipeQuery(recipeId, { skip: !recipeId })
  const t = getTranslations(locale)

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
            {recipe?.title || t.recipe}
          </h1>
          <div className='w-6' />
        </div>
      </div>

      <div className='px-4 py-8'>
        <div className='max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow'>
          {isLoading ? (
            <p className='text-center text-gray-500'>{t.loadingRecipes}</p>
          ) : (
            <>
              <h2 className='text-2xl font-bold mb-4 text-gray-900'>{recipe?.title}</h2>
              {recipe?.image?.url && (
                <img src={recipe.image.url} alt={recipe.title} className='w-full rounded-md mb-4' />
              )}
              <div className='mb-4'>
                <h3 className='font-semibold mb-2'>Ingredients</h3>
                <div className='space-y-1'>
                  {recipe?.ingredients.map((ing, i) => (
                    <div key={i}>
                      {ing.quantity ? `${ing.quantity} ` : ''}
                      {ing.unit ? `${ing.unit} ` : ''}
                      {ing.name}
                    </div>
                  ))}
                </div>
              </div>
              {recipe?.method && (
                <div className='mb-4'>
                  <h3 className='font-semibold mb-2'>Method</h3>
                  <p className='whitespace-pre-line'>{recipe.method}</p>
                </div>
              )}
              {recipe?.chefNotes && 
                <div>
                  <h3 className='font-semibold mb-2'>Notes from Chef</h3>
                  <p className='text-gray-700 mb-4'>{recipe.chefNotes}</p>
                </div>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
