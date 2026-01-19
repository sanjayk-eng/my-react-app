import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, setClinics } from '../../utils/localStorage.js';
import { useToast } from '../../context/ToastContext.jsx';
import { initializeSampleData } from '../../utils/sampleData.js';
import ClinicInfoForm from '../../components/forms/ClinicInfoForm.jsx';
import FinancialSettingsForm from '../../components/forms/FinancialSettingsForm.jsx';
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

  const handleSaveFinancialSettings = async (financialSettings) => {
    try {
      const clinics = getClinics();
      const updatedClinics = clinics.map(c => 
        c.id === id 
          ? { ...c, financialSettings, updatedAt: new Date().toISOString() }
          : c
      );
      
      setClinics(updatedClinics);
      
      // Update local clinic state
      setClinic(prev => ({ ...prev, financialSettings }));
      
      showSuccess('Financial settings saved successfully!');
    } catch (error) {
      console.error('Error saving financial settings:', error);
      showError('Failed to save financial settings. Please try again.');
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

      {/* Financial Settings Section */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">Financial Configuration</h2>
          <p className="form-card-description">
            Set up commission splitting, lab fees, and calculation methods for this clinic
          </p>
        </div>
        
        <FinancialSettingsForm
          clinic={clinic}
          onSave={handleSaveFinancialSettings}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ClinicSettingsPage;