import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetPlateupFoldersQuery,
  useCreatePlateupFolderMutation,
  useUpdatePlateupFolderMutation,
  useDeletePlateupFolderMutation,
} from '@/features/api/apiSlice';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useAppSelector } from '@/app/hooks';

interface PlateupFolderListProps {
  readonly locale: Locale;
}

export function PlateupFolderList({ locale }: PlateupFolderListProps) {
  const t = getTranslations(locale);
  const navigate = useNavigate();
  const { data: folders, isLoading, refetch } = useGetPlateupFoldersQuery();
  const [createFolder] = useCreatePlateupFolderMutation();
  const [updateFolder] = useUpdatePlateupFolderMutation();
  const [deleteFolder] = useDeletePlateupFolderMutation();
  const user = useAppSelector((state) => state.auth.user);

  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      setError('Name must be between 2 and 100 characters');
      return;
    }
    try {
      setLoading(true);
      if (editingFolder) {
        await updateFolder({ id: editingFolder.id, data: { name: name.trim() } }).unwrap();
        toast.success('Folder updated');
      } else {
        await createFolder({ name: name.trim() }).unwrap();
        toast.success('Folder created');
      }
      setShowForm(false);
      setEditingFolder(null);
      setName('');
      refetch();
    } catch {
      toast.error(editingFolder ? 'Update folder failed' : 'Create folder failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (folder: { id: string; name: string }) => {
    setEditingFolder(folder);
    setName(folder.name);
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (folder: { id: string; name: string }) => {
    setFolderToDelete(folder);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!folderToDelete) return;
    
    setDeletingId(folderToDelete.id);
    setShowDeleteConfirm(false);
    try {
      await deleteFolder(folderToDelete.id).unwrap();
      toast.success('Folder deleted');
      refetch();
    } catch {
      toast.error('Delete folder failed');
    } finally {
      setDeletingId(null);
      setFolderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setFolderToDelete(null);
  };

  const handleCreateNew = () => {
    setEditingFolder(null);
    setName('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFolder(null);
    setName('');
    setError(null);
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-[#0F1A24] px-4 py-4 md:px-8 md:py-1'>
        <div className='flex items-center justify-center max-w-4xl mx-auto'>
          <h1 className='text-[#D4B896] text-xl md:text-2xl font-semibold'>Plate Ups</h1>
        </div>
      </div>
      <div className='px-4 py-5 md:px-8 md:py-8 pb-24'>
        <div className='max-w-4xl mx-auto'>
          {isLoading ? (
            <p>{t.loadingPlateupFolders}</p>
          ) : null}
          
          {!isLoading && folders && folders.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {folders.map((f) => (
                <div
                  key={f.id}
                  className='bg-white rounded-xl shadow hover:shadow-md p-6 transition-shadow group md:flex md:flex-col md:items-center md:justify-center md:min-h-[120px] flex items-center relative'
                >
                  <button
                    onClick={() => navigate(`/plateups/folder/${f.id}`)}
                    className='flex items-center w-full md:flex-col md:items-center md:justify-center text-left'
                    disabled={deletingId === f.id}
                  >
                    <span className='text-lg font-medium text-gray-800 md:text-center'>{f.name}</span>
                  </button>
                  
                  {/* Three dots menu */}
                  {(user?.permissions?.canUpdatePlateups || user?.permissions?.canDeletePlateups) && (
                    <div className='absolute top-2 right-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === f.id ? null : f.id);
                        }}
                        className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                        disabled={deletingId === f.id}
                      >
                        {deletingId === f.id ? (
                          <div className='w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600'></div>
                        ) : (
                          <MoreVertical className='w-4 h-4 text-gray-500' />
                        )}
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === f.id && (
                        <>
                          <button
                            className='fixed inset-0 z-10 bg-transparent cursor-default'
                            onClick={() => setOpenMenuId(null)}
                            aria-label="Close menu"
                          />
                          <div className='absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]'>
                            {user?.permissions?.canUpdatePlateups && (
                              <button
                                onClick={() => handleEdit(f)}
                                className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
                              >
                                <Edit className='w-4 h-4 mr-2' />
                                Edit
                              </button>
                            )}
                            {user?.permissions?.canDeletePlateups && (
                              <button
                                onClick={() => handleDeleteClick(f)}
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
          )}
          
          {!isLoading && (!folders || folders.length === 0) && (
            <p>{t.noPlateupFolders}</p>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {user?.permissions?.canCreatePlateups && (
        <button
          onClick={handleCreateNew}
          className='fixed bottom-30 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-[#D4B896] rounded-full shadow-lg hover:bg-[#C4A886] transition-colors flex items-center justify-center z-50'
        >
          <Plus className='w-7 h-7 md:w-8 md:h-8 text-white' />
        </button>
      )}

      {showForm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <h2 className='font-semibold text-gray-800'>
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </h2>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Folder name'
              className='w-full border border-gray-200 rounded-lg p-2'
              disabled={loading}
            />
            {error && <div className='text-red-600 text-sm'>{error}</div>}
            <div className='flex justify-end gap-2'>
              <button onClick={handleCloseForm} className='px-3 py-1' disabled={loading}>
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className='px-3 py-1 bg-[#0F1A24] text-white rounded'
                disabled={loading}
              >
                {loading ? 'Saving...' : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && folderToDelete && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Delete Folder</h2>
            </div>
            <p className='text-gray-600'>
              Are you sure you want to delete the folder "{folderToDelete.name}"? All plateups inside will be deleted and this action cannot be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <button 
                onClick={handleDeleteCancel} 
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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
