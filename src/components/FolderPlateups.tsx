import { ArrowLeft, Camera, X, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useGetPlateupsByFolderQuery, useCreatePlateupInFolderMutation, useDeletePlateupMutation, useUpdatePlateupMutation } from '@/features/api/apiSlice';
import placeholderImg from '@/assets/images/placeholder.jpg';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useAppSelector } from '@/app/hooks';

interface FolderPlateupsProps {
  readonly locale: Locale;
}

export function FolderPlateups({ locale }: FolderPlateupsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const folderId = id || '';
  const { data: plateups, isLoading, refetch } = useGetPlateupsByFolderQuery(folderId, { skip: !folderId });
  const [createPlateupInFolder] = useCreatePlateupInFolderMutation();
  const [deletePlateup] = useDeletePlateupMutation();
  const [updatePlateup] = useUpdatePlateupMutation();
  const t = getTranslations(locale);
  const user = useAppSelector((state) => state.auth.user);

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPlateup, setEditingPlateup] = useState<{ id: string; name: string } | null>(null);
  const [title, setTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [plateupToDelete, setPlateupToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 5;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      setError('Please select an image file.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPreview(null);
      setError('Only image files are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setPreview(null);
      setError(`Image must be less than ${MAX_FILE_SIZE_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please select an image file.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be less than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append('name', title.trim());
    data.append('image', file);
    
    try {
      await createPlateupInFolder({ data, folderId }).unwrap();
      toast.success('Plateup created successfully');
      refetch();
      setPreview(null);
      setTitle('');
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
    } catch (err) {
      setError('Save plateup failed. Please try again.');
      toast.error('Failed to create plateup');
      console.error('Save plateup failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (plateupId: string) => {
    setPlateupToDelete(plateupId);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!plateupToDelete) return;
    
    setDeletingId(plateupToDelete);
    setShowDeleteConfirm(false);
    try {
      await deletePlateup(plateupToDelete).unwrap();
      toast.success('Plateup deleted successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to delete plateup');
      console.error('Delete plateup failed', err);
    } finally {
      setDeletingId(null);
      setPlateupToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPlateupToDelete(null);
  };

  const handleEdit = (plateup: { id: string; name: string }) => {
    setEditingPlateup(plateup);
    setEditTitle(plateup.name);
    setShowEditForm(true);
    setOpenMenuId(null);
  };

  const handleEditSave = async () => {
    if (!editingPlateup) return;
    
    setEditError(null);
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    
    setEditLoading(true);
    try {
      await updatePlateup({ id: editingPlateup.id, name: editTitle.trim() }).unwrap();
      toast.success('Plateup updated successfully');
      refetch();
      setShowEditForm(false);
      setEditingPlateup(null);
      setEditTitle('');
    } catch (err) {
      setEditError('Update plateup failed. Please try again.');
      toast.error('Failed to update plateup');
      console.error('Update plateup failed', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingPlateup(null);
    setEditTitle('');
    setEditError(null);
  };

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
          <h1 className='text-[#D4B896] text-xl md:text-2xl font-semibold text-center flex-1'>
            {t.plateUpStandards}
          </h1>
          <div className='w-6' />
        </div>
      </div>
      <div className='px-4 py-1 md:px-8 md:py-8 pb-24'>
        <div className='max-w-4xl mx-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-16 h-16 md:w-20 md:h-20 mb-6'>
                <div className='animate-spin rounded-full h-full w-full border-4 border-[#D4B896] border-t-transparent'></div>
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.loadingPlateups}
              </p>
            </div>
          ) : null}
          
          {!isLoading && plateups && plateups.length > 0 && (
            <div className='mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {plateups.map((plateup) => (
                <div
                  key={plateup.id}
                  className='bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col relative'
                >
                  <button
                    type='button'
                    onClick={() => setSelected(plateup.image?.url || '')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelected(plateup.image?.url || '');
                      }
                    }}
                    className='w-full h-32 p-0 border-0 bg-transparent cursor-pointer focus:outline-none'
                    tabIndex={0}
                    aria-label={plateup.name}
                  >
                    <img
                      src={plateup.image?.url || placeholderImg}
                      alt={plateup.name}
                      className='w-full h-32 object-cover pointer-events-none'
                      draggable={false}
                    />
                  </button>
                  <p className='p-2 text-sm text-center font-medium truncate flex-1'>
                    {plateup.name}
                  </p>
                  
                  {/* Three dots menu */}
                  {(user?.permissions?.canUpdatePlateups || user?.permissions?.canDeletePlateups) && (
                    <div className='absolute top-2 right-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === plateup.id ? null : plateup.id);
                        }}
                        className='w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors'
                        disabled={deletingId === plateup.id}
                      >
                        {deletingId === plateup.id ? (
                          <svg
                            className='animate-spin h-3 w-3 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8v8z'
                            ></path>
                          </svg>
                        ) : (
                          <MoreVertical className='w-3 h-3 text-white' />
                        )}
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === plateup.id && (
                        <>
                          <button
                            className='fixed inset-0 z-10 bg-transparent cursor-default'
                            onClick={() => setOpenMenuId(null)}
                            aria-label="Close menu"
                          />
                          <div className='absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]'>
                            {user?.permissions?.canUpdatePlateups && (
                              <button
                                onClick={() => handleEdit(plateup)}
                                className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
                              >
                                <Edit className='w-4 h-4 mr-2' />
                                Edit
                              </button>
                            )}
                            {user?.permissions?.canDeletePlateups && (
                              <button
                                onClick={() => handleDeleteClick(plateup.id)}
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
          
          {!isLoading && (!plateups || plateups.length === 0) && (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-2xl flex items-center justify-center mb-6'>
                <Camera className='w-12 h-12 md:w-16 md:h-16 text-gray-500' />
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.noPlateups}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {user?.permissions?.canCreatePlateups && (
        <button
          onClick={() => setShowForm(true)}
          className='fixed bottom-30 right-6 md:bottom-8 md:right-8 bg-[#D4B896] rounded-full shadow-lg hover:bg-[#C4A886] transition-colors flex items-center justify-center z-50 px-4 py-2'
        >
          <span className='text-white text-sm font-medium'>Add Plate Up Picture</span>
        </button>
      )}

      {/* Add Plateup Form Modal */}
      {showForm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>{t.addImage}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setPreview(null);
                  setTitle('');
                  setError(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <input
              type='text'
              placeholder='Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#D4B896] focus:border-transparent'
              disabled={loading}
            />
            <div className='relative'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handlePhotoUpload}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                disabled={loading}
              />
              <div className='w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#D4B896] transition-colors cursor-pointer'>
                <Camera className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>
                  {preview ? 'Change Image' : 'Click to upload image'}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
            {error && <div className='text-red-600 text-sm'>{error}</div>}
            {preview && (
              <img
                src={preview}
                alt='preview'
                className='w-full h-40 object-cover rounded'
              />
            )}
            <button
              type='button'
              onClick={handleSave}
              className={`w-full bg-[#0F1A24] text-white py-2 rounded-lg flex items-center justify-center ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              disabled={loading || !title.trim() || !preview}
            >
              {loading ? (
                <span className='flex items-center gap-2'>
                  <svg
                    className='animate-spin h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v8z'
                    ></path>
                  </svg>
                  {'Saving...'}
                </span>
              ) : (
                t.save
              )}
            </button>
          </div>
        </div>
      )}

      {/* Edit Plateup Form Modal */}
      {showEditForm && editingPlateup && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Edit Plateup</h2>
              <button onClick={handleEditCancel}>
                <X className='w-5 h-5' />
              </button>
            </div>
            <input
              type='text'
              placeholder='Title'
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className='w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#D4B896] focus:border-transparent'
              disabled={editLoading}
            />
            {editError && <div className='text-red-600 text-sm'>{editError}</div>}
            <div className='flex justify-end gap-2'>
              <button 
                onClick={handleEditCancel} 
                className='px-3 py-1'
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className={`px-3 py-1 bg-[#0F1A24] text-white rounded ${
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl w-full max-w-sm p-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-semibold text-gray-800'>Delete Plateup</h2>
            </div>
            <p className='text-gray-600'>
              Are you sure you want to delete this plateup? This action cannot be undone.
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

      {/* Image Preview Modal */}
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
    </div>
  );
}
