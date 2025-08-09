'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefLogo } from './ChefLogo';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react';
import { getTranslations, type Locale } from '@/lib/i18n';

interface EmailVerificationProps {
  locale: Locale;
}

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired';

export function EmailVerification({ locale }: EmailVerificationProps) {
  const t = getTranslations(locale);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/restaurant/verify-email/${verificationToken}`);
      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    // This would need to be implemented - resend verification email
    console.log('Resend verification email');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 text-[#D4B896] mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h2>
            <p className="text-slate-400">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] font-semibold"
            >
              Continue to Dashboard
            </Button>
          </div>
        );

      case 'error':
      case 'expired':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
            </h2>
            <p className="text-slate-400 mb-8">{message}</p>
            
            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                className="w-full h-12 bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] font-semibold"
              >
                <Mail className="w-5 h-5 mr-2" />
                Resend Verification Email
              </Button>
              
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full h-12 border-slate-600 text-white hover:bg-slate-700"
              >
                Continue to Login
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <ChefLogo />
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
          {renderContent()}
        </div>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Need help?{' '}
            <a 
              href="mailto:support@chefenplace.com" 
              className="text-[#D4B896] hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}