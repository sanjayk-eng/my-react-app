import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, setClinics } from '../../utils/localStorage.js';
import { validateForm } from '../../utils/validation.js';
import { useToast } from '../../context/ToastContext.jsx';
import { STATES } from '../../utils/constants.js';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingScreen from '../../components/common/LoadingScreen.jsx';
import '../../styles/pages/edit-clinic.css';

const EditClinicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [clinic, setClinic] = useState(null);
  const [formData, setFormData] = useState({
    practiceName: '',
    abnNumber: '',
    address: '',
    city: '',
    state: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const validationRules = {
    practiceName: { required: true, label: 'Practice Name' },
    abnNumber: { required: true, type: 'abn', label: 'ABN Number' },
    address: { required: true, label: 'Address' },
    city: { required: true, label: 'City' },
    state: { required: true, label: 'State' }
  };

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    
    if (foundClinic) {
      setClinic(foundClinic);
      setFormData({
        practiceName: foundClinic.practiceName || '',
        abnNumber: foundClinic.abnNumber || '',
        address: foundClinic.address || '',
        city: foundClinic.city || '',
        state: foundClinic.state || '',
        isActive: foundClinic.isActive !== undefined ? foundClinic.isActive : true
      });
    }
    
    setIsLoading(false);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate form
    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSaving(false);
      return;
    }

    try {
      const clinics = getClinics();
      const updatedClinics = clinics.map(c => 
        c.id === id 
          ? { 
              ...c, 
              practiceName: formData.practiceName.trim(),
              abnNumber: formData.abnNumber.replace(/\s/g, ''),
              address: formData.address.trim(),
              city: formData.city.trim(),
              state: formData.state,
              isActive: formData.isActive,
              updatedAt: new Date().toISOString()
            }
          : c
      );

      setClinics(updatedClinics);
      showSuccess('Clinic profile updated successfully!');
      navigate('/clinics');
      
    } catch (error) {
      console.error('Clinic update error:', error);
      showError('Failed to update clinic profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      return;
    }

    try {
      const clinics = getClinics();
      const updatedClinics = clinics.filter(c => c.id !== id);
      setClinics(updatedClinics);
      
      showSuccess('Clinic deleted successfully!');
      navigate('/clinics');
      
    } catch (error) {
      console.error('Clinic deletion error:', error);
      showError('Failed to delete clinic. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!clinic) {
    return (
      <div className="edit-clinic-page">
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
    <div className="edit-clinic-page">
      <div className="page-header">
        <h1>Edit Clinic Profile</h1>
        <p className="text-secondary">
          Update the basic information for {clinic.practiceName}
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">Clinic Information</h2>
          <p className="form-card-description">
            Update the basic details for your dental practice
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Practice Name"
            name="practiceName"
            value={formData.practiceName}
            onChange={handleChange}
            placeholder="Enter practice name"
            required
            error={errors.practiceName}
          />

          <Input
            label="ABN Number"
            name="abnNumber"
            value={formData.abnNumber}
            onChange={handleChange}
            placeholder="XX XXX XXX XXX"
            required
            error={errors.abnNumber}
            help="11-digit Australian Business Number"
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter practice address"
            required
            error={errors.address}
          />

          <div className="form-row">
            <div className="form-col">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
                error={errors.city}
              />
            </div>
            <div className="form-col">
              <Select
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                options={STATES}
                placeholder="Select state"
                required
                error={errors.state}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span className="checkbox-text">Clinic is Active</span>
              </label>
              <small className="form-help">
                Inactive clinics will not appear in reports and calculations
              </small>
            </div>
          </div>

          <div className="clinic-metadata">
            <h3>Clinic Information</h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">Created:</span>
                <span className="metadata-value">
                  {new Date(clinic.createdAt).toLocaleDateString()}
                </span>
              </div>
              {clinic.updatedAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Last Updated:</span>
                  <span className="metadata-value">
                    {new Date(clinic.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="metadata-item">
                <span className="metadata-label">Clinic ID:</span>
                <span className="metadata-value">{clinic.id}</span>
              </div>
            </div>
          </div>

          <div className="form-card-footer">
            <div className="form-actions-left">
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete Clinic
              </Button>
            </div>
            <div className="form-actions-right">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/clinics')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSaving}
                disabled={isSaving}
              >
                Update Clinic
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Links */}
      <div className="quick-links-card">
        <h3>Quick Links</h3>
        <div className="quick-links-grid">
          <Button
            variant="outline"
            onClick={() => navigate(`/clinics/${id}/settings`)}
          >
            Financial Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/clinics/${id}/users`)}
          >
            Manage Users
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/clinics/${id}/income`)}
          >
            Income Management
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/clinics/${id}/expenses`)}
          >
            Expense Management
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditClinicPage;