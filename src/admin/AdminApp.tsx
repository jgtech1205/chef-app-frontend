import { Admin, Resource, Layout, AppBar, Title } from 'react-admin';
import { dataProvider } from './dataProvider';
import { RestaurantList } from './RestaurantList';
import { RestaurantShow } from './RestaurantShow';
import { Dashboard } from './Dashboard';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: any; // This could be typed more specifically if needed
}

interface CustomLayoutProps {
  children: React.ReactNode;
}

// Custom App Bar with Super Admin branding
const CustomAppBar = () => (
  <AppBar>
    <Title title="Chef en Place - Super Admin" />
    <div style={{ flex: 1 }} />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      marginRight: '16px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: '6px 16px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        backgroundColor: '#22c55e',
        borderRadius: '50%'
      }} />
      <span style={{ fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.02em' }}>Super Admin</span>
    </div>
  </AppBar>
);

// Custom Layout with our branded app bar
const CustomLayout = (props: CustomLayoutProps) => (
  <Layout {...props} appBar={CustomAppBar} />
);

// Auth provider for React Admin
const authProvider = {
  login: async ({ username, password }: LoginCredentials): Promise<LoginResponse> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Check if user is super admin
      if (data.user.role !== 'super-admin') {
        throw new Error('Super Admin access required');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  logout: async () => {
    try {
      // Call the logout API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Clear all auth data
    localStorage.clear();
    
    // Redirect to login page
    window.location.href = '/login';
    
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return Promise.reject();
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'super-admin') {
      return Promise.reject(new Error('Super Admin access required'));
    }

    return Promise.resolve();
  },

  checkError: (error: { status?: number; message?: string }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return Promise.resolve({
          id: userData._id,
          fullName: userData.name,
          avatar: userData.avatar,
        });
      }
    } catch (error) {
      // Silent fail
    }
    return Promise.reject();
  },

  getPermissions: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return Promise.resolve(userData.role);
    }
    return Promise.reject();
  },
};

export const AdminApp = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
    layout={CustomLayout}
    title="Chef en Place - Super Admin"
    darkTheme={{ palette: { mode: 'dark' } }}
    basename="/super-admin"
  >
    <Resource
      name="restaurants"
      list={RestaurantList}
      show={RestaurantShow}
      options={{ label: 'Restaurants' }}
    />
    
    {/* Future resources can be added here */}
    {/* <Resource name="subscriptions" list={SubscriptionList} options={{ label: 'Subscriptions' }} /> */}
    {/* <Resource name="users" list={UserList} options={{ label: 'Users' }} /> */}
  </Admin>
);