import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Trash2,
  User2,
  Copy,
  Download,
  MoreVertical,
  ChefHat,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { getTranslations, type Locale } from '@/lib/i18n';
import toast from 'react-hot-toast';
import {
  useDeleteTeamMemberMutation,
  useGetTeamMembersQuery,
  useUpdateTeamMemberMutation,
  useGetPendingRequestsQuery,
  useUpdatePendingRequestMutation,
  useGetMyRestaurantQuery,
} from '@/features/api/apiSlice';
import type { UserPermissions } from '@/lib/types';

interface TeamManagementProps {
  readonly locale: Locale;
}

export function TeamManagement({ locale }: TeamManagementProps) {
  const t = getTranslations(locale);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: teamMembers, isLoading } = useGetTeamMembersQuery();
  const { data: pendingRequests, isLoading: isPendingLoading } = useGetPendingRequestsQuery();
  const { data: restaurant, isLoading: isRestaurantLoading } = useGetMyRestaurantQuery();
  const [updateTeamMember] = useUpdateTeamMemberMutation();
  const [deleteTeamMember] = useDeleteTeamMemberMutation();
  const [updatePendingRequest] = useUpdatePendingRequestMutation();
  const qrRef = useRef<HTMLDivElement>(null);
  const restaurantQrRef = useRef<HTMLDivElement>(null);
  const restaurantAccessQrRef = useRef<HTMLDivElement>(null);
  const [orgName, setOrgName] = useState(
    user?.organization ??
      (typeof localStorage !== 'undefined'
        ? localStorage.getItem('organizationName') || ''
        : '')
  );
  const [orgNameDirty, setOrgNameDirty] = useState(false);
  const [isSavingOrgName, setIsSavingOrgName] = useState(false);

  const [members, setMembers] = useState<
    {
      id: string;
      name: string;
      role: string;
      status: string;
      permissions: UserPermissions;
    }[]
  >([]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [permissionModal, setPermissionModal] = useState<string | null>(null);
  const [approvalSuccessModal, setApprovalSuccessModal] = useState<{ name: string; loginUrl: string } | null>(null);
  const [permState, setPermState] = useState<UserPermissions>({
    canViewRecipes: false,
    canEditRecipes: false,
    canDeleteRecipes: false,
    canUpdateRecipes: false,

    canViewPlateups: false,
    canCreatePlateups: false,
    canDeletePlateups: false,
    canUpdatePlateups: false,

    canViewNotifications: false,
    canCreateNotifications: false,
    canDeleteNotifications: false,
    canUpdateNotifications: false,

    canViewPanels: false,
    canCreatePanels: false,
    canDeletePanels: false,
    canUpdatePanels: false,

    canManageTeam: false,
    canAccessAdmin: false,
  });

  useEffect(() => {
    if (teamMembers) {
      const formatted = teamMembers
        ?.filter((m) => m?.role !== 'head-chef')
        .map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          status: m.status,
          permissions: m.permissions || {
            canViewRecipes: false,
            canEditRecipes: false,
            canDeleteRecipes: false,
            canUpdateRecipes: false,

            canViewPlateups: false,
            canCreatePlateups: false,
            canDeletePlateups: false,
            canUpdatePlateups: false,

            canViewNotifications: false,
            canCreateNotifications: false,
            canDeleteNotifications: false,
            canUpdateNotifications: false,

            canViewPanels: false,
            canCreatePanels: false,
            canDeletePanels: false,
            canUpdatePanels: false,

            canManageTeam: false,
            canAccessAdmin: false,
          },
        }));
      setMembers(formatted);
    }
  }, [teamMembers]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('organizationName', orgName);
    }
  }, [orgName]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.team-action-dropdown')) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown]);

  const handleStatusChange = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const newStatus = member.status === 'active' ? 'pending' : 'active';
    updateTeamMember({ id, data: { status: newStatus } })
      .unwrap()
      .then(() => {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        toast.success('Member status updated');
      })
      .catch(() => toast.error('Failed to update status'));
  };

  const deleteMember = (id: string) => {
    deleteTeamMember(id)
      .unwrap()
      .then(() => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        toast.success('Member deleted successfully');
      })
      .catch(() => toast.error('Failed to delete member'));
  };

  const savePermissions = (id: string) => {
    updateTeamMember({ id, data: { permissions: permState } })
      .unwrap()
      .then(() => {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, permissions: permState } : m))
        );
        toast.success('Permissions updated');
        setPermissionModal(null);
      })
      .catch(() => toast.error('Failed to update permissions'));
  };

  // Show approval success modal with login instructions
  const showApprovalSuccessModal = (memberName: string, loginUrl: string) => {
    setApprovalSuccessModal({ name: memberName, loginUrl });
  };

  // Generate QR code URL for restaurant-specific login
  const restaurantName = restaurant?.name?.toLowerCase().replace(/\s+/g, '-') || 'restaurant';
  const qrValue = `${window.location.origin}/qr/${user?.id || 'placeholder'}`;

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-[#0F1A24] px-4 py-4 md:px-8 md:py-1 shadow-md sticky top-0 z-10'>
        <div className='flex items-center space-x-4 max-w-4xl mx-auto'>
          <button
            onClick={() => navigate(-1)}
            className='text-[#D4B896] hover:text-white transition-colors p-1'
            title='Back'
          >
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className='text-[#D4B896] text-xl md:text-2xl font-semibold flex-1 text-center md:flex-none'>
            {t.teamManagement}
          </h1>
          <div className='w-6' />
        </div>
      </header>

      <main className='p-4 md:p-8 space-y-10 max-w-4xl mx-auto'>
        {/* Restaurant Name Display */}
        <section className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
          <div className='flex items-center gap-3'>
            <User2 className='w-7 h-7 text-[#0F1A24] bg-gray-100 rounded-full p-1' />
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>Restaurant Name</h2>
              <p className='text-sm text-gray-600 font-medium'>
                {isRestaurantLoading ? 'Loading...' : restaurant?.name || 'Chef En Place'}
              </p>
            </div>
          </div>
        </section>

        {/* Team Members Card */}
        <section className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <User2 className='w-5 h-5 text-[#0F1A24]' /> {t.teamMembers}
          </h2>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <span className='text-gray-400 animate-pulse'>
                Loading team members...
              </span>
            </div>
          ) : members.length === 0 ? (
            <div className='flex flex-col items-center py-8'>
              <User2 className='w-10 h-10 text-gray-300 mb-2' />
              <p className='text-gray-500'>{t.noTeamMembers}</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead className='border-b bg-gray-50'>
                  <tr className='text-left'>
                    <th className='py-2 px-2'>Name</th>
                    <th className='py-2 px-2'>Role</th>
                    <th className='py-2 px-2'>Status</th>
                    <th className='py-2 px-2'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map((m, idx) => (
                    <tr
                      key={m.id}
                      className={`border-b last:border-none ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className='px-2 py-1 text-xs font-medium'>
                        <span>{m.name}</span>
                      </td>
                      <td className='py-2 px-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            m.role === 'head-chef'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className='py-2 px-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className='py-2 px-2 space-x-2 flex items-center relative'>
                        <button
                          className='p-2 rounded-full hover:bg-gray-100 transition team-action-dropdown'
                          title='Actions'
                          onClick={() =>
                            setOpenDropdown(openDropdown === m.id ? null : m.id)
                          }
                          aria-haspopup='menu'
                          aria-expanded={openDropdown === m.id}
                        >
                          <MoreVertical className='w-5 h-5' />
                        </button>
                        {openDropdown === m.id && (
                          <div
                            className='absolute z-20 right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 team-action-dropdown'
                            role='menu'
                          >
                            <button
                              className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm'
                              onClick={() => {
                                setPermissionModal(m.id);
                                setPermState(m.permissions);
                                setOpenDropdown(null);
                              }}
                              role='menuitem'
                            >
                              <User2 className='w-4 h-4' /> Permissions
                            </button>
                            <button
                              className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm'
                              onClick={() => {
                                handleStatusChange(m.id);
                                setOpenDropdown(null);
                              }}
                              role='menuitem'
                            >
                              {m.status === 'active' ? (
                                <>
                                  <Clock className='w-4 h-4 text-yellow-600' />{' '}
                                  Revoke Access
                                </>
                              ) : (
                                <>
                                  <CheckCircle className='w-4 h-4 text-green-600' />{' '}
                                  Grant Access
                                </>
                              )}
                            </button>
                            <button
                              className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600'
                              onClick={() => {
                                deleteMember(m.id);
                                setOpenDropdown(null);
                              }}
                              role='menuitem'
                            >
                              <Trash2 className='w-4 h-4' /> Delete Member
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pending Requests Card */}
        <section className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Clock className='w-5 h-5 text-[#0F1A24]' /> Pending Join Requests
          </h2>
          {isPendingLoading ? (
            <div className='flex justify-center items-center py-8'>
              <span className='text-gray-400 animate-pulse'>
                Loading pending requests...
              </span>
            </div>
          ) : !pendingRequests || pendingRequests.length === 0 ? (
            <div className='flex flex-col items-center py-8'>
              <Clock className='w-10 h-10 text-gray-300 mb-2' />
              <p className='text-gray-500'>No pending requests</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {pendingRequests.map((request) => (
                <div key={request.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
                  <div className='flex items-center gap-3'>
                    <User2 className='w-8 h-8 text-gray-400 bg-white rounded-full p-1.5' />
                    <div>
                      <p className='font-medium text-gray-900'>{request.name}</p>
                      <p className='text-sm text-gray-500'>Wants to join your team</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        updatePendingRequest({ id: request.id, status: 'active' })
                          .unwrap()
                          .then((result) => {
                            console.log('Approval result:', result);
                            
                            // Check if loginUrl is present in the response
                            if (result.loginUrl) {
                              // Show success message with login instructions
                              toast.success(`${request.name} approved successfully!`, {
                                duration: 5000,
                              });
                              
                              // Show login URL and instructions
                              showApprovalSuccessModal(request.name, result.loginUrl);
                            } else {
                              // Just a status update, not a new approval
                              toast.success(`${request.name} approved!`);
                            }
                          })
                          .catch((error) => {
                            console.error('Approval failed:', error);
                            toast.error('Failed to approve request');
                          });
                      }}
                      className='px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-1'
                    >
                      <CheckCircle className='w-4 h-4' />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updatePendingRequest({ id: request.id, status: 'rejected' })
                          .unwrap()
                          .then(() => {
                            toast.success(`${request.name} rejected`);
                          })
                          .catch(() => toast.error('Failed to reject request'));
                      }}
                      className='px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-1'
                    >
                      <Trash2 className='w-4 h-4' />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invite Section Card */}
        <section className='bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <User2 className='w-5 h-5 text-[#0F1A24]' /> {t.invite}
          </h2>
          <div className='text-center mt-6'>
            <p className='text-sm text-gray-600 mb-2'>Team members scan this QR code to access the restaurant login page</p>
            <div
              className='mt-2 inline-block bg-white p-4 rounded-xl border border-gray-200 shadow-sm'
              id='invite-qr-code'
              ref={qrRef}
            >
              <QRCode value={qrValue} />
            </div>
          </div>
          <div className='bg-gray-50 p-3 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 mt-4 border border-gray-100'>
            <div className='flex-1 text-gray-700 text-center md:text-left'>
              <span className='text-xs text-gray-500'>{t.inviteLink}:</span>{' '}
              <span className='font-semibold break-all text-sm'>{qrValue}</span>
            </div>
            <div className='flex flex-row gap-2 mt-2 md:mt-0'>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrValue);
                  toast.success('Link copied to clipboard!');
                }}
                className='px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors flex items-center gap-1'
                title='Copy Link'
              >
                <Copy className='w-4 h-4' />{' '}
                <span className='hidden md:inline'>{t.copyLink}</span>
              </button>
              {/* Download QR Code */}
              <button
                onClick={() => {
                  const svgElement = qrRef.current?.querySelector('svg');
                  if (!svgElement) {
                    toast.error('QR code not found');
                    return;
                  }

                  const svgData = new XMLSerializer().serializeToString(
                    svgElement
                  );
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');

                  const img = new Image();
                  const svgBlob = new Blob([svgData], {
                    type: 'image/svg+xml;charset=utf-8',
                  });
                  const url = URL.createObjectURL(svgBlob);

                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const link = document.createElement('a');
                    link.download = 'invite-qr-code.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  };

                  img.onerror = () => toast.error('Failed to load QR image');
                  img.src = url;
                }}
                className='px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors flex items-center gap-1'
                title='Download QR Code'
              >
                <Download className='w-4 h-4' />{' '}
                <span className='hidden md:inline'>{t.downloadQr}</span>
              </button>
            </div>
          </div>
          <p className='text-xs text-gray-400 text-center mt-2'>
            Share this QR code with team members. When scanned, they'll be redirected to the restaurant login page where they can enter their name to access the dashboard.
          </p>
        </section>

        {/* Restaurant Recipe QR Section Card */}
        <section className='bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <ChefHat className='w-5 h-5 text-[#0F1A24]' /> Chef Request Access
          </h2>
          <div className='text-center mt-6'>
            <p className='text-sm text-gray-600 mb-2'>QR code for chefs to request access to restaurant recipes</p>
            <div
              className='mt-2 inline-block bg-white p-4 rounded-xl border border-gray-200 shadow-sm'
              id='restaurant-qr-code'
              ref={restaurantQrRef}
            >
              <QRCode value={`${window.location.origin}/qr/${user?.id || 'headchef'}`} />
            </div>
          </div>
          <div className='bg-gray-50 p-3 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 mt-4 border border-gray-100'>
            <div className='flex-1 text-gray-700 text-center md:text-left'>
              <span className='text-xs text-gray-500'>Chef Request Link:</span>{' '}
              <span className='font-semibold break-all text-sm'>
                {`${window.location.origin}/qr/${user?.id || 'headchef'}`}
              </span>
            </div>
            <div className='flex flex-row gap-2 mt-2 md:mt-0'>
              <button
                onClick={() => {
                  const chefRequestUrl = `${window.location.origin}/qr/${user?.id || 'headchef'}`;
                  navigator.clipboard.writeText(chefRequestUrl);
                  toast.success('Chef request link copied to clipboard!');
                }}
                className='px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors flex items-center gap-1'
                title='Copy Chef Request Link'
              >
                <Copy className='w-4 h-4' />{' '}
                <span className='hidden md:inline'>Copy Link</span>
              </button>
              {/* Download Chef Request QR Code */}
              <button
                onClick={() => {
                  const svgElement = restaurantQrRef.current?.querySelector('svg');
                  if (!svgElement) {
                    toast.error('Chef request QR code not found');
                    return;
                  }

                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');

                  const img = new Image();
                  const svgBlob = new Blob([svgData], {
                    type: 'image/svg+xml;charset=utf-8',
                  });
                  const url = URL.createObjectURL(svgBlob);

                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const link = document.createElement('a');
                    link.download = 'chef-request-qr.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  };

                  img.onerror = () => toast.error('Failed to load chef request QR image');
                  img.src = url;
                }}
                className='px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors flex items-center gap-1'
                title='Download Chef Request QR Code'
              >
                <Download className='w-4 h-4' />{' '}
                <span className='hidden md:inline'>Download QR</span>
              </button>
            </div>
          </div>
          <p className='text-xs text-gray-400 text-center mt-2'>
            Share this QR code with chefs to request access to your restaurant's recipes.
            After approval, they can scan the restaurant QR code for immediate access.
          </p>
        </section>

        {/* Restaurant Access QR Section Card */}
        <section className='bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <ChefHat className='w-5 h-5 text-[#0F1A24]' /> Restaurant Access (After Approval)
          </h2>
          <div className='text-center mt-6'>
            <p className='text-sm text-gray-600 mb-2'>QR code for approved chefs to access restaurant recipes</p>
            <div
              className='mt-2 inline-block bg-white p-4 rounded-xl border border-gray-200 shadow-sm'
              id='restaurant-access-qr-code'
              ref={restaurantAccessQrRef}
            >
              <QRCode value={`${window.location.origin}/restaurant/${user?.organization || 'restaurant'}`} />
            </div>
          </div>
          <div className='bg-gray-50 p-3 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 mt-4 border border-gray-100'>
            <div className='flex-1 text-gray-700 text-center md:text-left'>
              <span className='text-xs text-gray-500'>Restaurant Access Link:</span>{' '}
              <span className='font-semibold break-all text-sm'>
                {`${window.location.origin}/restaurant/${user?.organization || 'restaurant'}`}
              </span>
            </div>
            <div className='flex flex-row gap-2 mt-2 md:mt-0'>
              <button
                onClick={() => {
                  const restaurantUrl = `${window.location.origin}/restaurant/${user?.organization || 'restaurant'}`;
                  navigator.clipboard.writeText(restaurantUrl);
                  toast.success('Restaurant access link copied to clipboard!');
                }}
                className='px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors flex items-center gap-1'
                title='Copy Restaurant Access Link'
              >
                <Copy className='w-4 h-4' />{' '}
                <span className='hidden md:inline'>Copy Link</span>
              </button>
              {/* Download Restaurant Access QR Code */}
              <button
                onClick={() => {
                  const svgElement = restaurantAccessQrRef.current?.querySelector('svg');
                  if (!svgElement) {
                    toast.error('Restaurant access QR code not found');
                    return;
                  }

                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');

                  const img = new Image();
                  const svgBlob = new Blob([svgData], {
                    type: 'image/svg+xml;charset=utf-8',
                  });
                  const url = URL.createObjectURL(svgBlob);

                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const link = document.createElement('a');
                    link.download = 'restaurant-access-qr.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  };

                  img.onerror = () => toast.error('Failed to load restaurant access QR image');
                  img.src = url;
                }}
                className='px-3 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors flex items-center gap-1'
                title='Download Restaurant Access QR Code'
              >
                <Download className='w-4 h-4' />{' '}
                <span className='hidden md:inline'>Download QR</span>
              </button>
            </div>
          </div>
          <p className='text-xs text-gray-400 text-center mt-2'>
            Share this QR code with approved chefs for immediate access to recipes.
            One scan grants permanent access - no login required.
          </p>
        </section>

        {permissionModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 team-action-dropdown'>
            <div className='bg-white rounded-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto'>
              <h3 className='text-lg font-semibold'>{t.permissions}</h3>
              
              {/* Recipes Group */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-blue-600 uppercase tracking-wide border-b border-blue-100 pb-1'>
                  Recipes
                </h4>
                <div className='space-y-2 pl-2'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canViewRecipes}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canViewRecipes: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-blue-500'
                    />
                    <span className='text-sm'>View Recipes</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canEditRecipes}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canEditRecipes: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-blue-500'
                    />
                    <span className='text-sm'>{t.canEdit}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canUpdateRecipes}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canUpdateRecipes: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-blue-500'
                    />
                    <span className='text-sm'>{t.canUpdate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canDeleteRecipes}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canDeleteRecipes: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-blue-500'
                    />
                    <span className='text-sm'>{t.canDelete}</span>
                  </label>
                </div>
              </div>

              {/* Plateups Group */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-green-600 uppercase tracking-wide border-b border-green-100 pb-1'>
                  Plateups
                </h4>
                <div className='space-y-2 pl-2'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canViewPlateups}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canViewPlateups: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-green-500'
                    />
                    <span className='text-sm'>View Plateups</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canCreatePlateups}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canCreatePlateups: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-green-500'
                    />
                    <span className='text-sm'>{t.canCreate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canUpdatePlateups}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canUpdatePlateups: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-green-500'
                    />
                    <span className='text-sm'>{t.canUpdate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canDeletePlateups}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canDeletePlateups: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-green-500'
                    />
                    <span className='text-sm'>{t.canDelete}</span>
                  </label>
                </div>
              </div>

              {/* Notifications Group */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-yellow-600 uppercase tracking-wide border-b border-yellow-100 pb-1'>
                  Notifications
                </h4>
                <div className='space-y-2 pl-2'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canViewNotifications}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canViewNotifications: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-yellow-500'
                    />
                    <span className='text-sm'>View Notifications</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canCreateNotifications}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canCreateNotifications: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-yellow-500'
                    />
                    <span className='text-sm'>{t.canCreate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canUpdateNotifications}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canUpdateNotifications: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-yellow-500'
                    />
                    <span className='text-sm'>{t.canUpdate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canDeleteNotifications}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canDeleteNotifications: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-yellow-500'
                    />
                    <span className='text-sm'>{t.canDelete}</span>
                  </label>
                </div>
              </div>

              {/* Panels Group */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-purple-600 uppercase tracking-wide border-b border-purple-100 pb-1'>
                  FOLDERS
                </h4>
                <div className='space-y-2 pl-2'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canViewPanels}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canViewPanels: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-purple-500'
                    />
                    <span className='text-sm'>View Folders</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canCreatePanels}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canCreatePanels: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-purple-500'
                    />
                    <span className='text-sm'>{t.canCreate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canUpdatePanels}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canUpdatePanels: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-purple-500'
                    />
                    <span className='text-sm'>{t.canUpdate}</span>
                  </label>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canDeletePanels}
                      onChange={(e) =>
                        setPermState((p) => ({
                          ...p,
                          canDeletePanels: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 focus:ring-purple-500'
                    />
                    <span className='text-sm'>{t.canDelete}</span>
                  </label>
                </div>
              </div>

              {/* Administration Group */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-red-600 uppercase tracking-wide border-b border-red-100 pb-1'>
                  Administration
                </h4>
                <div className='space-y-2 pl-2'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={permState.canManageTeam}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setPermState((p) => ({
                          ...p,
                          canManageTeam: isChecked,
                          // If manage team is enabled, grant all head chef permissions
                          ...(isChecked && {
                            canViewRecipes: true,
                            canEditRecipes: true,
                            canDeleteRecipes: true,
                            canUpdateRecipes: true,
                            canViewPlateups: true,
                            canCreatePlateups: true,
                            canDeletePlateups: true,
                            canUpdatePlateups: true,
                            canViewNotifications: true,
                            canCreateNotifications: true,
                            canDeleteNotifications: true,
                            canUpdateNotifications: true,
                            canViewPanels: true,
                            canCreatePanels: true,
                            canDeletePanels: true,
                            canUpdatePanels: true,
                          }),
                        }));
                      }}
                      className='rounded border-gray-300 focus:ring-red-500'
                    />
                    <span className='text-sm'>{t.canManageTeam}</span>
                  </label>
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button
                  onClick={() => setPermissionModal(null)}
                  className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors'
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() =>
                    permissionModal && savePermissions(permissionModal)
                  }
                  className='px-4 py-2 rounded-lg bg-[#0F1A24] text-white text-sm hover:bg-[#1a2535] transition-colors'
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approval Success Modal */}
        {approvalSuccessModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
            <div className='bg-white rounded-xl w-full max-w-md p-6 space-y-4'>
              <div className='text-center'>
                <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  {approvalSuccessModal.name} Approved!
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  Team member has been successfully approved and can now access the restaurant dashboard.
                </p>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <h4 className='text-sm font-semibold text-blue-800 mb-2'>Login Instructions:</h4>
                <ol className='text-xs text-blue-700 space-y-1 list-decimal list-inside'>
                  <li>Share this login URL with {approvalSuccessModal.name}</li>
                  <li>They should visit the login page and enter their first and last name</li>
                  <li>Once logged in, they'll have access to the restaurant dashboard</li>
                </ol>
              </div>

              <div className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <span className='text-xs text-gray-500'>Login URL:</span>
                    <div className='font-mono text-xs text-gray-700 break-all mt-1'>
                      {approvalSuccessModal.loginUrl}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(approvalSuccessModal.loginUrl);
                      toast.success('Login URL copied to clipboard!');
                    }}
                    className='ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1'
                  >
                    <Copy className='w-3 h-3' />
                    Copy
                  </button>
                </div>
              </div>

              <div className='flex gap-3 pt-4 border-t'>
                <button
                  onClick={() => setApprovalSuccessModal(null)}
                  className='flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.open(approvalSuccessModal.loginUrl, '_blank');
                    setApprovalSuccessModal(null);
                  }}
                  className='flex-1 px-4 py-2 bg-[#0F1A24] text-white rounded-lg hover:bg-[#1a2535] transition-colors'
                >
                  Open Login Page
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
