import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getClinics } from '../../utils/localStorage.js';
import { getCurrentUser } from '../../utils/auth.js';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Load clinics whenever location changes (e.g., after creating a new clinic)
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    const userClinics = getClinics().filter(clinic => 
      clinic.ownerId === user?.id && clinic.isActive
    );
    setClinics(userClinics);
    
    // Extract clinic ID from URL if we're on a clinic page
    const clinicIdMatch = location.pathname.match(/\/clinics\/([^\/]+)/);
    const clinicIdFromUrl = clinicIdMatch ? clinicIdMatch[1] : null;
    
    // Set selected clinic: prefer URL clinic ID, then first clinic, or keep current if valid
    setSelectedClinic(prevSelected => {
      if (clinicIdFromUrl && userClinics.some(c => c.id === clinicIdFromUrl)) {
        return clinicIdFromUrl;
      } else if (userClinics.length > 0 && !prevSelected) {
        return userClinics[0].id;
      } else if (prevSelected && !userClinics.some(c => c.id === prevSelected)) {
        // If current selection is invalid, reset to first clinic
        return userClinics.length > 0 ? userClinics[0].id : '';
      }
      return prevSelected; // Keep current selection if valid
    });
  }, [location.pathname]); // Reload when location changes (e.g., after creating clinic)

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getClinicRoutes = () => {
    if (!selectedClinic) return [];
    
    return [
      {
        path: `/clinics/${selectedClinic}/settings`,
        label: 'Clinic Settings',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
      {
        path: `/clinics/${selectedClinic}/users`,
        label: 'Users',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        )
      },
      {
        path: `/clinics/${selectedClinic}/custom-forms`,
        label: 'Custom Forms',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        path: `/clinics/${selectedClinic}/income`,
        label: 'Income Management',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      },
      {
        path: `/clinics/${selectedClinic}/expenses`,
        label: 'Expense Management',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      {
        path: `/clinics/${selectedClinic}/expenses-head`,
        label: 'Expense Categories',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      },
      {
        path: `/clinics/${selectedClinic}/bas`,
        label: 'BAS Reports',
        icon: (
          <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      }
    ];
  };

  const mainNavItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      )
    },
    {
      path: '/clinics',
      label: 'Clinics',
      icon: (
        <svg className="sidebar-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">HP Accounting</div>
          <div className="sidebar-subtitle">Health Professional System</div>
        </div>

        <div className="sidebar-content">
          {/* Main Navigation */}
          <div className="sidebar-section">
            <nav>
              <ul className="sidebar-nav">
                {mainNavItems.map((item) => (
                  <li key={item.path} className="sidebar-nav-item">
                    <Link
                      to={item.path}
                      className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      {item.icon}
                      <span className="sidebar-nav-text">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Clinic Selector */}
          {clinics.length > 0 && (
            <div className="clinic-selector">
              <label className="clinic-selector-label">
                Selected Clinic
              </label>
              <select
                className="clinic-selector-dropdown"
                value={selectedClinic}
                onChange={(e) => {
                  const newClinicId = e.target.value;
                  if (!newClinicId) return;
                  
                  setSelectedClinic(newClinicId);
                  
                  // Extract current page type from URL (settings, users, income, expenses, etc.)
                  const currentPathMatch = location.pathname.match(/\/clinics\/[^\/]+\/(.+)/);
                  const currentPage = currentPathMatch ? currentPathMatch[1] : 'settings';
                  
                  // Navigate to the same page type for the new clinic to keep context
                  navigate(`/clinics/${newClinicId}/${currentPage}`);
                }}
              >
                <option value="">Select a clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.practiceName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clinic-specific Navigation */}
          {selectedClinic && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Clinic Management</div>
              <nav>
                <ul className="sidebar-nav">
                  {getClinicRoutes().map((item) => (
                    <li key={item.path} className="sidebar-nav-item">
                      <Link
                        to={item.path}
                        className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        {item.icon}
                        <span className="sidebar-nav-text">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            © 2024 HP Accounting System
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;