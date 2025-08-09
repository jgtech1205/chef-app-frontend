import { useEffect } from 'react';
import { Bell, Clock, CheckCircle, Plus } from 'lucide-react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetUnreadCountQuery,
} from '@/features/api/apiSlice';



interface NotificationsScreenProps {
  locale: Locale;
}

export function NotificationsScreen({ locale }: NotificationsScreenProps) {
  const t = getTranslations(locale);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const { data: unreadCount } = useGetUnreadCountQuery();

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && unreadCount !== undefined) {
      localStorage.setItem(
        'unreadNotifications',
        unreadCount > 0 ? 'true' : 'false'
      );
    }
  }, [unreadCount]);

  const markAsRead = (id: string) => {
    markRead(id).catch(() => {});
  };

  const handleCreate = () => {
    navigate('/create-notification');
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-[#0F1A24] px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-[#D4B896] text-2xl md:text-3xl font-bold text-center'>
            {t.notifications}
          </h1>
        </div>
      </div>

      <div className='px-4 py-1 md:px-8 md:py-8 pb-24 mt-4'>
        <div className='max-w-4xl mx-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-16 h-16 md:w-20 md:h-20 mb-6'>
                <div className='animate-spin rounded-full h-full w-full border-4 border-[#D4B896] border-t-transparent'></div>
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.loadingNotifications}
              </p>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh]'>
              <div className='w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-2xl flex items-center justify-center mb-6'>
                <Bell className='w-12 h-12 md:w-16 md:h-16 text-gray-500' />
              </div>
              <p className='text-xl md:text-2xl text-gray-500 font-medium'>
                {t.noNotifications}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {notifications?.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left ${
                    !notification.read ? 'border-l-4 border-[#D4B896]' : ''
                  }`}
                >
                  <div className='flex items-start space-x-4'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notification.type === 'success'
                          ? 'bg-green-100'
                          : notification.type === 'warning'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {notification.type === 'success' ? (
                        <CheckCircle className='w-6 h-6 text-green-600' />
                      ) : notification.type === 'warning' ? (
                        <Bell className='w-6 h-6 text-yellow-600' />
                      ) : (
                        <Bell className='w-6 h-6 text-blue-600' />
                      )}
                    </div>

                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <h3
                          className={`text-lg font-semibold ${
                            !notification.read
                              ? 'text-gray-900'
                              : 'text-gray-600'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className='w-3 h-3 bg-[#D4B896] rounded-full'></div>
                        )}
                      </div>

                      <p className='text-gray-600 mb-2'>
                        {notification.message}
                      </p>

                      <div className='flex items-center text-sm text-gray-500'>
                        <Clock className='w-4 h-4 mr-1' />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {user?.role === 'head-chef' && user.permissions?.canCreateNotifications && (
        <button
          onClick={handleCreate}
          className='fixed bottom-30 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-[#D4B896] rounded-full shadow-lg hover:bg-[#C4A886] transition-colors flex items-center justify-center z-50'
        >
          <Plus className='w-7 h-7 md:w-8 md:h-8 text-white' />
        </button>
      )}
    </div>
  );
}
