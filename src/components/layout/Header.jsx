import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../../utils/auth.js';
import { useToast } from '../../context/ToastContext.jsx';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { showSuccess } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    showSuccess('Logged out successfully');
    setUserMenuOpen(false);
    // Navigation will be handled by PrivateRoute
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const firstInitial = currentUser.firstName?.charAt(0) || '';
    const lastInitial = currentUser.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  const getUserFullName = () => {
    if (!currentUser) return 'User';
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <Link to="/dashboard" className="app-logo">
          HP Accounting
        </Link>
      </div>

      <div className="header-right">
        <div className="user-menu" ref={userMenuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <div className="user-name">{getUserFullName()}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>

          <div className={`user-menu-dropdown ${userMenuOpen ? 'open' : ''}`}>
            <Link 
              to="/profile" 
              className="user-menu-item"
              onClick={() => setUserMenuOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile
            </Link>
            
            <div className="user-menu-divider"></div>
            
            <button 
              className="user-menu-item"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;