'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChefLogo } from './ChefLogo';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const sessionId = searchParams.get('session_id') || searchParams.get('sid');
    const success = searchParams.get('success');

    if (!sessionId || success !== 'true') {
      setStatus('error');
      setMessage('Invalid payment session');
      return;
    }

    // Decode the session ID in case it's URL encoded
    const decodedSessionId = decodeURIComponent(sessionId);

    // Force fix the session ID - replace any spaces with underscores
    const cleanSessionId = decodedSessionId.replace(/cs\s+test/g, 'cs_test');

    verifySession(cleanSessionId);
  }, [searchParams]);

  const verifySession = async (sessionId: string) => {
    try {
      // Clean up session ID if it contains "cs test" (common URL encoding issue)
      let cleanSessionId = sessionId;
      if (cleanSessionId.includes('cs test')) {
        cleanSessionId = cleanSessionId.replace(/cs\s+test/g, 'cs_test');
      }

      // For now, we'll just show success since the webhook should handle the actual verification
      // The backend webhook will process the payment and create the account
      setStatus('success');
      setMessage('Payment successful! Your account is being created. Please check your email for login details.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Session verification error:', error);
      setStatus('error');
      setMessage('Failed to verify payment session');
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    navigate('/restaurant-signup');
  };

  return (
    <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <ChefLogo />
        </div>

        <div className="bg-slate-800 rounded-2xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <Loader className="w-16 h-16 text-[#D4B896] mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-4">Processing Payment</h2>
              <p className="text-slate-400">Please wait while we verify your payment and create your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
              <p className="text-slate-400 mb-8">{message}</p>
              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] font-semibold"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Error</h2>
              <p className="text-slate-400 mb-8">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-12 bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] font-semibold"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-12 border-slate-600 text-white hover:bg-slate-700"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 