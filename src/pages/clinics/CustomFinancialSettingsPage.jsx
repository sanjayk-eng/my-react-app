import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomFinancialForm from '../../components/forms/CustomFinancialForm.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const CustomFinancialSettingsPage = () => {
  const { id: clinicId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClinic();
  }, [clinicId]);

  const loadClinic = async () => {
    try {
      setIsLoading(true);
      
      // Get clinics from localStorage
      const clinics = JSON.parse(localStorage.getItem('clinics') || '[]');
      const foundClinic = clinics.find(c => c.id === clinicId);
      
      if (!foundClinic) {
        setError('Clinic not found');
        return;
      }
      
      // Try to load existing custom financial settings from localStorage
      const savedSettings = localStorage.getItem(`customFinancialSettings_${clinicId}`);
      if (savedSettings) {
        foundClinic.customFinancialSettings = JSON.parse(savedSettings);
      }
      
      setClinic(foundClinic);
    } catch (err) {
      setError('Failed to load clinic information');
      console.error('Error loading clinic:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (customFinancialSettings) => {
    try {
      // Save to localStorage
      localStorage.setItem(`customFinancialSettings_${clinicId}`, JSON.stringify(customFinancialSettings));
      
      // Update clinic state
      setClinic(prev => ({
        ...prev,
        customFinancialSettings
      }));
      
      showToast('Custom financial settings saved successfully!', 'success');
      
      // Navigate to income management page
      navigate(`/clinics/${clinicId}/income`);
    } catch (error) {
      showToast('Failed to save custom financial settings', 'error');
      console.error('Error saving custom financial settings:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/clinics/${clinicId}/settings`);
  };

  const handleGoToIncomeEntry = () => {
    navigate(`/clinics/${clinicId}/income`);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading clinic information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/clinics')} variant="primary">
            Back to Clinics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Custom Financial Settings</h1>
          <p className="page-subtitle">
            Configure custom financial calculation methods for {clinic?.practiceName}
          </p>
        </div>
        
        {clinic?.customFinancialSettings && (
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleGoToIncomeEntry}
            >
              Go to Income Entry
            </Button>
          </div>
        )}
      </div>

      <div className="page-content">
        {clinic?.customFinancialSettings && (
          <div className="alert alert-info">
            <h4>Configuration Status</h4>
            <p>
              Custom financial settings are configured. You can modify them below or proceed to income entry.
            </p>
            <div className="current-config-summary">
              <strong>Current Method:</strong> {' '}
              {clinic.customFinancialSettings.calculationMethod === 'net' ? 'Net Method' : 'Gross Method'}
              {clinic.customFinancialSettings.calculationMethod === 'net' && (
                <span> ({clinic.customFinancialSettings.netMethod.superHolding === 'with' ? 'With' : 'Without'} Super Holding)</span>
              )}
            </div>
          </div>
        )}

        <div className="form-container">
          <CustomFinancialForm
            clinic={clinic}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomFinancialSettingsPage;