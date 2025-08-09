'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChefLogo } from './ChefLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { useLoginMutation, useQrAuthMutation } from '@/features/api/apiSlice';

interface LoginProps {
  locale: Locale;
  onLoginSuccess?: () => void;
  organizationId?: string;
}

export function Login({ locale, onLoginSuccess, organizationId }: LoginProps) {
  const t = getTranslations(locale);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQrMode, setIsQrMode] = useState(false);

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [qrAuth] = useQrAuthMutation();

  // Check if this is a QR access attempt (has organizationId)
  useEffect(() => {
    if (organizationId) {
      setIsQrMode(true);
      handleQrAuth();
    }
  }, [organizationId]);

  const handleQrAuth = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const result = await qrAuth({ orgId: organizationId }).unwrap();
      
      dispatch(setCredentials({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }));

      toast.success('Welcome to the restaurant!');
      navigate('/dashboard');
      onLoginSuccess?.();
    } catch (error) {
      console.error('QR authentication error:', error);
      toast.error('Failed to access restaurant. Please contact the head chef.');
      // Fall back to regular login form
      setIsQrMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password }).unwrap();
      
      dispatch(setCredentials({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }));

      // Fetch restaurant information and set organization name
      try {
                  const apiUrl = import.meta.env.VITE_API_URL || 'https://chef-app-be.vercel.app/api';
          const restaurantResponse = await fetch(`${apiUrl}/restaurant/head-chef/my-restaurant`, {
          headers: {
            'Authorization': `Bearer ${result.accessToken}`,
          },
        });
        
        if (restaurantResponse.ok) {
          const restaurantData = await restaurantResponse.json();
          localStorage.setItem('organizationName', restaurantData.data.name);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant info:', error);
      }

      toast.success('Login successful!');
      navigate('/dashboard');
      onLoginSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  if (isQrMode && isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          <ChefLogo />
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4B896] mx-auto"></div>
            <p className="text-white mt-4">Accessing restaurant...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ChefLogo />
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-lg focus:border-[#D4B896] focus:ring-[#D4B896]"
            required
          />
          <Input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-14 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-lg focus:border-[#D4B896] focus:ring-[#D4B896]"
            required
          />
          <Button
            type="submit"
            disabled={isLoading || loginLoading}
            className="w-full h-14 bg-[#D4B896] text-[#0F1A24] hover:bg-[#C4A886] text-lg font-semibold"
          >
            {isLoading || loginLoading ? 'Signing in...' : t.signIn}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-400">
            {t.dontHaveAccount}{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-[#D4B896] hover:underline"
            >
              {t.signUp}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
