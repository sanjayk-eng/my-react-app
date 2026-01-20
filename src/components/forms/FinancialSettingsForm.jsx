import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';

const FinancialSettingsForm = ({ clinic, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    commissionSplitting: {
      commissionPercent: 60,
      gstOnCommission: true,
      gstPercent: 10
    },
    labFee: {
      enabled: true,
      payBy: 'Clinic'
    },
    netMethod: {
      enabled: false,
      withSuperHolding: false,
      superComponentPercent: 12
    },
    grossMethod: {
      enabled: false,
      selectedMethod: 'basic', // Only one method can be selected
      serviceFacilityFee: true,
      gstOnServiceFacilityFee: true, // Add GST on Service and Facility Fee
      gstOnServiceFacilityFeePercent: 10, // GST % on Service and Facility Fee
      gstLabFeePercent: 10,
      merchantBankFeeWithGst: 0,
      gstPatientFeePercent: 10,
      labFeeChargePercent: 0
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with existing clinic financial settings
  useEffect(() => {
    if (clinic?.financialSettings) {
      setFormData(prevData => {
        const loadedData = {
          ...prevData,
          ...clinic.financialSettings
        };
        // If Gross Method is enabled, ensure Service and Facility Fee is always true
        if (loadedData.grossMethod?.enabled) {
          loadedData.grossMethod = {
            ...loadedData.grossMethod,
            serviceFacilityFee: true
          };
        }
        return loadedData;
      });
    }
  }, [clinic]);

  // Update method enablement based on GST on Commission
  useEffect(() => {
    setFormData(prev => {
      const gstOnCommission = prev.commissionSplitting.gstOnCommission;
      const isGrossMethodActive = !gstOnCommission;
      return {
        ...prev,
        netMethod: {
          ...prev.netMethod,
          enabled: gstOnCommission
        },
        grossMethod: {
          ...prev.grossMethod,
          enabled: isGrossMethodActive,
          // When Gross Method is active, Service and Facility Fee should always be true
          serviceFacilityFee: isGrossMethodActive ? true : prev.grossMethod.serviceFacilityFee
        }
      };
    });
  }, [formData.commissionSplitting.gstOnCommission]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear any existing errors for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Commission splitting validation
    if (!formData.commissionSplitting.commissionPercent || 
        formData.commissionSplitting.commissionPercent < 0 || 
        formData.commissionSplitting.commissionPercent > 100) {
      newErrors['commissionSplitting.commissionPercent'] = 'Commission percentage must be between 0 and 100';
    }

    if (formData.commissionSplitting.gstOnCommission) {
      if (!formData.commissionSplitting.gstPercent || 
          formData.commissionSplitting.gstPercent < 0 || 
          formData.commissionSplitting.gstPercent > 100) {
        newErrors['commissionSplitting.gstPercent'] = 'GST percentage must be between 0 and 100';
      }
    }

    // Net method validation
    if (formData.netMethod.enabled && formData.netMethod.withSuperHolding) {
      if (!formData.netMethod.superComponentPercent || 
          formData.netMethod.superComponentPercent < 0 || 
          formData.netMethod.superComponentPercent > 100) {
        newErrors['netMethod.superComponentPercent'] = 'Super component percentage must be between 0 and 100';
      }
    }

    // Gross method validation
    if (formData.grossMethod.enabled) {
      if (formData.grossMethod.selectedMethod === 'basic') {
        if (formData.grossMethod.gstOnServiceFacilityFee) {
          if (!formData.grossMethod.gstOnServiceFacilityFeePercent || 
              formData.grossMethod.gstOnServiceFacilityFeePercent < 0 || 
              formData.grossMethod.gstOnServiceFacilityFeePercent > 100) {
            newErrors['grossMethod.gstOnServiceFacilityFeePercent'] = 'GST on Service and Facility Fee percentage must be between 0 and 100';
          }
        }
      }

      if (formData.grossMethod.selectedMethod === 'labGst') {
        if (!formData.grossMethod.gstLabFeePercent || 
            formData.grossMethod.gstLabFeePercent < 0 || 
            formData.grossMethod.gstLabFeePercent > 100) {
          newErrors['grossMethod.gstLabFeePercent'] = 'GST on Lab Fee percentage must be between 0 and 100';
        }
      }

      if (formData.grossMethod.selectedMethod === 'merchantBank') {
        if (!formData.grossMethod.merchantBankFeeWithGst || 
            formData.grossMethod.merchantBankFeeWithGst < 0) {
          newErrors['grossMethod.merchantBankFeeWithGst'] = 'Merchant + Bank Fee must be a positive number';
        }
      }

      if (formData.grossMethod.selectedMethod === 'patientGst') {
        if (!formData.grossMethod.gstPatientFeePercent || 
            formData.grossMethod.gstPatientFeePercent < 0 || 
            formData.grossMethod.gstPatientFeePercent > 100) {
          newErrors['grossMethod.gstPatientFeePercent'] = 'GST on Patient Fee percentage must be between 0 and 100';
        }
      }

      if (formData.grossMethod.selectedMethod === 'outwork') {
        if (!formData.grossMethod.labFeeChargePercent || 
            formData.grossMethod.labFeeChargePercent < 0 || 
            formData.grossMethod.labFeeChargePercent > 100) {
          newErrors['grossMethod.labFeeChargePercent'] = 'Lab Fee Charge percentage must be between 0 and 100';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving financial settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="financial-settings-form">
      {/* Configuration Summary */}
      <div className="form-section config-summary">
        <h3 className="form-section-title">Current Configuration</h3>
        <div className="config-grid">
          <div className="config-item">
            <span className="config-label">Commission Splitting:</span>
            <span className="config-value">{formData.commissionSplitting.commissionPercent}%</span>
          </div>
          <div className="config-item">
            <span className="config-label">GST on Commission:</span>
            <span className={`config-value ${formData.commissionSplitting.gstOnCommission ? 'enabled' : 'disabled'}`}>
              {formData.commissionSplitting.gstOnCommission ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Active Method:</span>
            <span className="config-value method-indicator">
              {formData.commissionSplitting.gstOnCommission ? 'Net Method' : 'Gross Method'}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Lab Fee:</span>
            <span className={`config-value ${formData.labFee.enabled ? 'enabled' : 'disabled'}`}>
              {formData.labFee.enabled ? `Enabled (${formData.labFee.payBy} pays)` : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      {/* Commission Splitting Configuration */}
      <div className="form-section">
        <h3 className="form-section-title">Commission Splitting</h3>
        
        <div className="form-row">
          <div className="form-group">
            <Input
              label="Commission Splitting (% on Clinic) *"
              type="number"
              min="0"
              max="100"
              step="0.00"
              value={formData.commissionSplitting.commissionPercent}
              onChange={(e) => handleInputChange('commissionSplitting', 'commissionPercent', parseFloat(e.target.value) || 0)}
              error={errors['commissionSplitting.commissionPercent']}
              placeholder="Enter commission percentage"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.commissionSplitting.gstOnCommission}
                onChange={(e) => handleInputChange('commissionSplitting', 'gstOnCommission', e.target.checked)}
              />
              <span className="checkbox-text">GST on Commission</span>
            </label>
            <small className="form-help">
              {formData.commissionSplitting.gstOnCommission 
                ? "✓ Net Method will be enabled" 
                : "✓ Gross Method will be enabled"}
            </small>
          </div>
        </div>

        {formData.commissionSplitting.gstOnCommission && (
          <div className="form-row conditional-field">
            <div className="form-group">
              <Input
                label="GST % (Default 10%) *"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.commissionSplitting.gstPercent}
                onChange={(e) => handleInputChange('commissionSplitting', 'gstPercent', parseFloat(e.target.value) || 10)}
                error={errors['commissionSplitting.gstPercent']}
                placeholder="10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lab Fee Configuration */}
      <div className="form-section">
        <h3 className="form-section-title">Lab Fee</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.labFee.enabled}
                onChange={(e) => handleInputChange('labFee', 'enabled', e.target.checked)}
              />
              <span className="checkbox-text">Lab Fee</span>
            </label>
          </div>
        </div>

        {formData.labFee.enabled && (
          <div className="form-row conditional-field">
            <div className="form-group">
              <Select
                label="Lab Fee Pay By (Default: Clinic) *"
                value={formData.labFee.payBy}
                onChange={(e) => handleInputChange('labFee', 'payBy', e.target.value)}
                options={[
                  { value: 'Clinic', label: 'Clinic' },
                  { value: 'Dentist', label: 'Dentist' }
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Net Method Settings */}
      {formData.netMethod.enabled && (
        <div className="form-section">
          <h3 className="form-section-title">
            Net Method Settings 
            <span className="method-status active">ACTIVE</span>
          </h3>
          <p className="form-section-description">Active when GST on Commission is enabled</p>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.netMethod.withSuperHolding}
                  onChange={(e) => handleInputChange('netMethod', 'withSuperHolding', e.target.checked)}
                />
                <span className="checkbox-text">With Super Holding</span>
              </label>
            </div>
          </div>

          {formData.netMethod.withSuperHolding && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <Input
                  label="Super Component % *"
                  type="number"
                  min="0"
                  max="100"
                  step="0.00"
                  value={formData.netMethod.superComponentPercent}
                  onChange={(e) => handleInputChange('netMethod', 'superComponentPercent', parseFloat(e.target.value) || 12)}
                  error={errors['netMethod.superComponentPercent']}
                  placeholder="12"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gross Method Settings */}
      {formData.grossMethod.enabled && (
        <div className="form-section">
          <h3 className="form-section-title">
            Gross Method Settings 
            <span className="method-status active">ACTIVE</span>
          </h3>
          <p className="form-section-description">Active when GST on Commission is disabled. Select ONE calculation method:</p>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.grossMethod.serviceFacilityFee}
                  disabled
                />
                <span className="checkbox-text">Service and Facility Fee (Default: True, Fixed)</span>
              </label>
            </div>
          </div>

          {/* Radio button selection for gross method variants */}
          <div className="form-row">
            <div className="form-group">
              <h4>Select Calculation Method:</h4>
              
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="grossMethodType"
                    value="basic"
                    checked={formData.grossMethod.selectedMethod === 'basic'}
                    onChange={(e) => handleInputChange('grossMethod', 'selectedMethod', e.target.value)}
                  />
                  <span className="radio-text">Basic Service & Facility Fee</span>
                  <small className="form-help">Standard gross method with service & facility fee + GST</small>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="grossMethodType"
                    value="labGst"
                    checked={formData.grossMethod.selectedMethod === 'labGst'}
                    onChange={(e) => handleInputChange('grossMethod', 'selectedMethod', e.target.value)}
                  />
                  <span className="radio-text">With GST on Lab Fee</span>
                  <small className="form-help">Service & facility fee + GST on lab fees charged by clinic</small>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="grossMethodType"
                    value="merchantBank"
                    checked={formData.grossMethod.selectedMethod === 'merchantBank'}
                    onChange={(e) => handleInputChange('grossMethod', 'selectedMethod', e.target.value)}
                  />
                  <span className="radio-text">With Merchant/Bank Fees</span>
                  <small className="form-help">Service & facility fee + merchant/bank fees charged to dentist</small>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="grossMethodType"
                    value="patientGst"
                    checked={formData.grossMethod.selectedMethod === 'patientGst'}
                    onChange={(e) => handleInputChange('grossMethod', 'selectedMethod', e.target.value)}
                  />
                  <span className="radio-text">With GST on Patient Fee</span>
                  <small className="form-help">Service & facility fee + GST on patient fees (cosmetic treatments)</small>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="grossMethodType"
                    value="outwork"
                    checked={formData.grossMethod.selectedMethod === 'outwork'}
                    onChange={(e) => handleInputChange('grossMethod', 'selectedMethod', e.target.value)}
                  />
                  <span className="radio-text">Outwork Charge Rate</span>
                  <small className="form-help">Service & facility with outwork charge rate calculation</small>
                </label>
              </div>
            </div>
          </div>

          {/* Conditional fields based on selected method */}
          {formData.grossMethod.selectedMethod === 'basic' && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.gstOnServiceFacilityFee}
                    onChange={(e) => handleInputChange('grossMethod', 'gstOnServiceFacilityFee', e.target.checked)}
                  />
                  <span className="checkbox-text">Add GST on Service and Facility Fee</span>
                </label>
                <small className="form-help">Enable GST calculation on service and facility fee (Default: Enabled)</small>
              </div>
              
              {formData.grossMethod.gstOnServiceFacilityFee && (
                <div className="form-group">
                  <Input
                    label="GST % on Service and Facility Fee *"
                    type="number"
                    min="0"
                    max="100"
                    step="0.00"
                    value={formData.grossMethod.gstOnServiceFacilityFeePercent}
                    onChange={(e) => handleInputChange('grossMethod', 'gstOnServiceFacilityFeePercent', parseFloat(e.target.value) || 10)}
                    error={errors['grossMethod.gstOnServiceFacilityFeePercent']}
                    placeholder="10"
                    help="Enter GST percentage to apply on service and facility fee (e.g., 10%, 20%)"
                  />
                </div>
              )}
            </div>
          )}

          {formData.grossMethod.selectedMethod === 'labGst' && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <Input
                  label="GST % on Lab Fee *"
                  type="number"
                  min="0"
                  max="100"
                  step="0.00"
                  value={formData.grossMethod.gstLabFeePercent}
                  onChange={(e) => handleInputChange('grossMethod', 'gstLabFeePercent', parseFloat(e.target.value) || 10)}
                  error={errors['grossMethod.gstLabFeePercent']}
                  placeholder="10"
                />
              </div>
            </div>
          )}

          {formData.grossMethod.selectedMethod === 'merchantBank' && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <Input
                  label="Merchant Fee + Bank Fee with GST *"
                  type="number"
                  min="0"
                  step="0.00"
                  value={formData.grossMethod.merchantBankFeeWithGst}
                  onChange={(e) => handleInputChange('grossMethod', 'merchantBankFeeWithGst', parseFloat(e.target.value) || 0)}
                  error={errors['grossMethod.merchantBankFeeWithGst']}
                  placeholder="Enter merchant + bank fee amount with GST"
                />
              </div>
            </div>
          )}

          {formData.grossMethod.selectedMethod === 'patientGst' && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <Input
                  label="GST % on Patient Fee *"
                  type="number"
                  min="0"
                  max="100"
                  step="0.00"
                  value={formData.grossMethod.gstPatientFeePercent}
                  onChange={(e) => handleInputChange('grossMethod', 'gstPatientFeePercent', parseFloat(e.target.value) || 10)}
                  error={errors['grossMethod.gstPatientFeePercent']}
                  placeholder="10"
                />
              </div>
            </div>
          )}

          {formData.grossMethod.selectedMethod === 'outwork' && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <Input
                  label="Lab Fee Charge % *"
                  type="number"
                  min="0"
                  max="100"
                  step="0.00"
                  value={formData.grossMethod.labFeeChargePercent}
                  onChange={(e) => handleInputChange('grossMethod', 'labFeeChargePercent', parseFloat(e.target.value) || 0)}
                  error={errors['grossMethod.labFeeChargePercent']}
                  placeholder="Enter lab fee charge percentage"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Save Financial Settings
        </Button>
      </div>
    </form>
  );
};

export default FinancialSettingsForm;