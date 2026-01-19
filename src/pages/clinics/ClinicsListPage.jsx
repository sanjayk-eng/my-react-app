import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth.js';
import { getClinics } from '../../utils/localStorage.js';
import Button from '../../components/common/Button.jsx';

const ClinicCard = ({ clinic }) => {
  return (
    <div className="clinic-card">
      <div className="clinic-card-header">
        <h3 className="clinic-card-title">{clinic.practiceName}</h3>
        <div className="clinic-card-status">
          <span className={`status-badge ${clinic.isActive ? 'status-active' : 'status-inactive'}`}>
            {clinic.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="clinic-card-content">
        <div className="clinic-info">
          <div className="clinic-info-item">
            <span className="clinic-info-label">ABN:</span>
            <span className="clinic-info-value">{clinic.abnNumber}</span>
          </div>
          <div className="clinic-info-item">
            <span className="clinic-info-label">Location:</span>
            <span className="clinic-info-value">
              {clinic.city}, {clinic.state}
            </span>
          </div>
          <div className="clinic-info-item">
            <span className="clinic-info-label">Created:</span>
            <span className="clinic-info-value">
              {new Date(clinic.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="clinic-card-actions">
        <Link 
          to={`/clinics/${clinic.id}/edit`}
          className="btn btn-outline-secondary btn-sm"
        >
          Edit Profile
        </Link>
        <Link 
          to={`/clinics/${clinic.id}/settings`}
          className="btn btn-outline-primary btn-sm"
        >
          Financial Settings
        </Link>
        <Link 
          to={`/clinics/${clinic.id}/users`}
          className="btn btn-outline-secondary btn-sm"
        >
          Users
        </Link>
        <Link 
          to={`/clinics/${clinic.id}/income`}
          className="btn btn-primary btn-sm"
        >
          Manage
        </Link>
      </div>
    </div>
  );
};

const ClinicsListPage = () => {
  const [clinics, setClinics] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      loadClinics(user.id);
    }
  }, []);

  const loadClinics = (userId) => {
    try {
      const allClinics = getClinics();
      const userClinics = allClinics.filter(clinic => 
        clinic.ownerId === userId
      );
      setClinics(userClinics);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="clinics-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>My Clinics</h1>
          <p className="text-secondary">
            Manage your dental practices and their financial settings
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/clinics/add" className="btn btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Clinic
          </Link>
        </div>
      </div>

      {clinics.length > 0 ? (
        <div className="clinics-grid">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2>No Clinics Yet</h2>
          <p className="text-secondary">
            Get started by adding your first dental practice to the system.
          </p>
          <Link to="/clinics/add" className="btn btn-primary">
            Add Your First Clinic
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClinicsListPage;