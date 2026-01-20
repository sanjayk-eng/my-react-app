import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

const IncomeEntryForm = ({ clinic, customFinancialConfig, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    grossPatientFee: '',
    labFee: '',
    gstOnLabFee: '',
    merchantFeeIncGst: '',
    bankFee: '',
    gstOnPatientFee: '',
    merchantFee: '',
    gstOnMerchantFee: ''
  });

  const [calculations, setCalculations] = useState({});
  const [basMapping, setBasMapping] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Calculate results based on custom financial configuration
  useEffect(() => {
    if (customFinancialConfig && formData.grossPatientFee) {
      calculateResults();
    }
  }, [formData, customFinancialConfig]);

  const calculateResults = () => {
    const A = parseFloat(formData.grossPatientFee) || 0;
    
    if (!customFinancialConfig || A === 0) {
      setCalculations({});
      setBasMapping({});
      return;
    }

    let newCalculations = {};
    let newBasMapping = {};

    if (customFinancialConfig.calculationMethod === 'net') {
      // NET METHOD CALCULATIONS
      const B = parseFloat(formData.labFee) || 0;
      const commissionPercent = customFinancialConfig.netMethod.commissionSplitting / 100;
      const gstPercent = customFinancialConfig.netMethod.gstOnCommission / 100;
      
      if (customFinancialConfig.netMethod.superHolding === 'without') {
        // A1. Net Method - Without Super Holding
        const C = A - B; // Net Patient Fee
        const D = C * commissionPercent; // Commission for Dentist
        const E = D * gstPercent; // GST on Commission
        const F = D + E; // Total Commission

        newCalculations = {
          netPatientFee: C,
          commissionForDentist: D,
          gstOnCommission: E,
          totalCommission: F
        };

        newBasMapping = {
          '1A_GstOnSales': E,
          'G1_TotalSalesWithGst': F
        };
      } else {
        // A2. Net Method - With Super Holding
        const C = A - B; // Net Patient Fee
        const D = C * commissionPercent; // Commission for Dentist
        const F = D / 1.12; // Commission Component
        const E = F * 0.12; // Super Component (12% fixed)
        const G = E + F; // Total for Reconciliation
        const H = F * gstPercent; // GST on Commission
        const I = F + H; // Total Payment to Dentist

        newCalculations = {
          netPatientFee: C,
          commissionForDentist: D,
          commissionComponent: F,
          superComponent: E,
          totalForReconciliation: G,
          gstOnCommission: H,
          totalPaymentToDentist: I
        };

        newBasMapping = {
          '1A_GstOnSales': H,
          'G1_TotalSalesWithGst': I
        };
      }
    } else if (customFinancialConfig.calculationMethod === 'gross') {
      // GROSS METHOD CALCULATIONS
      const serviceFeePercent = customFinancialConfig.grossMethod.serviceFacilityFeePercent / 100;
      const gstServiceFeePercent = customFinancialConfig.grossMethod.gstOnServiceFacilityFee / 100;
      
      if (customFinancialConfig.grossMethod.gstOnPatientFeeEnabled) {
        // B4. Gross Method - GST on Patient Fee + Lab Fee Paid by Dentist
        const B = parseFloat(formData.gstOnPatientFee) || 0; // GST on Patient Fee
        const I = parseFloat(formData.labFee) || 0; // Lab Fee (Paid by Dentist)
        
        const C = A - B; // Patient Fee Excl GST
        const D = I; // Lab Fee Paid by Dentist
        const E = C - D; // Net Patient Fee
        const F = E * serviceFeePercent; // Service & Facility Fee
        const G = F * gstServiceFeePercent; // GST on Service Fee
        const H = F + G; // Total Service Fee
        const J = E - H + I + B; // Amount Remitted to Dentist

        newCalculations = {
          patientFeeExclGst: C,
          labFeePaidByDentist: D,
          netPatientFee: E,
          serviceFacilityFee: F,
          gstOnServiceFee: G,
          totalServiceFee: H,
          amountRemittedToDentist: J
        };

        newBasMapping = {
          '1A_GstOnSales': B,
          '1B_GstCredit': G,
          'G1_TotalSalesWithGst': A,
          'G11_ClinicExpenses': H + I
        };
      } else if (customFinancialConfig.grossMethod.outworkChargeEnabled) {
        // B5. Gross Method - Outwork Charge Rate
        const w = parseFloat(formData.labFee) || 0; // Lab Fee
        const x = parseFloat(formData.merchantFee) || 0; // Merchant Fee
        const y = parseFloat(formData.gstOnLabFee) || 0; // GST on Lab Fee
        const z = parseFloat(formData.gstOnMerchantFee) || 0; // GST on Merchant Fee
        const outworkPercent = customFinancialConfig.grossMethod.outworkChargeRate / 100;
        
        const B = w + x + y + z; // Total Outwork Charge
        const C = A - B; // Net Patient Fee
        const D = C * serviceFeePercent; // Service & Facility Fee
        const E = B * outworkPercent; // Lab & Other Cost Charge
        const F = D + E; // Total Service Fee + Other Charges
        const G = F * gstServiceFeePercent; // GST on Service Fee
        const H = F + G; // Total Charges incl GST
        const I = A - H; // Amount Remitted to Dentist

        newCalculations = {
          totalOutworkCharge: B,
          netPatientFee: C,
          serviceFacilityFee: D,
          labAndOtherCostCharge: E,
          totalServiceFeeAndOtherCharges: F,
          gstOnServiceFee: G,
          totalChargesInclGst: H,
          amountRemittedToDentist: I
        };

        newBasMapping = {
          '1B_GstCredit': G,
          'G1_TotalSalesWithGst': A,
          'G11_ClinicExpenses': H
        };
      } else if (customFinancialConfig.grossMethod.merchantBankFeeEnabled) {
        // B3. Gross Method - With Merchant Fee / Bank Fee
        const B = parseFloat(formData.labFee) || 0; // Lab Fee
        const G = parseFloat(formData.merchantFeeIncGst) || 0; // Merchant Fee (Incl GST)
        const K = parseFloat(formData.bankFee) || 0; // Bank Fee
        const gstMerchantPercent = customFinancialConfig.grossMethod.gstOnMerchantFee / 100;
        
        const C = A - B; // Net Patient Fee
        const D = C * serviceFeePercent; // Service & Facility Fee
        const E = D * gstServiceFeePercent; // GST on Service Fee
        const F = D + E; // Total Service Fee
        const I = (G * (gstMerchantPercent * 100)) / (100 + (gstMerchantPercent * 100)); // Merchant Fee GST Component
        const J = G - I; // Net Merchant Fee
        const H = C - F - G - K; // Amount Remitted to Dentist

        newCalculations = {
          netPatientFee: C,
          serviceFacilityFee: D,
          gstOnServiceFee: E,
          totalServiceFee: F,
          merchantFeeGstComponent: I,
          netMerchantFee: J,
          amountRemittedToDentist: H
        };

        newBasMapping = {
          '1B_GstCredit': E + I,
          'G1_TotalSalesWithGst': A,
          'G11_ClinicExpenses': F + G + K
        };
      } else if (customFinancialConfig.grossMethod.gstOnLabFeeEnabled) {
        // B2. Gross Method - With GST on Lab Fee
        const B = parseFloat(formData.labFee) || 0; // Lab Fee
        const G = parseFloat(formData.gstOnLabFee) || 0; // GST on Lab Fee
        
        const C = A - B; // Net Patient Fee
        const D = C * serviceFeePercent; // Service & Facility Fee
        const E = D * gstServiceFeePercent; // GST on Service Fee
        const F = D + E; // Total Service Fee
        const I = C - F - G; // Amount Remitted to Dentist

        newCalculations = {
          netPatientFee: C,
          serviceFacilityFee: D,
          gstOnServiceFee: E,
          totalServiceFee: F,
          amountRemittedToDentist: I
        };

        newBasMapping = {
          '1B_GstCredit': E + G,
          'G1_TotalSalesWithGst': A,
          'G11_ClinicExpenses': B + F
        };
      } else {
        // B1. Gross Method - Standard (Lab Fee Paid by Clinic)
        const B = parseFloat(formData.labFee) || 0; // Lab Fee
        
        const C = A - B; // Net Patient Fee
        const D = C * serviceFeePercent; // Service & Facility Fee
        const E = D * gstServiceFeePercent; // GST on Service Fee
        const F = D + E; // Total Service Fee
        const G = C - F; // Amount Remitted to Dentist

        newCalculations = {
          netPatientFee: C,
          serviceFacilityFee: D,
          gstOnServiceFee: E,
          totalServiceFee: F,
          amountRemittedToDentist: G
        };

        newBasMapping = {
          '1B_GstCredit': E,
          'G1_TotalSalesWithGst': A,
          'G11_ClinicExpenses': B + F
        };
      }
    }

    setCalculations(newCalculations);
    setBasMapping(newBasMapping);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear any existing errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.grossPatientFee || parseFloat(formData.grossPatientFee) <= 0) {
      newErrors.grossPatientFee = 'Gross patient fee is required and must be greater than 0';
    }

    if (customFinancialConfig?.netMethod?.labFeeEnabled || customFinancialConfig?.grossMethod?.labFeeEnabled) {
      if (formData.labFee && parseFloat(formData.labFee) < 0) {
        newErrors.labFee = 'Lab fee must be 0 or greater';
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
      const incomeEntry = {
        ...formData,
        calculations,
        basMapping,
        customFinancialConfig,
        clinicId: clinic?.id,
        createdAt: new Date().toISOString()
      };
      
      await onSave(incomeEntry);
    } catch (error) {
      console.error('Error saving income entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value || 0);
  };

  const getRequiredFields = () => {
    if (!customFinancialConfig) return [];
    
    const fields = ['grossPatientFee'];
    
    if (customFinancialConfig.calculationMethod === 'net') {
      // Net Method Fields
      if (customFinancialConfig.netMethod.labFeeEnabled) {
        fields.push('labFee');
      }
    } else if (customFinancialConfig.calculationMethod === 'gross') {
      // Gross Method Fields
      if (customFinancialConfig.grossMethod.gstOnPatientFeeEnabled) {
        // B4: GST on Patient Fee + Lab Fee Paid by Dentist
        fields.push('gstOnPatientFee', 'labFee');
      } else if (customFinancialConfig.grossMethod.outworkChargeEnabled) {
        // B5: Outwork Charge Rate
        fields.push('labFee');
        if (customFinancialConfig.grossMethod.outworkMerchantFeeEnabled) {
          fields.push('merchantFee');
        }
        if (customFinancialConfig.grossMethod.outworkGstOnMerchantFeeEnabled) {
          fields.push('gstOnMerchantFee');
        }
        if (customFinancialConfig.grossMethod.outworkGstOnLabFeeEnabled) {
          fields.push('gstOnLabFee');
        }
      } else if (customFinancialConfig.grossMethod.merchantBankFeeEnabled) {
        // B3: Merchant Fee / Bank Fee
        if (customFinancialConfig.grossMethod.labFeeEnabled) {
          fields.push('labFee');
        }
        fields.push('merchantFeeIncGst', 'bankFee');
      } else if (customFinancialConfig.grossMethod.gstOnLabFeeEnabled) {
        // B2: GST on Lab Fee
        if (customFinancialConfig.grossMethod.labFeeEnabled) {
          fields.push('labFee');
        }
        fields.push('gstOnLabFee');
      } else {
        // B1: Standard Gross Method
        if (customFinancialConfig.grossMethod.labFeeEnabled) {
          fields.push('labFee');
        }
      }
    }
    
    return fields;
  };

  if (!customFinancialConfig) {
    return (
      <div className="income-entry-form">
        <div className="alert alert-warning">
          <h4>Custom Financial Configuration Required</h4>
          <p>Please configure your custom financial settings first before adding income entries.</p>
          <Button variant="primary" onClick={onCancel}>
            Go to Configuration
          </Button>
        </div>
      </div>
    );
  }

  const requiredFields = getRequiredFields();

  return (
    <form onSubmit={handleSubmit} className="income-entry-form">
      {/* Configuration Display */}
      <div className="form-section config-display">
        <h3 className="form-section-title">Current Configuration</h3>
        <div className="config-summary">
          <div className="config-item">
            <span className="config-label">Method:</span>
            <span className="config-value">
              {customFinancialConfig.calculationMethod === 'net' ? 'Net Method' : 'Gross Method'}
            </span>
          </div>
          {customFinancialConfig.calculationMethod === 'net' && (
            <div className="config-item">
              <span className="config-label">Super Holding:</span>
              <span className="config-value">
                {customFinancialConfig.netMethod.superHolding === 'with' ? 'With' : 'Without'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Input Fields */}
      <div className="form-section">
        <h3 className="form-section-title">Income Entry</h3>

        {/* Gross Patient Fee - Always shown */}
        <div className="form-row">
          <div className="form-group">
            <Input
              label="Gross Patient Fee (A) *"
              type="number"
              min="0"
              step="0.00"
              value={formData.grossPatientFee}
              onChange={(e) => handleInputChange('grossPatientFee', e.target.value)}
              error={errors.grossPatientFee}
              placeholder="Enter gross patient fee"
            />
          </div>
        </div>

        {/* Lab Fee - Conditional based on configuration */}
        {requiredFields.includes('labFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Lab Fee (B)"
                type="number"
                min="0"
                step="0.00"
                value={formData.labFee}
                onChange={(e) => handleInputChange('labFee', e.target.value)}
                error={errors.labFee}
                placeholder="Enter lab fee"
                help={customFinancialConfig.grossMethod?.labFeePaidBy === 'dentist' ? 'Lab fee paid by dentist' : 'Lab fee paid by clinic'}
              />
            </div>
          </div>
        )}

        {/* GST on Lab Fee - Conditional */}
        {requiredFields.includes('gstOnLabFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="GST on Lab Fee"
                type="number"
                min="0"
                step="0.00"
                value={formData.gstOnLabFee}
                onChange={(e) => handleInputChange('gstOnLabFee', e.target.value)}
                placeholder="Enter GST on lab fee"
              />
            </div>
          </div>
        )}

        {/* Merchant Fee - Conditional */}
        {requiredFields.includes('merchantFeeIncGst') && (
          <>
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Merchant Fee (Inc GST)"
                  type="number"
                  min="0"
                  step="0.00"
                  value={formData.merchantFeeIncGst}
                  onChange={(e) => handleInputChange('merchantFeeIncGst', e.target.value)}
                  placeholder="Enter merchant fee including GST"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Bank Fee"
                  type="number"
                  min="0"
                  step="0.00"
                  value={formData.bankFee}
                  onChange={(e) => handleInputChange('bankFee', e.target.value)}
                  placeholder="Enter bank fee"
                />
              </div>
            </div>
          </>
        )}

        {/* GST on Patient Fee - Conditional */}
        {requiredFields.includes('gstOnPatientFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="GST on Patient Fee"
                type="number"
                step="0.00"
                value={formData.gstOnPatientFee}
                onChange={(e) => handleInputChange('gstOnPatientFee', e.target.value)}
                placeholder="Enter GST on patient fee (can be negative)"
              />
            </div>
          </div>
        )}

        {/* Outwork Fields - Conditional */}
        {requiredFields.includes('merchantFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Merchant Fee"
                type="number"
                min="0"
                step="0.00"
                value={formData.merchantFee}
                onChange={(e) => handleInputChange('merchantFee', e.target.value)}
                placeholder="Enter merchant fee"
              />
            </div>
          </div>
        )}

        {requiredFields.includes('gstOnMerchantFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="GST on Merchant Fee"
                type="number"
                min="0"
                step="0.00"
                value={formData.gstOnMerchantFee}
                onChange={(e) => handleInputChange('gstOnMerchantFee', e.target.value)}
                placeholder="Enter GST on merchant fee"
              />
            </div>
          </div>
        )}
      </div>

      {/* Calculations Display */}
      {Object.keys(calculations).length > 0 && (
        <div className="form-section calculations-display">
          <h3 className="form-section-title">System Calculations</h3>
          <div className="calculations-grid">
            {Object.entries(calculations).map(([key, value]) => (
              <div key={key} className="calculation-item">
                <span className="calculation-label">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </span>
                <span className="calculation-value">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BAS Mapping Display */}
      {Object.keys(basMapping).length > 0 && (
        <div className="form-section bas-mapping-display">
          <h3 className="form-section-title">BAS Configuration Mapping</h3>
          <div className="bas-mapping-grid">
            {Object.entries(basMapping).map(([key, value]) => (
              <div key={key} className="bas-mapping-item">
                <span className="bas-mapping-label">{key.replace(/_/g, ' ')}:</span>
                <span className="bas-mapping-value">{formatCurrency(value)}</span>
              </div>
            ))}
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
          Save Income Entry
        </Button>
      </div>
    </form>
  );
};

export default IncomeEntryForm;