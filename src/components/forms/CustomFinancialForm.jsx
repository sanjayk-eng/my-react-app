import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';

const CustomFinancialForm = ({ clinic, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    calculationMethod: 'net', // 'net' or 'gross'
    
    // Net Method Configuration
    netMethod: {
      superHolding: 'without', // 'without' or 'with'
      commissionSplitting: 40, // default 40%
      gstOnCommission: 10, // default 10%
      labFeeEnabled: true, // default true
      superComponent: 12 // default 12% (fixed, not modifiable)
    },
    
    // Gross Method Configuration
    grossMethod: {
      serviceFacilityFeeEnabled: true, // always true and fixed
      serviceFacilityFeePercent: 60, // default 60%
      gstOnServiceFacilityFee: 10, // default 10%
      labFeeEnabled: true, // default true
      labFeePaidBy: 'clinic', // 'clinic' or 'dentist'
      
      // B2: GST on Lab Fee
      gstOnLabFeeEnabled: false,
      
      // B3: Merchant Fee / Bank Fee
      merchantBankFeeEnabled: false,
      gstOnMerchantFee: 10, // default 10%
      
      // B4: GST on Patient Fee
      gstOnPatientFeeEnabled: false,
      
      // B5: Outwork Charge Rate
      outworkChargeEnabled: false,
      outworkChargeRate: 40, // default 40%
      outworkMerchantFeeEnabled: false,
      outworkGstOnMerchantFeeEnabled: false,
      outworkGstOnLabFeeEnabled: false
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with existing clinic custom financial settings
  useEffect(() => {
    if (clinic?.customFinancialSettings) {
      setFormData(prevData => ({
        ...prevData,
        ...clinic.customFinancialSettings
      }));
    }
  }, [clinic]);

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

  const handleMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      calculationMethod: method
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.calculationMethod === 'net') {
      // Net method validation
      if (!formData.netMethod.commissionSplitting || 
          formData.netMethod.commissionSplitting < 0 || 
          formData.netMethod.commissionSplitting > 100) {
        newErrors['netMethod.commissionSplitting'] = 'Commission splitting must be between 0 and 100';
      }

      if (!formData.netMethod.gstOnCommission || 
          formData.netMethod.gstOnCommission < 0 || 
          formData.netMethod.gstOnCommission > 100) {
        newErrors['netMethod.gstOnCommission'] = 'GST on commission must be between 0 and 100';
      }
    } else if (formData.calculationMethod === 'gross') {
      // Gross method validation
      if (!formData.grossMethod.serviceFacilityFeePercent || 
          formData.grossMethod.serviceFacilityFeePercent < 0 || 
          formData.grossMethod.serviceFacilityFeePercent > 100) {
        newErrors['grossMethod.serviceFacilityFeePercent'] = 'Service facility fee must be between 0 and 100';
      }

      if (!formData.grossMethod.gstOnServiceFacilityFee || 
          formData.grossMethod.gstOnServiceFacilityFee < 0 || 
          formData.grossMethod.gstOnServiceFacilityFee > 100) {
        newErrors['grossMethod.gstOnServiceFacilityFee'] = 'GST on service facility fee must be between 0 and 100';
      }

      if (formData.grossMethod.outworkChargeEnabled) {
        if (!formData.grossMethod.outworkChargeRate || 
            formData.grossMethod.outworkChargeRate < 0 || 
            formData.grossMethod.outworkChargeRate > 100) {
          newErrors['grossMethod.outworkChargeRate'] = 'Outwork charge rate must be between 0 and 100';
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
      console.error('Error saving custom financial settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="custom-financial-form">
      {/* Configuration Summary */}
      <div className="form-section config-summary">
        <h3 className="form-section-title">Custom Financial Configuration</h3>
        <div className="config-grid">
          <div className="config-item">
            <span className="config-label">Calculation Method:</span>
            <span className="config-value method-indicator">
              {formData.calculationMethod === 'net' ? 'Net Method' : 'Gross Method'}
            </span>
          </div>
          {formData.calculationMethod === 'net' && (
            <>
              <div className="config-item">
                <span className="config-label">Super Holding:</span>
                <span className="config-value">
                  {formData.netMethod.superHolding === 'with' ? 'With Super Holding' : 'Without Super Holding'}
                </span>
              </div>
              <div className="config-item">
                <span className="config-label">Commission Splitting:</span>
                <span className="config-value">{formData.netMethod.commissionSplitting}%</span>
              </div>
            </>
          )}
          {formData.calculationMethod === 'gross' && (
            <>
              <div className="config-item">
                <span className="config-label">Service & Facility Fee:</span>
                <span className="config-value">{formData.grossMethod.serviceFacilityFeePercent}%</span>
              </div>
              <div className="config-item">
                <span className="config-label">Lab Fee Paid By:</span>
                <span className="config-value">{formData.grossMethod.labFeePaidBy}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Method Selection */}
      <div className="form-section">
        <h3 className="form-section-title">Calculation Method</h3>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="calculationMethod"
              value="net"
              checked={formData.calculationMethod === 'net'}
              onChange={(e) => handleMethodChange(e.target.value)}
            />
            <span className="radio-text">Net Method</span>
            <small className="form-help">Calculate based on net patient fees with commission splitting</small>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="calculationMethod"
              value="gross"
              checked={formData.calculationMethod === 'gross'}
              onChange={(e) => handleMethodChange(e.target.value)}
            />
            <span className="radio-text">Gross Method</span>
            <small className="form-help">Calculate based on gross patient fees with service & facility fees</small>
          </label>
        </div>
      </div>

      {/* Net Method Configuration */}
      {formData.calculationMethod === 'net' && (
        <div className="form-section">
          <h3 className="form-section-title">
            Net Method Configuration
            <span className="method-status active">ACTIVE</span>
          </h3>

          {/* Super Holding Selection */}
          <div className="form-row">
            <div className="form-group">
              <h4>Super Holding Option:</h4>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="superHolding"
                    value="without"
                    checked={formData.netMethod.superHolding === 'without'}
                    onChange={(e) => handleInputChange('netMethod', 'superHolding', e.target.value)}
                  />
                  <span className="radio-text">Without Super Holding</span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="superHolding"
                    value="with"
                    checked={formData.netMethod.superHolding === 'with'}
                    onChange={(e) => handleInputChange('netMethod', 'superHolding', e.target.value)}
                  />
                  <span className="radio-text">With Super Holding</span>
                </label>
              </div>
            </div>
          </div>

          {/* Commission Splitting Configuration */}
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Commission Splitting (Dentist) % *"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.netMethod.commissionSplitting}
                onChange={(e) => handleInputChange('netMethod', 'commissionSplitting', parseFloat(e.target.value) || 40)}
                error={errors['netMethod.commissionSplitting']}
                placeholder="40"
                help="Default: 40%"
              />
            </div>
          </div>

          {/* GST on Commission Configuration */}
          <div className="form-row">
            <div className="form-group">
              <Input
                label="GST on Commission % *"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.netMethod.gstOnCommission}
                onChange={(e) => handleInputChange('netMethod', 'gstOnCommission', parseFloat(e.target.value) || 10)}
                error={errors['netMethod.gstOnCommission']}
                placeholder="10"
                help="Default: 10%"
              />
            </div>
          </div>

          {/* Lab Fee Configuration */}
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.netMethod.labFeeEnabled}
                  onChange={(e) => handleInputChange('netMethod', 'labFeeEnabled', e.target.checked)}
                />
                <span className="checkbox-text">Lab Fee Option</span>
              </label>
              <small className="form-help">Default: True</small>
            </div>
          </div>

          {/* Super Component (only shown with super holding) */}
          {formData.netMethod.superHolding === 'with' && (
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Super Component % (Fixed)"
                  type="number"
                  value={formData.netMethod.superComponent}
                  disabled
                  help="Fixed at 12% - not modifiable"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gross Method Configuration */}
      {formData.calculationMethod === 'gross' && (
        <div className="form-section">
          <h3 className="form-section-title">
            Gross Method Configuration
            <span className="method-status active">ACTIVE</span>
          </h3>

          {/* Service and Facility Fee (Always enabled) */}
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.grossMethod.serviceFacilityFeeEnabled}
                  disabled
                />
                <span className="checkbox-text">Service and Facility Fee Applicable (Fixed: True)</span>
              </label>
              <small className="form-help">Always selected and fixed for gross method</small>
            </div>
          </div>

          {/* Service and Facility Fee Percentage */}
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Service and Facility Fee % *"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.grossMethod.serviceFacilityFeePercent}
                onChange={(e) => handleInputChange('grossMethod', 'serviceFacilityFeePercent', parseFloat(e.target.value) || 60)}
                error={errors['grossMethod.serviceFacilityFeePercent']}
                placeholder="60"
                help="Default: 60%"
              />
            </div>
          </div>

          {/* GST on Service and Facility Fee */}
          <div className="form-row">
            <div className="form-group">
              <Input
                label="GST on Service and Facility Fee % *"
                type="number"
                min="0"
                max="100"
                step="0.00"
                value={formData.grossMethod.gstOnServiceFacilityFee}
                onChange={(e) => handleInputChange('grossMethod', 'gstOnServiceFacilityFee', parseFloat(e.target.value) || 10)}
                error={errors['grossMethod.gstOnServiceFacilityFee']}
                placeholder="10"
                help="Default: 10%"
              />
            </div>
          </div>

          {/* Lab Fee Configuration */}
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.grossMethod.labFeeEnabled}
                  onChange={(e) => handleInputChange('grossMethod', 'labFeeEnabled', e.target.checked)}
                />
                <span className="checkbox-text">Lab Fee</span>
              </label>
              <small className="form-help">Default: True</small>
            </div>
          </div>

          {formData.grossMethod.labFeeEnabled && (
            <div className="form-row conditional-field">
              <div className="form-group">
                <Select
                  label="Lab Fee Paid By *"
                  value={formData.grossMethod.labFeePaidBy}
                  onChange={(e) => handleInputChange('grossMethod', 'labFeePaidBy', e.target.value)}
                  options={[
                    { value: 'clinic', label: 'Clinic' },
                    { value: 'dentist', label: 'Dentist' }
                  ]}
                />
                <small className="form-help">Default: Clinic</small>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="form-section">
            <h4>Additional Gross Method Options</h4>

            {/* B2: GST on Lab Fee */}
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.gstOnLabFeeEnabled}
                    onChange={(e) => handleInputChange('grossMethod', 'gstOnLabFeeEnabled', e.target.checked)}
                  />
                  <span className="checkbox-text">GST on Lab Fee (B2)</span>
                </label>
                <small className="form-help">Additional GST field for lab fees</small>
              </div>
            </div>

            {/* B3: Merchant/Bank Fee */}
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.merchantBankFeeEnabled}
                    onChange={(e) => handleInputChange('grossMethod', 'merchantBankFeeEnabled', e.target.checked)}
                  />
                  <span className="checkbox-text">Merchant Fee / Bank Fee (B3)</span>
                </label>
                <small className="form-help">Default: False</small>
              </div>
            </div>

            {formData.grossMethod.merchantBankFeeEnabled && (
              <div className="form-row conditional-field">
                <div className="form-group">
                  <Input
                    label="GST on Merchant Fee % *"
                    type="number"
                    min="0"
                    max="100"
                    step="0.00"
                    value={formData.grossMethod.gstOnMerchantFee}
                    onChange={(e) => handleInputChange('grossMethod', 'gstOnMerchantFee', parseFloat(e.target.value) || 10)}
                    placeholder="10"
                    help="Default: 10%"
                  />
                </div>
              </div>
            )}

            {/* B4: GST on Patient Fee */}
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.gstOnPatientFeeEnabled}
                    onChange={(e) => handleInputChange('grossMethod', 'gstOnPatientFeeEnabled', e.target.checked)}
                  />
                  <span className="checkbox-text">GST on Patient Fee (B4)</span>
                </label>
                <small className="form-help">Changes lab fee to be paid by dentist</small>
              </div>
            </div>

            {/* B5: Outwork Charge Rate */}
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.grossMethod.outworkChargeEnabled}
                    onChange={(e) => handleInputChange('grossMethod', 'outworkChargeEnabled', e.target.checked)}
                  />
                  <span className="checkbox-text">Outwork Charge Rate (B5)</span>
                </label>
                <small className="form-help">Advanced outwork calculations</small>
              </div>
            </div>

            {formData.grossMethod.outworkChargeEnabled && (
              <>
                <div className="form-row conditional-field">
                  <div className="form-group">
                    <Input
                      label="Outwork Charge Rate % *"
                      type="number"
                      min="0"
                      max="100"
                      step="0.00"
                      value={formData.grossMethod.outworkChargeRate}
                      onChange={(e) => handleInputChange('grossMethod', 'outworkChargeRate', parseFloat(e.target.value) || 40)}
                      error={errors['grossMethod.outworkChargeRate']}
                      placeholder="40"
                      help="Default: 40%"
                    />
                  </div>
                </div>
                
                {/* Outwork Sub-options */}
                <div className="form-row conditional-field">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.grossMethod.outworkMerchantFeeEnabled}
                        onChange={(e) => handleInputChange('grossMethod', 'outworkMerchantFeeEnabled', e.target.checked)}
                      />
                      <span className="checkbox-text">Merchant Fee (in Outwork)</span>
                    </label>
                  </div>
                </div>

                <div className="form-row conditional-field">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.grossMethod.outworkGstOnMerchantFeeEnabled}
                        onChange={(e) => handleInputChange('grossMethod', 'outworkGstOnMerchantFeeEnabled', e.target.checked)}
                      />
                      <span className="checkbox-text">GST on Merchant Fee (in Outwork)</span>
                    </label>
                  </div>
                </div>

                <div className="form-row conditional-field">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.grossMethod.outworkGstOnLabFeeEnabled}
                        onChange={(e) => handleInputChange('grossMethod', 'outworkGstOnLabFeeEnabled', e.target.checked)}
                      />
                      <span className="checkbox-text">GST on Lab Fee (in Outwork)</span>
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
          Save Custom Financial Configuration
        </Button>
      </div>
    </form>
  );
};

export default CustomFinancialForm;