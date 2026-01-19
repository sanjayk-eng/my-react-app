import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth.js';
import LoadingScreen from '../common/LoadingScreen.jsx';

const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsLoading(false);
      
      if (!authenticated) {
        // Clear any stale data
        localStorage.clear();
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;