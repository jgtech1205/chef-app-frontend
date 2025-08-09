import { useEffect, useState } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  BarChart3,
  Users,
  Download,
  CreditCard
} from 'lucide-react';

interface RestaurantStats {
  total: number;
  active: number;
  trial: number;
  cancelled: number;
  planDistribution: Array<{ _id: string; count: number }>;
}

const StatCard = ({ title, value, color, icon: Icon, bgColor }: any) => (
  <div style={{ 
    minHeight: '140px', 
    margin: '8px', 
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '24px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease-in-out'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ 
        fontSize: '14px',
        fontWeight: '500',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {title}
      </div>
      <div style={{ 
        padding: '8px',
        backgroundColor: bgColor,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
    </div>
    <div style={{ 
      fontSize: '2.25rem', 
      fontWeight: '700', 
      color: '#1e293b',
      lineHeight: '1'
    }}>
      {value}
    </div>
  </div>
);

const PlanDistributionCard = ({ planDistribution }: { planDistribution: any[] }) => (
  <div style={{ 
    margin: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '24px',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{ 
        padding: '8px',
        backgroundColor: '#ede9fe',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <BarChart3 size={20} color="#8b5cf6" />
      </div>
      <div style={{ 
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b'
      }}>
        Plan Distribution
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px' }}>
      {planDistribution.map((plan) => {
        const planConfig: Record<string, { color: string; bgColor: string }> = {
          trial: { color: '#3b82f6', bgColor: '#dbeafe' },
          pro: { color: '#8b5cf6', bgColor: '#ede9fe' }, 
          enterprise: { color: '#f59e0b', bgColor: '#fef3c7' },
        };
        
        const config = planConfig[plan._id] || { color: '#6b7280', bgColor: '#f3f4f6' };
        
        return (
          <div key={plan._id} style={{ 
            textAlign: 'center',
            padding: '16px',
            backgroundColor: config.bgColor,
            borderRadius: '8px',
            border: `1px solid ${config.color}20`
          }}>
            <div style={{ 
              fontSize: '1.75rem',
              fontWeight: '700',
              color: config.color,
              marginBottom: '4px'
            }}>
              {plan.count}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748b', 
              textTransform: 'capitalize',
              fontWeight: '500'
            }}>
              {plan._id}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/restaurant/super-admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ padding: '20px' }}>Failed to load dashboard stats</div>;
  }

  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{ 
        marginBottom: '32px',
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #f1f5f9'
      }}>
        <h1 style={{ 
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0',
          marginBottom: '8px'
        }}>
          Super Admin Dashboard
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          margin: '0'
        }}>
          Manage restaurants and monitor platform performance
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard
          title="Total Restaurants"
          value={stats.total}
          color="#3b82f6"
          bgColor="#dbeafe"
          icon={Building2}
        />
        
        <StatCard
          title="Active Subscriptions"
          value={stats.active}
          color="#059669"
          bgColor="#d1fae5"
          icon={CheckCircle}
        />
        
        <StatCard
          title="Free Trials"  
          value={stats.trial}
          color="#7c3aed"
          bgColor="#ede9fe"
          icon={Clock}
        />
        
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          color="#dc2626"
          bgColor="#fee2e2"
          icon={XCircle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <PlanDistributionCard planDistribution={stats.planDistribution} />
        
        <div style={{ 
          margin: '8px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              padding: '8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={20} color="#6b7280" />
            </div>
            <div style={{ 
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Quick Actions
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => window.location.href = '/super-admin/restaurants'}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              <Building2 size={18} />
              View All Restaurants
            </button>
            
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => {
                // Export functionality could go here
                alert('Export functionality coming soon!');
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Download size={18} />
              Export Data
            </button>
            
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => {
                // Billing overview could go here
                alert('Billing overview coming soon!');
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            >
              <CreditCard size={18} />
              Billing Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};