'use client';

import { User, Mail, Phone, MapPin } from 'lucide-react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useAppSelector } from '@/app/hooks';

interface ProfileContentProps {
  locale: Locale;
}

export function ProfileContent({ locale }: ProfileContentProps) {
  const t = getTranslations(locale);
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-[#0F1A24] px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-[#D4B896] text-2xl md:text-3xl font-bold text-center'>
            {t.profile}
          </h1>
        </div>
      </div>

      <div className='px-4 py-1 md:px-8 md:py-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-2xl p-6 shadow-sm'>
            <div className='flex items-center space-x-4 mb-6'>
              <div className='w-20 h-20 bg-[#D4B896] rounded-full flex items-center justify-center'>
                <User className='w-10 h-10 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {user?.name}
                </h2>
                <p className='text-gray-600'>{user?.role}</p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                <Mail className='w-5 h-5 text-gray-500' />
                <span className='text-gray-900'>{user?.email}</span>
              </div>

              <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                <Phone className='w-5 h-5 text-gray-500' />
                <span className='text-gray-900'>+1 (555) 123-4567</span>
              </div>

              <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                <MapPin className='w-5 h-5 text-gray-500' />
                <span className='text-gray-900'>Kitchen Location</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
