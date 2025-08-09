"use client"

import type { RecipeCategory } from '@/lib/types'

interface RecipeCategoryCardProps {
  category: RecipeCategory
  onClick: () => void
}

export function RecipeCategoryCard({ category,onClick }: RecipeCategoryCardProps) {

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
    >
      <div className="text-center">
        <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
      </div>
    </button>
  )
}


