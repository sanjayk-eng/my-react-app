import { useState, useEffect } from 'react';
import { validateForm } from '../../utils/validation.js';
import { STATES } from '../../utils/constants.js';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';

const ClinicInfoForm = ({ clinic, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    practiceName: '',
    abnNumber: '',
    address: '',
    city: '',
    state: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validationRules = {
    practiceName: { required: true, label: 'Practice Name' },
    abnNumber: { required: true, type: 'abn', label: 'ABN Number' },
    address: { required: true, label: 'Address' },
    city: { required: true, label: 'City' },
    state: { required: true, label: 'State' }
  };

  useEffect(() => {
    if (clinic) {
      setFormData({
        practiceName: clinic.practiceName || '',
        abnNumber: clinic.abnNumber || '',
        address: clinic.address || '',
        city: clinic.city || '',
        state: clinic.state || ''
      });
    }
  }, [clinic]);

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
    setIsSaving(true);

    // Validate form
    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSaving(false);
      return;
    }

    try {
      const clinicInfo = {
        practiceName: formData.practiceName.trim(),
        abnNumber: formData.abnNumber.replace(/\s/g, ''),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state
      };

      await onSave(clinicInfo);
    } catch (error) {
      console.error('Error saving clinic info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
        <div className="form-actions-right">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
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
            Save Clinic Info
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ClinicInfoForm;