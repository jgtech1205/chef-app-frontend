'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Camera, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getTranslations, type Locale } from '@/lib/i18n';
import type { Panel } from '@/lib/types';
import {
  useCreatePanelMutation,
  useUpdatePanelMutation,
} from '@/features/api/apiSlice';

interface CreatePanelFormProps {
  locale: Locale;
  panel?: Panel | null;
  onSave: (panelData: Partial<Panel>) => void;
  onCancel: () => void;
}

export function CreatePanelForm({
  locale,
  panel,
  onSave,
  onCancel,
}: CreatePanelFormProps) {
  const t = getTranslations(locale);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createPanel] = useCreatePanelMutation();
  const [updatePanel] = useUpdatePanelMutation();

  const [formData, setFormData] = useState({
    name: panel?.name || '',
    image: panel?.image?.url || '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    panel?.image?.url || null
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const data = new FormData();
      data.append('name', formData.name.trim());
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        data.append('image', file);
      }

      const request = panel
        ? updatePanel({ id: panel.id, data })
        : createPanel(data);

      request
        .unwrap()
        .then(() => {
          onSave({ name: formData.name.trim() });
          toast.success('Panel saved');
        })
        .catch((err) => {
          console.error('Save panel failed', err);
          toast.error('Save panel failed');
        });
    }
  };

  const isEditing = !!panel;

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-1'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <button
            onClick={onCancel}
            className='text-gray-500 hover:text-gray-700 transition-colors text-lg'
          >
            {t.cancel}
          </button>

          <h1 className='text-xl md:text-2xl font-semibold text-gray-900'>
            {isEditing ? t.editPanel : t.createPanel}
          </h1>

          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
            className='text-[#D4B896] hover:text-[#C4A886] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium'
          >
            {t.save}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className='px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-2xl mx-auto'>
          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Panel Name */}
            <div>
              <label className='block text-lg font-medium text-gray-900 mb-4'>
                {t.panelName}
              </label>
              <Input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t.enterPanelName}
                className='w-full h-14 text-lg bg-white border-gray-200 rounded-2xl px-4 focus:border-[#D4B896] focus:ring-[#D4B896]'
                required
              />
            </div>

            {/* Panel Image */}
            <div>
              <label className='block text-lg font-medium text-gray-900 mb-4'>
                {t.panelImage}
              </label>

              <div className='relative'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                />

                {imagePreview ? (
                  <div className='relative bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200'>
                    <img
                      src={imagePreview || '/placeholder.svg'}
                      alt='Panel preview'
                      className='w-full h-48 object-cover rounded-lg'
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image: '' }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className='absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
                    >
                      <X className='w-4 h-4 text-white' />
                    </button>
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full bg-white rounded-2xl p-8 md:p-12 border-2 border-dashed border-gray-200 hover:border-[#D4B896] transition-colors group'
                  >
                    <div className='flex flex-col items-center space-y-4'>
                      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#D4B896] transition-colors'>
                        <Camera className='w-8 h-8 text-gray-400 group-hover:text-white transition-colors' />
                      </div>
                      <p className='text-lg text-gray-500 group-hover:text-[#D4B896] transition-colors'>
                        {t.addImage}
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
