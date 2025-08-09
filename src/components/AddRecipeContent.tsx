'use client';

import { useState, useRef, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { getTranslations, type Locale } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useGetPanelsQuery,
  useCreateRecipeMutation,
  useUploadIngredientImageMutation,
} from '@/features/api/apiSlice';
import { useAppSelector } from '@/app/hooks';

interface AddRecipeContentProps {
  locale: Locale;
}

export function AddRecipeContent({ locale }: AddRecipeContentProps) {
  const t = getTranslations(locale);
  const { data: panels } = useGetPanelsQuery();
  const [createRecipe] = useCreateRecipeMutation();
  const user = useAppSelector((state) => state.auth.user);

  const [title, setTitle] = useState('');
  const [panelId, setPanelId] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [method, setMethod] = useState('');
  const [chefNotes, setChefNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileAiRef = useRef<HTMLInputElement>(null);
  const [uploadIngredientImage] = useUploadIngredientImageMutation();

  const handleButtonClick = () => {
    fileAiRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading('Uploading image...');
        const response = await uploadIngredientImage(file).unwrap();
        toast.dismiss();
        toast.success('Ingredients extracted!');
        console.log('AI ingredients:', response);
        const raw = response?.data?.ingredients || '';
        const cleaned = raw.replaceAll(/[\n\r]+/g, '\n').trim();
        setIngredientsText(cleaned);
      } catch (err: unknown) {
        toast.dismiss();
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err &&
          typeof (err as { data?: { message?: string } }).data?.message ===
            'string'
        ) {
          toast.error((err as { data: { message: string } }).data.message);
        } else {
          toast.error('Failed to scan image');
        }
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Check permissions first
    if (!user?.permissions?.canEditRecipes) {
      toast.error('You do not have permission to create recipes. Please contact your head chef.');
      return;
    }
    
    // Check required fields
    if (!title.trim()) {
      toast.error('Recipe name is required');
      return;
    }
    
    if (!panelId) {
      toast.error('Please select a folder');
      return;
    }
    
    if (!ingredientsText.trim()) {
      toast.error('Ingredients are required');
      return;
    }
    
    if (!method.trim()) {
      toast.error('Method is required');
      return;
    }

    const data = new FormData();
    data.append('title', title.trim());
    data.append('panel', panelId);
    data.append('method', method.trim());
    if (chefNotes.trim()) {
      data.append('chefNotes', chefNotes.trim());
    }

    const ingredients = ingredientsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    ingredients.forEach((ing, idx) => {
      data.append(`ingredients[${idx}][name]`, ing.name);
    });

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      data.append('image', file);
    }

    createRecipe(data)
      .unwrap()
      .then(() => {
        toast.success('Recipe created');
        setTitle('');
        setPanelId('');
        setIngredientsText('');
        setMethod('');
        setChefNotes('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch((err) => {
        console.error('Create recipe failed', err);
        toast.error('Create recipe failed');
      });
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-[#0F1A24] px-4 py-1 md:px-8 md:py-8 shadow-md sticky top-0 z-10'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-[#D4B896] text-2xl md:text-3xl font-bold text-center'>
            {t.addRecipe}
          </h1>
        </div>
      </header>

      <div className='px-4 py-6 md:px-8 md:py-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Recipe Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Recipe Name
                </label>
                <Input
                  type='text'
                  className='w-full h-12 border-gray-200 text-[16px]'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Folder */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Folder
                </label>
                <select
                  value={panelId}
                  onChange={(e) => setPanelId(e.target.value)}
                  className='w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-[#D4B896] focus:ring-2 focus:ring-[#D4B896] transition bg-white'
                >
                  <option value=''>Select folder</option>
                  {panels && panels.length > 0 ? (
                    panels
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                  ) : (
                    <option value='' disabled>
                      No folders available - Create folders first
                    </option>
                  )}
                </select>
                {panels && panels.length === 0 && (
                  <p className='text-sm text-red-600 mt-1'>
                    You need to create folders first. Go to Dashboard and click "Add Folder".
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Image
                </label>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='w-full border border-gray-200 rounded-lg p-2 bg-white focus:border-[#D4B896] focus:ring-2 focus:ring-[#D4B896] transition'
                />
              </div>

              {/* Ingredients with AI Scan */}
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Ingredients
                  </label>
                  <button
                    type='button'
                    onClick={handleButtonClick}
                    className='flex items-center gap-1 px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors text-sm'
                  >
                    Ai Scan
                  </button>
                  <input
                    ref={fileAiRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFileChange}
                  />
                </div>
                <Textarea
                  className='w-full h-32 border-gray-200'
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                />
              </div>

              {/* Method */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Method
                </label>
                <Textarea
                  className='w-full h-40 border-gray-200'
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>

              {/* Chef Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {t.notesFromChef}
                </label>
                <Textarea
                  className='w-full h-32 border-gray-200'
                  value={chefNotes}
                  onChange={(e) => setChefNotes(e.target.value)}
                />
              </div>

              <button
                type='submit'
                className='w-full h-12 bg-[#D4B896] hover:bg-[#C4A886] text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2'
              >
                Save Recipe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
