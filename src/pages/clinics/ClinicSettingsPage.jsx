import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, setClinics } from '../../utils/localStorage.js';
import { useToast } from '../../context/ToastContext.jsx';
import { initializeSampleData } from '../../utils/sampleData.js';
import ClinicInfoForm from '../../components/forms/ClinicInfoForm.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingScreen from '../../components/common/LoadingScreen.jsx';
import '../../styles/pages/clinic-settings.css';

const ClinicSettingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data if no clinics exist
    initializeSampleData();
    
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    setIsLoading(false);
  }, [id]);

  const handleSaveClinicInfo = async (clinicInfo) => {
    try {
      const clinics = getClinics();
      const updatedClinics = clinics.map(c => 
        c.id === id 
          ? { ...c, ...clinicInfo, updatedAt: new Date().toISOString() }
          : c
      );
      
      setClinics(updatedClinics);
      
      // Update local clinic state
      setClinic(prev => ({ ...prev, ...clinicInfo }));
      
      showSuccess('Clinic information saved successfully!');
    } catch (error) {
      console.error('Error saving clinic info:', error);
      showError('Failed to save clinic information. Please try again.');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/clinics');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!clinic) {
    return (
      <div className="clinic-settings-page">
        <div className="page-header">
          <h1>Clinic Not Found</h1>
          <p className="text-secondary">
            The requested clinic could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="clinic-settings-page">
      <div className="page-header">
        <h1>Clinic Settings</h1>
        <p className="text-secondary">
          Manage clinic information and financial settings for {clinic.practiceName}
        </p>
      </div>

      {/* Clinic Info Section */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">Clinic Information</h2>
          <p className="form-card-description">
            Update the basic details for your dental practice
          </p>
        </div>
        
        <ClinicInfoForm
          clinic={clinic}
          onSave={handleSaveClinicInfo}
          onCancel={handleCancel}
        />
      </div>

      {/* Custom Financial Settings Section */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">Custom Financial Configuration</h2>
          <p className="form-card-description">
            Configure custom financial calculation methods and income entry forms for this clinic
          </p>
        </div>
        
        <div className="financial-config-actions">
          <div className="config-info">
            <p>
              Set up custom financial forms to define how income calculations are performed. 
              This replaces the old financial settings system with a more flexible approach.
            </p>
            
            <div className="config-features">
              <h4>Features:</h4>
              <ul>
                <li>Net Method (with/without super holding)</li>
                <li>Gross Method (with various options)</li>
                <li>Dynamic input fields based on configuration</li>
                <li>Automatic BAS mapping</li>
                <li>Real-time calculations</li>
              </ul>
            </div>
          </div>
          
          <div className="config-buttons">
            <Button
              variant="primary"
              onClick={() => navigate(`/clinics/${id}/custom-financial-settings`)}
            >
              Configure Custom Financial Form
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/clinics/${id}/income`)}
            >
              Go to Income Management
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicSettingsPage;