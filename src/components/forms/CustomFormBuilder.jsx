import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

const CustomFormBuilder = ({ clinic, editingForm, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    formName: '',
    calculationMethod: 'net', // 'net' or 'gross'
    netMethod: {
      superHolding: 'without', // 'with' or 'without'
      commissionSplitting: 40,
      gstOnCommission: 10,
      labFeeEnabled: true
    },
    grossMethod: {
      serviceFacilityFeePercent: 60,
      gstOnServiceFacilityFee: 10,
      labFeeEnabled: true,
      labFeePaidBy: 'clinic', // 'clinic' or 'dentist'
      gstOnLabFeeEnabled: false,
      merchantBankFeeEnabled: false,
      gstOnMerchantFee: 10,
      gstOnPatientFeeEnabled: false,
      outworkChargeEnabled: false,
      outworkChargeRate: 40,
      outworkMerchantFeeEnabled: false,
      outworkGstOnMerchantFeeEnabled: false,
      outworkGstOnLabFeeEnabled: false
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingForm) {
      setFormData(editingForm);
    }
  }, [editingForm]);

  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.formName.trim()) {
      newErrors.formName = 'Form name is required';
    }

    if (formData.calculationMethod === 'net') {
      if (formData.netMethod.commissionSplitting <= 0 || formData.netMethod.commissionSplitting > 100) {
        newErrors.commissionSplitting = 'Commission must be between 1-100%';
      }
      if (formData.netMethod.gstOnCommission < 0 || formData.netMethod.gstOnCommission > 100) {
        newErrors.gstOnCommission = 'GST must be between 0-100%';
      }
    } else {
      if (formData.grossMethod.serviceFacilityFeePercent <= 0 || formData.grossMethod.serviceFacilityFeePercent > 100) {
        newErrors.serviceFacilityFeePercent = 'Service fee must be between 1-100%';
      }
      if (formData.grossMethod.gstOnServiceFacilityFee < 0 || formData.grossMethod.gstOnServiceFacilityFee > 100) {
        newErrors.gstOnServiceFacilityFee = 'GST must be between 0-100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="custom-form-builder">
      <div className="form-header">
        <h3>{editingForm ? 'Edit Custom Form' : 'Create Custom Form'}</h3>
        <p>Configure your financial calculation method and parameters</p>
      </div>

      {/* Basic Form Information */}
      <div className="form-section">
        <h4 className="form-section-title">Form Information</h4>
        <div className="form-row">
          <div className="form-group">
            <Input
              label="Form Name *"
              value={formData.formName}
              onChange={(e) => handleInputChange('formName', e.target.value)}
              error={errors.formName}
              placeholder="Enter a descriptive name for this form"
            />
          </div>
        </div>
      </div>

      {/* Calculation Method Selection */}
      <div className="form-section">
        <h4 className="form-section-title">Calculation Method</h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Method *</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="calculationMethod"
                  value="net"
                  checked={formData.calculationMethod === 'net'}
                  onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                />
                <span>Net Method</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="calculationMethod"
                  value="gross"
                  checked={formData.calculationMethod === 'gross'}
                  onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                />
                <span>Gross Method</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Net Method Configuration */}
      {formData.calculationMethod === 'net' && (
        <div className="form-section">
          <h4 className="form-section-title">Net Method Configuration</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Super Holding</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="superHolding"
                    value="without"
                    checked={formData.netMethod.superHolding === 'without'}
                    onChange={(e) => handleInputChange('superHolding', e.target.value, 'netMethod')}
                  />
                  <span>Without Super Holding</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="superHolding"
                    value="with"
                    checked={formData.netMethod.superHolding === 'with'}
                    onChange={(e) => handleInputChange('superHolding', e.target.value, 'netMethod')}
                  />
                  <span>With Super Holding</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <Input
                label="Commission Splitting (%)"
                type="number"
                min="1"
                max="100"
                step="0.00"
                value={formData.netMethod.commissionSplitting}
                onChange={(e) => handleInputChange('commissionSplitting', parseFloat(e.target.value), 'netMethod')}
                error={errors.commissionSplitting}
                placeholder="40"
              />
            </div>
            <div className="form-group">
              <Input
                label="GST on Commission (%)"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.netMethod.gstOnCommission}
                onChange={(e) => handleInputChange('gstOnCommission', parseFloat(e.target.value), 'netMethod')}
                error={errors.gstOnCommission}
                placeholder="10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.netMethod.labFeeEnabled}
                  onChange={(e) => handleInputChange('labFeeEnabled', e.target.checked, 'netMethod')}
                />
                <span>Enable Lab Fee</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Gross Method Configuration */}
      {formData.calculationMethod === 'gross' && (
        <div className="form-section">
          <h4 className="form-section-title">Gross Method Configuration</h4>
          
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Service & Facility Fee (%)"
                type="number"
                min="1"
                max="100"
                step="0.00"
                value={formData.grossMethod.serviceFacilityFeePercent}
                onChange={(e) => handleInputChange('serviceFacilityFeePercent', parseFloat(e.target.value), 'grossMethod')}
                error={errors.serviceFacilityFeePercent}
                placeholder="60"
              />
            </div>
            <div className="form-group">
              <Input
                label="GST on Service & Facility Fee (%)"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.grossMethod.gstOnServiceFacilityFee}
                onChange={(e) => handleInputChange('gstOnServiceFacilityFee', parseFloat(e.target.value), 'grossMethod')}
                error={errors.gstOnServiceFacilityFee}
                placeholder="10"
              />
            </div>
          </div>

          {/* Lab Fee Configuration */}
          <div className="form-subsection">
            <h5>Lab Fee Configuration</h5>
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.labFeeEnabled}
                    onChange={(e) => handleInputChange('labFeeEnabled', e.target.checked, 'grossMethod')}
                  />
                  <span>Enable Lab Fee</span>
                </label>
              </div>
            </div>

            {formData.grossMethod.labFeeEnabled && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Lab Fee Paid By</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="labFeePaidBy"
                        value="clinic"
                        checked={formData.grossMethod.labFeePaidBy === 'clinic'}
                        onChange={(e) => handleInputChange('labFeePaidBy', e.target.value, 'grossMethod')}
                      />
                      <span>Clinic</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="labFeePaidBy"
                        value="dentist"
                        checked={formData.grossMethod.labFeePaidBy === 'dentist'}
                        onChange={(e) => handleInputChange('labFeePaidBy', e.target.value, 'grossMethod')}
                      />
                      <span>Dentist</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.gstOnLabFeeEnabled}
                    onChange={(e) => handleInputChange('gstOnLabFeeEnabled', e.target.checked, 'grossMethod')}
                  />
                  <span>Enable GST on Lab Fee</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="form-subsection">
            <h5>Additional Options</h5>
            
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.merchantBankFeeEnabled}
                    onChange={(e) => handleInputChange('merchantBankFeeEnabled', e.target.checked, 'grossMethod')}
                  />
                  <span>Enable Merchant/Bank Fee</span>
                </label>
              </div>
            </div>

            {formData.grossMethod.merchantBankFeeEnabled && (
              <div className="form-row">
                <div className="form-group">
                  <Input
                    label="GST on Merchant Fee (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.00"
                    value={formData.grossMethod.gstOnMerchantFee}
                    onChange={(e) => handleInputChange('gstOnMerchantFee', parseFloat(e.target.value), 'grossMethod')}
                    placeholder="10"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.gstOnPatientFeeEnabled}
                    onChange={(e) => handleInputChange('gstOnPatientFeeEnabled', e.target.checked, 'grossMethod')}
                  />
                  <span>Enable GST on Patient Fee</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.outworkChargeEnabled}
                    onChange={(e) => handleInputChange('outworkChargeEnabled', e.target.checked, 'grossMethod')}
                  />
                  <span>Enable Outwork Charge Rate</span>
                </label>
              </div>
            </div>

            {formData.grossMethod.outworkChargeEnabled && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Outwork Charge Rate (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="0.00"
                      value={formData.grossMethod.outworkChargeRate}
                      onChange={(e) => handleInputChange('outworkChargeRate', parseFloat(e.target.value), 'grossMethod')}
                      placeholder="40"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.grossMethod.outworkMerchantFeeEnabled}
                        onChange={(e) => handleInputChange('outworkMerchantFeeEnabled', e.target.checked, 'grossMethod')}
                      />
                      <span>Enable Outwork Merchant Fee</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.grossMethod.outworkGstOnMerchantFeeEnabled}
                        onChange={(e) => handleInputChange('outworkGstOnMerchantFeeEnabled', e.target.checked, 'grossMethod')}
                      />
                      <span>Enable GST on Outwork Merchant Fee</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.grossMethod.outworkGstOnLabFeeEnabled}
                        onChange={(e) => handleInputChange('outworkGstOnLabFeeEnabled', e.target.checked, 'grossMethod')}
                      />
                      <span>Enable GST on Outwork Lab Fee</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {editingForm ? 'Update Form' : 'Create Form'}
        </Button>
      </div>
    </form>
  );
};

export default CustomFormBuilder;