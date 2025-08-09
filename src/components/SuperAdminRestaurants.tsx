import React, { useState, useEffect } from 'react';

interface Restaurant {
  _id: string;
  name: string;
  organizationId: string;
  type: string;
  headChef: {
    name: string;
    email: string;
  };
  status: string;
  settings: {
    planType: string;
    maxRecipes: number;
    maxTeamMembers: number;
  };
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  trialStartDate: string;
  trialEndDate: string;
  createdAt: string;
}

export const SuperAdminRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://chef-app-be.vercel.app/api';
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${apiUrl}/restaurant/super-admin/restaurants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }

      const data = await response.json();
      setRestaurants(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return '#3b82f6';
      case 'active': return '#10b981';
      case 'suspended': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'trial': return '#3b82f6';
      case 'pro': return '#8b5cf6';
      case 'enterprise': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getTrialDaysLeft = (trialEndDate: string) => {
    const end = new Date(trialEndDate);
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading restaurants...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#ef4444'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: 'bold', 
          color: '#1e293b',
          marginBottom: '8px' 
        }}>
          Restaurants
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Manage and monitor all restaurant accounts
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Restaurant</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Head Chef</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Plan</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Trial Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => {
                const trialDaysLeft = getTrialDaysLeft(restaurant.trialEndDate);
                const trialColor = trialDaysLeft <= 3 ? '#ef4444' : trialDaysLeft <= 7 ? '#f59e0b' : '#10b981';
                
                return (
                  <tr key={restaurant._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                          {restaurant.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          ID: {restaurant.organizationId}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>
                          Type: {restaurant.type}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>
                          {restaurant.headChef.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {restaurant.headChef.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        backgroundColor: getStatusColor(restaurant.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {restaurant.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        backgroundColor: getPlanColor(restaurant.settings.planType),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {restaurant.settings.planType}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        {restaurant.settings.maxRecipes} recipes, {restaurant.settings.maxTeamMembers} team
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {restaurant.status === 'trial' && (
                        <span style={{ color: trialColor, fontWeight: 'bold', fontSize: '0.875rem' }}>
                          {trialDaysLeft > 0 ? `${trialDaysLeft} days left` : 'Expired'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.875rem', color: '#64748b' }}>
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {restaurants.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px',
          color: '#64748b',
          fontSize: '1.1rem'
        }}>
          No restaurants found
        </div>
      )}
    </div>
  );
};