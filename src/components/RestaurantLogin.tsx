'use client';

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChefLogo } from './ChefLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTranslations, type Locale } from '@/lib/i18n';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { useLoginByNameMutation } from '@/features/api/apiSlice';

interface RestaurantLoginProps {
  locale: Locale;
  onLoginSuccess?: () => void;
}

export function RestaurantLogin({ locale, onLoginSuccess }: RestaurantLoginProps) {
  const t = getTranslations(locale);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { restaurantName } = useParams<{ restaurantName: string }>();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginByName, { isLoading }] = useLoginByNameMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please fill in both first name and last name');
      return;
    }

    if (!restaurantName) {
      toast.error('Restaurant name not found');
      return;
    }

    try {
      const result = await loginByName({
        restaurantName: restaurantName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }).unwrap();

      // Success - user is logged in
      dispatch(setCredentials({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }));

      toast.success(`Welcome back, ${result.user.name}!`);
      
      // Redirect to restaurant dashboard
      navigate('/dashboard');
      onLoginSuccess?.();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error cases
      if (error?.data?.status === 'pending') {
        toast.error('Your access request is still pending approval. Please contact the restaurant manager.');
      } else if (error?.data?.status === 'rejected') {
        toast.error('Your access request has been rejected. Please contact the restaurant manager.');
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Login failed. Please check your name and try again.');
      }
    }
  };

  // Format restaurant name for display (convert kebab-case to Title Case)
  const formatRestaurantName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ChefLogo />
        
        {/* Restaurant Name Display */}
        <div className="text-center mt-6 mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {restaurantName ? formatRestaurantName(restaurantName) : 'Restaurant'}
          </h1>
          <p className="text-slate-400 text-sm">
            Team Member Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full h-14 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-lg focus:border-[#D4B896] focus:ring-[#D4B896]"
            required
            disabled={isLoading}
          />
          
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full h-14 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-lg focus:border-[#D4B896] focus:ring-[#D4B896]"
            required
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#D4B896] text-[#0F1A24] text-xl font-semibold hover:bg-[#C4A886] transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Instructions */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Enter your first and last name to access the restaurant dashboard.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            If you haven't been added to the team, please contact your restaurant manager.
          </p>
        </div>
      </div>
    </div>
  );
}
