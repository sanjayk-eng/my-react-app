import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth.js';
import { getClinics, setClinics } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import { validateForm } from '../../utils/validation.js';
import { useToast } from '../../context/ToastContext.jsx';
import { STATES } from '../../utils/constants.js';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';

const AddClinicPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    practiceName: '',
    abnNumber: '',
    address: '',
    city: '',
    state: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validationRules = {
    practiceName: { required: true, label: 'Practice Name' },
    abnNumber: { required: true, type: 'abn', label: 'ABN Number' },
    address: { required: true, label: 'Address' },
    city: { required: true, label: 'City' },
    state: { required: true, label: 'State' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        showError('User not authenticated');
        setIsLoading(false);
        return;
      }

      const clinics = getClinics();
      const newClinic = {
        id: generateUniqueId(),
        ownerId: currentUser.id,
        practiceName: formData.practiceName.trim(),
        abnNumber: formData.abnNumber.replace(/\s/g, ''),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        createdAt: new Date().toISOString(),
        financialSettings: {}, // Will be set up in next step
        isActive: true
      };

      const updatedClinics = [...clinics, newClinic];
      setClinics(updatedClinics);

      showSuccess('Clinic created successfully!');
      navigate(`/clinics/${newClinic.id}/settings`);
      
    } catch (error) {
      console.error('Clinic creation error:', error);
      showError('Failed to create clinic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-clinic-page">
      <div className="page-header">
        <h1>Add New Clinic</h1>
        <p className="text-secondary">
          Set up a new dental practice in your accounting system
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">Clinic Information</h2>
          <p className="form-card-description">
            Enter the basic details for your dental practice
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

          <div className="form-card-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/clinics')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Create Clinic
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClinicPage;