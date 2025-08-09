"use client"

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n'

interface RecipeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  categoryName: string
  locale?: Locale
}

export function RecipeDetailModal({ isOpen, onClose, categoryName }: RecipeDetailModalProps) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{categoryName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No recipes found in this category yet.</p>
            <Button className="bg-[#D4B896] hover:bg-[#C4A886] text-white">Add First Recipe</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


