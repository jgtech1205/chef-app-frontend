'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Utensils, Pencil } from 'lucide-react';
import { getTranslations, type Locale } from '@/lib/i18n';
import type { Panel } from '@/lib/types';
import {
  useGetPanelsQuery,
  useDeletePanelMutation,
  useReorderPanelsMutation,
} from '@/features/api/apiSlice';
import { useAppSelector } from '@/app/hooks';

interface ManagePanelsProps {
  locale: Locale;
  onBack: () => void;
  onCreatePanel: () => void;
  onEditPanel: (panel: Panel) => void;
}

export function ManagePanels({
  locale,
  onBack,
  onCreatePanel,
  onEditPanel,
}: ManagePanelsProps) {
  const t = getTranslations(locale);
  const { data: fetchedPanels, isLoading, refetch } = useGetPanelsQuery();
  const [reorderPanels] = useReorderPanelsMutation();
  const [deletePanelMutation] = useDeletePanelMutation();
  const [panels, setPanels] = useState<Panel[]>([]);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (fetchedPanels) {
      const sorted = [...fetchedPanels]
        .sort((a, b) => a.order - b.order)
        .map((p) => ({ ...p }));
      setPanels(sorted);
    }
  }, [fetchedPanels]);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    setPanels((prev) => {
      const newPanels = prev.map((p) => ({ ...p }));
      const fromIndex = newPanels.findIndex((p) => p.id === draggedId);
      const toIndex = newPanels.findIndex((p) => p.id === id);
      newPanels.splice(toIndex, 0, newPanels.splice(fromIndex, 1)[0]);
      newPanels.forEach((p, i) => (p.order = i + 1));
      return newPanels;
    });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    reorderPanels({
      panels: panels.map((p) => ({ id: p.id, order: p.order })),
    });
  };

  const deletePanel = (id: string) => {
    if (confirm(t.confirmDelete)) {
      deletePanelMutation(id)
        .unwrap()
        .then(() => {
          refetch();
          toast.success('Panel deleted');
        })
        .catch((err) => {
          console.error('Delete panel failed', err);
          toast.error('Delete panel failed');
        });
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <div className='bg-[#0F1A24] px-4 py-4 md:px-8 md:py-1'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={onBack}
              className='text-[#D4B896] hover:text-white transition-colors p-1'
            >
              <ArrowLeft className='w-6 h-6' />
            </button>
          </div>

          <h1 className='text-[#D4B896] text-xl md:text-2xl font-semibold text-center flex-1 md:flex-none'>
            {t.managePanels}
          </h1>

          <div className='w-8 md:w-0'></div>
        </div>
      </div>

      {/* Content */}
      <div className='px-4 py-5 md:px-8 md:py-8 pb-24'>
        <div className='max-w-4xl mx-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-16 h-16 md:w-20 md:h-20 mb-6'>
                <div className='animate-spin rounded-full h-full w-full border-4 border-[#D4B896] border-t-transparent'></div>
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.loadingPanels}
              </p>
            </div>
          ) : panels.length === 0 ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-2xl flex items-center justify-center mb-6'>
                <Utensils className='w-12 h-12 md:w-16 md:h-16 text-gray-500' />
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.noPanels}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  draggable
                  onDragStart={() => handleDragStart(panel.id)}
                  onDragOver={(e) => handleDragOver(e, panel.id)}
                  onDragEnd={handleDragEnd}
                  className='bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200'
                >
                  <div className='flex items-center justify-between'>
                    {/* Left side - Icon and Info */}
                    <div className='flex items-center space-x-4 flex-1'>
                      <div className='flex-1'>
                        <h3 className='text-lg md:text-xl font-semibold text-gray-900 mb-1'>
                          {panel.name}
                        </h3>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className='flex items-center space-x-2 md:space-x-3'>
                      {/* Edit button */}
                      {user?.permissions?.canUpdatePanels && (
                        <button
                          onClick={() => onEditPanel(panel)}
                          className='w-10 h-10 bg-[#D4B896] rounded-full flex items-center justify-center hover:bg-[#C4A886] transition-colors'
                        >
                          <Pencil className='w-5 h-5 text-white' />
                        </button>
                      )}

                      {/* Delete button */}
                      {user?.permissions?.canDeletePanels && (
                        <button
                          onClick={() => deletePanel(panel.id)}
                          className='w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
                        >
                          <Trash2 className='w-5 h-5 text-white' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {user?.permissions?.canCreatePanels && (
        <button
          onClick={onCreatePanel}
          className='fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-blue-900 rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-50'
        >
          <Plus className='w-7 h-7 md:w-8 md:h-8 text-white' />
        </button>
      )}
    </div>
  );
}
