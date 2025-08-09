import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageSelection } from '../components/LanguageSelection';
import Home from '../features/home/Home';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../components/Login';
import { useAppSelector } from '../app/hooks';

export function AppRouter() {
  const isAuth = useAppSelector((state) => state.auth.isAuthenticated);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={<LanguageSelection onLanguageSelect={() => {}} />}
        />
        <Route
          path='/login'
          element={
            <Login
              locale='en'
              onLoginSuccess={() => {
                window.location.href = '/home';
              }}
            />
          }
        />
        <Route
          path='/home'
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        {/* Catch-all route for unknown paths */}
        <Route
          path='*'
          element={
            isAuth ? (
              <Navigate to='/home' replace />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
