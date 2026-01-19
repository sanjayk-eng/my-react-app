import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getClinics, getIncomeEntries, setIncomeEntries } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import { formatCurrency } from '../../utils/calculations.js';
import { generateIncomeReport, generateSummaryReport, openReportWindow, downloadReportAsHTML } from '../../utils/reportGenerator.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import ReportHelp from '../../components/common/ReportHelp.jsx';
import '../../styles/pages/income-management.css';

// Calculation Methods based on Australian Dental Clinic Business Logic
const METHODS = {
  // Net Methods (Independent Contractor Method)
  NET_WITHOUT_SUPER: 'net-without-super',
  NET_WITH_SUPER: 'net-with-super',
  
  // Gross Methods (Service & Facility Agreement)
  GROSS_BASIC: 'gross-basic',
  GROSS_LAB_GST: 'gross-lab-gst',
  GROSS_MERCHANT_BANK: 'gross-merchant-bank',
  GROSS_PATIENT_GST: 'gross-patient-gst',
  GROSS_OUTWORK: 'gross-outwork'
};

const METHOD_LABELS = {
  [METHODS.NET_WITHOUT_SUPER]: 'Net Method - Without Super Holding (Independent Contractor)',
  [METHODS.NET_WITH_SUPER]: 'Net Method - With Super Holding (Independent Contractor)',
  [METHODS.GROSS_BASIC]: 'Gross Method - Service & Facility Fee with GST',
  [METHODS.GROSS_LAB_GST]: 'Gross Method - S&F Fee with GST on Lab Fee Charged by Clinic',
  [METHODS.GROSS_MERCHANT_BANK]: 'Gross Method - S&F Fee with Merchant/Bank Fee Charged to Dentist',
  [METHODS.GROSS_PATIENT_GST]: 'Gross Method - S&F Fee with GST on Lab Fee Paid by Dentist + GST on Patient Fee',
  [METHODS.GROSS_OUTWORK]: 'Gross Method - Service & Facility with Outwork Charge Rate'
};

const IncomeManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Calculator State
  const [selectedMethod, setSelectedMethod] = useState('');
  const [inputs, setInputs] = useState({
    grossPatientFee: '',
    labFee: '',
    gstOnLabFee: '',
    merchantFeeWithGst: '',
    bankFee: '',
    gstOnPatientFee: '',
    merchantFeeCost: ''
  });
  const [calculations, setCalculations] = useState(null);
  
  // Financial Settings from Clinic Configuration
  const [gstPercent, setGstPercent] = useState(10);
  const [commissionPercent, setCommissionPercent] = useState(40); // Default 40% as per examples
  const [serviceFacilityPercent, setServiceFacilityPercent] = useState(60); // Default 60% as per examples
  const [gstOnCommission, setGstOnCommission] = useState(true); // Determines Net vs Gross method
  const [gstOnServiceFacilityFeePercent, setGstOnServiceFacilityFeePercent] = useState(10); // GST % on Service and Facility Fee (for Basic method)
  
  // Income Entries State
  const [incomeEntries, setIncomeEntriesState] = useState([]);

  // NET METHOD 1: Without Super Holding (Independent Contractor)
  const calculateNetWithoutSuper = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fees
    const B = parseFloat(inputs.labFee) || 0; // Lab Fees
    const commissionRate = commissionPercent / 100;
    const gstRate = gstPercent / 100;
    
    // Lab fee handling: Only subtract if paid by Clinic, not if paid by Dentist
    const labFeePayBy = clinic?.financialSettings?.labFee?.payBy || 'Clinic';
    const C = labFeePayBy === 'Clinic' ? A - B : A; // Net Patient Fee(C) = A - B (if Clinic pays) or A (if Dentist pays)
    const D = C * commissionRate; // Dentist commission (D) = C * (Commission Splitting ratio)%
    const E = D * gstRate; // GST on Commission (E) = D * (GST on Commission)%
    const F = D + E; // Net Commission(F) = D + E
    
    return {
      A, B, C, D, E, F,
      grossPatientFee: A,
      labFee: B,
      netPatientFee: C,
      dentistCommission: D,
      gstOnCommission: E,
      netCommission: F,
      dentistPayable: F, // Total Commission Payable = D + E
      basRefund: 0,
      total: F,
      // BAS Codes
      basG1: A, // Total income
      basG3: C, // GST-free sales
      bas1A: E  // GST on sales
    };
  };

  // NET METHOD 2: With Super Holding (Independent Contractor)
  const calculateNetWithSuper = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fees
    const B = parseFloat(inputs.labFee) || 0; // Lab Fees
    const commissionRate = commissionPercent / 100;
    const gstRate = gstPercent / 100;
    
    // Lab fee handling: Only subtract if paid by Clinic, not if paid by Dentist
    const labFeePayBy = clinic?.financialSettings?.labFee?.payBy || 'Clinic';
    const C = labFeePayBy === 'Clinic' ? A - B : A; // Net Patient Fee(C) = A - B (if Clinic pays) or A (if Dentist pays)
    const D = C * commissionRate; // Dentist Commission (D) = C * (Commission Splitting ratio)%
    const F = D / 1.12; // Commission Component (F) = D/1.12
    const E = F * 0.12; // Super Component (E) = F * (12% of Commission Component)
    const G = F * gstRate; // GST on Commission (G) = F * (GST on Commission)%
    const H = F + G; // Net Commission(H) = F + G
    
    return {
      A, B, C, D, E, F, G, H,
      grossPatientFee: A,
      labFee: B,
      netPatientFee: C,
      dentistCommission: D,
      superComponent: E,
      commissionComponent: F,
      gstOnCommission: G,
      netCommission: H,
      dentistPayable: H, // Total Payment Received by Dentist
      basRefund: 0,
      total: H,
      // BAS Codes
      basG1: A,
      basG3: C,
      bas1A: G
    };
  };

  // GROSS METHOD 1: Basic Service & Facility Fee with GST
  const calculateGrossBasic = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fee
    const B = parseFloat(inputs.labFee) || 0; // Lab Fee
    const serviceFacilityRate = commissionPercent / 100;
    // Use GST on Service and Facility Fee percentage from financial settings (if enabled), otherwise use default GST
    const gstOnServiceFacilityEnabled = clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFee !== false;
    // Read directly from financial settings - prioritize saved value, fallback to state, then default
    const gstOnServiceFacilityPercentValue = 
      clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? 
      gstOnServiceFacilityFeePercent ?? 
      gstPercent;
    const gstRate = (gstOnServiceFacilityEnabled ? gstOnServiceFacilityPercentValue : 0) / 100;
    
    const C = A - B; // Net Patient Fee(C) = A - B
    const D = C * serviceFacilityRate; // Service and Facility Fee (D) = C * (Service & Facility)%
    const E = D * gstRate; // GST Service and Facility Fee (E) = D * (GST on Service & Facility)%
    const F = D + E; // Total Service and Facility Fee(F) = D + E
    const G = C - F; // Amount Remitted to the Dentists(G) = C - F
    const basRefund = E; // BAS Refund = E
    const total = G + E; // Total = G + E
    
    return {
      A, B, C, D, E, F, G,
      grossPatientFee: A,
      labFee: B,
      netPatientFee: C,
      serviceFacilityFee: D,
      gstServiceFacilityFee: E,
      gstOnServiceFacilityPercent: gstOnServiceFacilityPercentValue, // Store the GST % used for display
      totalServiceFacilityFee: F,
      amountRemittedToDentists: G,
      basRefund,
      total,
      dentistPayable: G,
      // BAS Codes
      basG1: A,
      basG3: C,
      bas1A: 0, // Patient fees are GST-free
      bas1B: E  // GST credits
    };
  };

  // GROSS METHOD 2: S&F Fee with GST on Lab Fee Charged by Clinic to Dentists
  const calculateGrossLabGst = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fee
    const B = parseFloat(inputs.labFee) || 0; // Lab Fee
    // Auto-calculate GST on Lab Fee from financial settings
    const C = clinic?.financialSettings?.grossMethod?.selectedMethod === 'labGst' ? 
      (B * (clinic.financialSettings.grossMethod.gstLabFeePercent ) / 100) : 0;
    const serviceFacilityRate = commissionPercent / 100;
    const gstRate = (clinic.financialSettings.grossMethod.gstLabFeePercent ) /100;
    
    const D = A - B; // Net Patient Fee(D) = A - B
    const E = D * serviceFacilityRate; // Service and Facility Fee (E) = D * (Service & Facility)%
    const F = E * gstRate; // GST Service and Facility Fee (F) = E * (GST)%
    const G = E + F; // Total Service and Facility Fee(G) = E + F
    const H = C; // GST on Lab Fee (H) = C
    const I = D - G - H; // Amount Remitted to the Dentists(I) = D - G - H
    const J = F; // BAS Refund = J
    const total = I + J; // Total = I + J
    
    return {
      A, B, C, D, E, F, G, H, I, J,
      grossPatientFee: A,
      labFee: B,
      gstOnLabFee: C,
      netPatientFee: D,
      serviceFacilityFee: E,
      gstServiceFacilityFee: F,
      totalServiceFacilityFee: G,
      gstOnLabFeeCharged: H,
      amountRemittedToDentists: I,
      basRefund: J,
      total,
      dentistPayable: I,
      // BAS Codes
      basG1: A,
      basG3: D,
      bas1A: H,
      bas1B: F
    };
  };

  // GROSS METHOD 3: S&F Fee with GST + Merchant/Bank Fee Fully Charged By Dentists
  const calculateGrossMerchantBank = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fee
    const B = parseFloat(inputs.labFee) || 0; // Lab Fee
    const C = parseFloat(inputs.merchantFeeWithGst) || 0; // Merchant Fee With GST
    const D = parseFloat(inputs.bankFee) || 0; // Bank Fee
    const serviceFacilityRate = commissionPercent / 100;
    const gstRate = (clinic.financialSettings.grossMethod.gstLabFeePercent ) / 100;
    
    const E = A - B; // Net Patient Fee(E) = A - B
    const F = E * serviceFacilityRate; // Service and Facility Fee (F) = E * (Service & Facility)%
    const G = F * gstRate; // GST Service and Facility Fee (G) = F * (GST)%
    const H = F + G; // Total Service and Facility Fee(H) = F + G
    const I = C; // Merchant Fee inc GST(I) = C
    const J = I * gstRate; // GST on Merchant Fee (J) = I * (GST)%
    const K = I - J; // Net Merchant Fee (K) = I - J
    const L = D; // Bank Fee(L) = D
    const M = E - H - I - L; // Amount Remitted to the Dentists(M) = E - H - I - L
    const N = G; // BAS Refund(N) = G
    const total = M + N; // Total = M + N
    
    return {
      A, B, C, D, E, F, G, H, I, J, K, L, M, N,
      grossPatientFee: A,
      labFee: B,
      merchantFeeWithGst: C,
      bankFee: D,
      netPatientFee: E,
      serviceFacilityFee: F,
      gstServiceFacilityFee: G,
      totalServiceFacilityFee: H,
      merchantFeeIncGst: I,
      gstOnMerchantFee: J,
      netMerchantFee: K,
      bankFeeCharged: L,
      amountRemittedToDentists: M,
      basRefund: N,
      total,
      dentistPayable: M,
      // BAS Codes
      basG1: A,
      basG3: E,
      bas1A: 0,
      bas1B: G
    };
  };

  // GROSS METHOD 4: S&F Fee with GST on Lab Fee pay by dentist + GST on patient fee
  const calculateGrossPatientGst = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fee
    const B = parseFloat(inputs.labFee) || 0; // Lab Fee
    const C = -parseFloat(inputs.gstOnPatientFee) || 0; // GST on patient fee
    const serviceFacilityRate = commissionPercent / 100;
    const gstRate = (clinic.financialSettings.grossMethod.gstLabFeePercent || gstPercent) / 100;
    
    const D = A - C; // Patient Fee(Excl GST) (D) = A - C
    const E = D - B; // Net Patient Fee(E) = D - B
    const F = E * serviceFacilityRate; // Service and Facility Fee (F) = E * (Service & Facility)%
    const G = F * gstRate; // GST Service and Facility Fee (G) = F * (GST)%
    const H = F + G; // Total Service and Facility Fee(H) = F + G
    const I = B; // Lab Fee Pay By Dentists(I) = B
    const amountRemitted = E - H + I - B; // Amount Remitted to the Dentists = E - H + I - B
    const J = G; // BAS Refund (J) = G
    const total = amountRemitted + G; // Total = amountRemitted + G
    
    return {
      A, B, C, D, E, F, G, H, I, J,
      grossPatientFee: A,
      labFee: B,
      gstOnPatientFee: C,
      patientFeeExclGst: D,
      netPatientFee: E,
      serviceFacilityFee: F,
      gstServiceFacilityFee: G,
      totalServiceFacilityFee: H,
      labFeePayByDentists: I,
      amountRemittedToDentists: amountRemitted,
      basRefund: J,
      total,
      dentistPayable: amountRemitted,
      // BAS Codes
      basG1: A,
      basG3: D,
      bas1A: C,
      bas1B: G
    };
  };

  // GROSS METHOD 5: Service and Facility Method - Outwork Charge Rate
  const calculateGrossOutwork = () => {
    const A = parseFloat(inputs.grossPatientFee) || 0; // Gross Patient Fee
    const B = parseFloat(inputs.labFee) || 0; // Lab Fee
    const C = parseFloat(inputs.merchantFeeCost) || 0; // Merchant Fee Cost
    // Auto-calculate GST on Lab Fee from financial settings
    const D = clinic?.financialSettings?.grossMethod?.selectedMethod === 'outwork' ? 
      (B * (clinic.financialSettings.grossMethod.gstLabFeePercent || gstPercent) / 100) : 0;
    const serviceFacilityRate = commissionPercent / 100;
    const gstRate = gstPercent / 100;
    
    const E = B + C + D; // Total Outwork Cost (E) = B + C + D
    const F = A - E; // Net Patient Fee(F) = A - E
    const G = F * serviceFacilityRate; // Service and Facility Fee (G) = F * (Service & Facility)%
    const H = F * gstRate; // Lab Fee and Other Cost Charge (H) = F * (GST)%
    const I = G + H; // Total Service Fee + Other Cost(I) = G + H
    const J = I * gstRate; // GST Service and Facility Fee (J) = I * (GST)%
    const H_total = J + I; // Total Service and Facility Fee + inc GST = J + I
    const netPayable = A - H_total; // Net Payable to Dentists = A - H_total
    
    return {
      A, B, C, D, E, F, G, H, I, J,
      grossPatientFee: A,
      labFee: B,
      merchantFeeCost: C,
      gstOnLabFee: D,
      totalOutworkCost: E,
      netPatientFee: F,
      serviceFacilityFee: G,
      labFeeOtherCostCharge: H,
      totalServiceFeeOtherCost: I,
      gstServiceFacilityFee: J,
      totalServiceFacilityFeeIncGst: H_total,
      netPayableToDentists: netPayable,
      dentistPayable: netPayable,
      basRefund: 0,
      total: netPayable,
      // BAS Codes
      basG1: A,
      basG3: F,
      bas1A: D,
      bas1B: J
    };
  };

  const performCalculation = () => {
    // Don't calculate if financial settings are not configured
    if (!clinic?.financialSettings || !selectedMethod) {
      setCalculations(null);
      return;
    }
    
    let result = null;
    
    try {
      switch (selectedMethod) {
        case METHODS.NET_WITHOUT_SUPER:
          result = calculateNetWithoutSuper();
          break;
        case METHODS.NET_WITH_SUPER:
          result = calculateNetWithSuper();
          break;
        case METHODS.GROSS_BASIC:
          result = calculateGrossBasic();
          break;
        case METHODS.GROSS_LAB_GST:
          result = calculateGrossLabGst();
          break;
        case METHODS.GROSS_MERCHANT_BANK:
          result = calculateGrossMerchantBank();
          break;
        case METHODS.GROSS_PATIENT_GST:
          result = calculateGrossPatientGst();
          break;
        case METHODS.GROSS_OUTWORK:
          result = calculateGrossOutwork();
          break;
        default:
          result = null;
      }
    } catch (error) {
      console.error('Calculation error:', error);
      result = null;
    }
    
    setCalculations(result);
  };

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    
    // Load income entries
    const entries = getIncomeEntries().filter(entry => entry.clinicId === id);
    setIncomeEntriesState(entries);
    
    // Reset calculations if no settings
    if (!foundClinic?.financialSettings) {
      setSelectedMethod('');
      setCalculations(null);
      setIsLoading(false);
      return;
    }
    
    // Set financial settings from clinic configuration (no manual override)
    const { commissionSplitting, grossMethod, netMethod } = foundClinic.financialSettings;
    
    // Set GST and commission from clinic settings
    if (commissionSplitting) {
      if (commissionSplitting.commissionPercent) setCommissionPercent(commissionSplitting.commissionPercent);
      if (commissionSplitting.gstPercent) setGstPercent(commissionSplitting.gstPercent);
      setGstOnCommission(commissionSplitting.gstOnCommission || false);
    }
    
    // Set service facility percentage (default 60% if not specified)
    setServiceFacilityPercent(commissionPercent); // Standard Australian dental clinic rate
    
    // Set GST on Service and Facility Fee percentage from financial settings (for Basic method)
    if (grossMethod?.gstOnServiceFacilityFeePercent) {
      setGstOnServiceFacilityFeePercent(grossMethod.gstOnServiceFacilityFeePercent);
    } else {
      setGstOnServiceFacilityFeePercent(gstPercent); // Default to general GST percent
    }
    
    // Auto-select the appropriate method based on clinic settings
    if (commissionSplitting?.gstOnCommission) {
      // Net method - default to WITHOUT super holding unless explicitly enabled
      if (netMethod?.withSuperHolding === true) {
        setSelectedMethod(METHODS.NET_WITH_SUPER);
      } else {
        // Default: Without Super Holding
        setSelectedMethod(METHODS.NET_WITHOUT_SUPER);
      }
    } else {
      // Gross method - determine which variant based on settings
      const selectedMethodValue = foundClinic.financialSettings.grossMethod?.selectedMethod;
      switch (selectedMethodValue) {
        case 'patientGst':
          setSelectedMethod(METHODS.GROSS_PATIENT_GST);
          break;
        case 'merchantBank':
          setSelectedMethod(METHODS.GROSS_MERCHANT_BANK);
          break;
        case 'labGst':
          setSelectedMethod(METHODS.GROSS_LAB_GST);
          break;
        case 'outwork':
          setSelectedMethod(METHODS.GROSS_OUTWORK);
          break;
        default:
          setSelectedMethod(METHODS.GROSS_BASIC);
      }
    }
    
    setIsLoading(false);
  }, [id, location.pathname]); // Reload when id or pathname changes (e.g., after saving settings)

  // Real-time calculation when inputs change
  useEffect(() => {
    // Only perform calculation if financial settings are configured and method is selected
    if (!clinic?.financialSettings || !selectedMethod) {
      setCalculations(null);
      return;
    }
    performCalculation();
  }, [selectedMethod, inputs, gstPercent, commissionPercent, serviceFacilityPercent, clinic?.financialSettings]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEntry = () => {
    if (!calculations || !inputs.grossPatientFee) return;
    
    const allEntries = getIncomeEntries();
    const newEntry = {
      id: generateUniqueId(),
      clinicId: id,
      entryDate: new Date().toISOString().split('T')[0],
      method: selectedMethod,
      inputs: { ...inputs },
      calculations: { ...calculations },
      gstPercent,
      commissionPercent,
      serviceFacilityPercent,
      gstOnCommission,
      dentistPayable: calculations.dentistPayable || 0,
      basRefund: calculations.basRefund || 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [...allEntries, newEntry];
    setIncomeEntries(updatedEntries);
    setIncomeEntriesState(updatedEntries.filter(entry => entry.clinicId === id));
    
    // Clear form
    setInputs({
      grossPatientFee: '',
      labFee: '',
      gstOnLabFee: '',
      merchantFeeWithGst: '',
      bankFee: '',
      gstOnPatientFee: '',
      merchantFeeCost: ''
    });
    setCalculations(null);
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      const allEntries = getIncomeEntries();
      const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
      setIncomeEntries(updatedEntries);
      setIncomeEntriesState(updatedEntries.filter(entry => entry.clinicId === id));
    }
  };

  const handleGenerateReport = (entry) => {
    const reportHTML = generateIncomeReport(entry, clinic);
    const reportTitle = `Income Report - ${clinic.practiceName} - ${new Date(entry.entryDate).toLocaleDateString('en-AU')}`;
    openReportWindow(reportHTML, reportTitle);
  };

  const handleDownloadReport = (entry) => {
    const reportHTML = generateIncomeReport(entry, clinic);
    const filename = `income-report-${clinic.practiceName.replace(/\s+/g, '-')}-${entry.entryDate}.html`;
    downloadReportAsHTML(reportHTML, filename);
  };

  const handleGenerateSummaryReport = () => {
    const reportHTML = generateSummaryReport(incomeEntries, clinic);
    const reportTitle = `Income Summary Report - ${clinic.practiceName}`;
    openReportWindow(reportHTML, reportTitle);
  };

  const handleDownloadSummaryReport = () => {
    const reportHTML = generateSummaryReport(incomeEntries, clinic);
    const filename = `income-summary-${clinic.practiceName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    downloadReportAsHTML(reportHTML, filename);
  };

  const renderMethodSelector = () => {
    if (!clinic?.financialSettings) {
      return (
        <div className="method-selector">
          <div className="alert alert-warning">
            <h3>Financial Settings Required</h3>
            <p>Please configure financial settings for this clinic before using the income calculator.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/clinics/${id}/settings`)}
            >
              Configure Financial Settings
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="method-selector">
        <div className="financial-settings-display">
          <h3>Current Financial Configuration</h3>
          <div className="settings-summary">
            <div className="setting-item">
              <span className="setting-label">Commission Percentage:</span>
              <span className="setting-value">{commissionPercent}%</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">GST Percentage:</span>
              <span className="setting-value">{gstPercent}%</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Method Type:</span>
              <span className="setting-value">{gstOnCommission ? 'Net Method (Independent Contractor)' : 'Gross Method (Service & Facility)'}</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Active Calculation:</span>
              <span className="setting-value method-active">{METHOD_LABELS[selectedMethod]}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/clinics/${id}/settings`)}
          >
            Edit Financial Settings
          </Button>
        </div>
        
        <div className="method-description">
          <h4>How This Works</h4>
          <p><strong>{gstOnCommission ? 'Net Method (Independent Contractor)' : 'Gross Method (Service & Facility Agreement)'}</strong></p>
          <p>{gstOnCommission ? 'Dentist works as independent contractor. Clinic pays commission + GST. Dentist manages own super.' : 'Clinic collects all patient fees. Charges service & facility fee + GST. Remits balance to dentist.'}</p>
          <p className="text-muted">The calculation method is automatically determined by your clinic's financial settings. No need to select it manually.</p>
        </div>
      </div>
    );
  };

  const renderInputFields = () => {
    const getRequiredFields = () => {
      switch (selectedMethod) {
        case METHODS.NET_WITHOUT_SUPER:
        case METHODS.NET_WITH_SUPER:
        case METHODS.GROSS_BASIC:
        case METHODS.GROSS_LAB_GST: // GST on Lab Fee is auto-calculated from settings
          return ['grossPatientFee', 'labFee'];
        case METHODS.GROSS_MERCHANT_BANK:
          return ['grossPatientFee', 'labFee', 'merchantFeeWithGst', 'bankFee'];
        case METHODS.GROSS_PATIENT_GST:
          return ['grossPatientFee', 'labFee', 'gstOnPatientFee'];
        case METHODS.GROSS_OUTWORK: // GST on Lab Fee is auto-calculated from settings
          return ['grossPatientFee', 'labFee', 'merchantFeeCost'];
        default:
          return ['grossPatientFee'];
      }
    };

    const requiredFields = getRequiredFields();

    return (
      <div className="input-fields">
        <h4>Patient Fee Information</h4>
        
        <div className="form-row">
          <div className="form-group">
            <Input
              label="Gross Patient Fee *"
              type="number"
              min="0"
              step="0.00"
              value={inputs.grossPatientFee}
              onChange={(e) => handleInputChange('grossPatientFee', e.target.value)}
              placeholder="0.00"
              help="Total fees paid by patients (GST-free for dental treatments)"
            />
          </div>
        </div>

        {requiredFields.includes('labFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Lab Fee"
                type="number"
                min="0"
                step="0.00"
                value={inputs.labFee}
                onChange={(e) => handleInputChange('labFee', e.target.value)}
                placeholder="0.00"
                help="Laboratory costs (crowns, implants, dentures, etc.)"
              />
            </div>
          </div>
        )}

        {/* Show GST on Lab Fee info if it's auto-calculated */}
        {(selectedMethod === METHODS.GROSS_LAB_GST || selectedMethod === METHODS.GROSS_OUTWORK) && 
         clinic?.financialSettings?.grossMethod?.selectedMethod === 'labGst' && (
          <div className="form-row">
            <div className="auto-calculated-info">
              <p className="text-muted">
                <strong>GST on Lab Fee:</strong> Auto-calculated at {clinic.financialSettings.grossMethod.gstLabFeePercent || gstPercent}% 
                (configured in financial settings)
              </p>
            </div>
          </div>
        )}

        {requiredFields.includes('merchantFeeWithGst') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Merchant Fee With GST"
                type="number"
                min="0"
                step="0.00"
                value={inputs.merchantFeeWithGst}
                onChange={(e) => handleInputChange('merchantFeeWithGst', e.target.value)}
                placeholder="0.00"
                help="Credit card/EFTPOS processing fees (including GST)"
              />
            </div>
          </div>
        )}

        {requiredFields.includes('bankFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Bank Fee"
                type="number"
                min="0"
                step="0.00"
                value={inputs.bankFee}
                onChange={(e) => handleInputChange('bankFee', e.target.value)}
                placeholder="0.00"
                help="Bank transaction fees (GST-free)"
              />
            </div>
          </div>
        )}

        {requiredFields.includes('gstOnPatientFee') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="GST on Patient Fee"
                type="number"
                min="0"
                step="0.00"
                value={inputs.gstOnPatientFee}
                onChange={(e) => handleInputChange('gstOnPatientFee', e.target.value)}
                placeholder="0.00"
                help="GST component on patient fees (for cosmetic treatments)"
              />
            </div>
          </div>
        )}

        {requiredFields.includes('merchantFeeCost') && (
          <div className="form-row">
            <div className="form-group">
              <Input
                label="Merchant Fee Cost"
                type="number"
                min="0"
                step="0.00"
                value={inputs.merchantFeeCost}
                onChange={(e) => handleInputChange('merchantFeeCost', e.target.value)}
                placeholder="0.00"
                help="Merchant processing costs for outwork"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCalculationResults = () => {
    if (!calculations) return null;

    const renderFormulaSteps = () => {
      const isNetMethod = selectedMethod === METHODS.NET_WITHOUT_SUPER || selectedMethod === METHODS.NET_WITH_SUPER;
      
      switch (selectedMethod) {
        case METHODS.NET_WITHOUT_SUPER:
          return (
            <div className="formula-steps">
              <h5>Net Method - Without Super Holding (Independent Contractor)</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = A - B = {formatCurrency(calculations.A)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.C)} (Net Patient Fee)</div>
              <div className="step">D = C × {commissionPercent}% = {formatCurrency(calculations.C)} × {commissionPercent}% = {formatCurrency(calculations.D)} (Dentist Commission)</div>
              <div className="step">E = D × {gstPercent}% = {formatCurrency(calculations.D)} × {gstPercent}% = {formatCurrency(calculations.E)} (GST on Commission)</div>
              <div className="step">F = D + E = {formatCurrency(calculations.D)} + {formatCurrency(calculations.E)} = {formatCurrency(calculations.F)} (Total Commission Payable)</div>
            </div>
          );
        
        case METHODS.NET_WITH_SUPER:
          return (
            <div className="formula-steps">
              <h5>Net Method - With Super Holding (Independent Contractor)</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = A - B = {formatCurrency(calculations.A)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.C)} (Net Patient Fee)</div>
              <div className="step">D = C × {commissionPercent}% = {formatCurrency(calculations.C)} × {commissionPercent}% = {formatCurrency(calculations.D)} (Dentist Commission)</div>
              <div className="step">F = D ÷ 1.12 = {formatCurrency(calculations.D)} ÷ 1.12 = {formatCurrency(calculations.F)} (Commission Component)</div>
              <div className="step">E = F × 12% = {formatCurrency(calculations.F)} × 12% = {formatCurrency(calculations.E)} (Super Component - Paid by Clinic)</div>
              <div className="step">G = F × {gstPercent}% = {formatCurrency(calculations.F)} × {gstPercent}% = {formatCurrency(calculations.G)} (GST on Commission)</div>
              <div className="step">H = F + G = {formatCurrency(calculations.F)} + {formatCurrency(calculations.G)} = {formatCurrency(calculations.H)} (Total Received by Dentist)</div>
            </div>
          );
        
        case METHODS.GROSS_BASIC:
          return (
            <div className="formula-steps">
              <h5>Gross Method - Service & Facility Fee with GST</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = A - B = {formatCurrency(calculations.A)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.C)} (Net Patient Fee)</div>
              <div className="step">D = C × {commissionPercent}% = {formatCurrency(calculations.C)} × {commissionPercent}% = {formatCurrency(calculations.D)} (Service & Facility Fee)</div>
              <div className="step">E = D × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.D)} × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.E)} (GST Service & Facility Fee)</div>
              <div className="step">F = D + E = {formatCurrency(calculations.D)} + {formatCurrency(calculations.E)} = {formatCurrency(calculations.F)} (Total Service & Facility Fee)</div>
              <div className="step">G = C - F = {formatCurrency(calculations.C)} - {formatCurrency(calculations.F)} = {formatCurrency(calculations.G)} (Amount Remitted to Dentist)</div>
              <div className="step">BAS Refund = E = {formatCurrency(calculations.E)}</div>
              <div className="step">Total = G + E = {formatCurrency(calculations.G)} + {formatCurrency(calculations.E)} = {formatCurrency(calculations.total)}</div>
            </div>
          );
        
        case METHODS.GROSS_LAB_GST:
          return (
            <div className="formula-steps">
              <h5>Gross Method - Service & Facility Fee with GST on Lab Fee</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = {formatCurrency(calculations.C)} (GST on Lab Fee - Auto-calculated)</div>
              <div className="step">D = A - B = {formatCurrency(calculations.A)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.D)} (Net Patient Fee)</div>
              <div className="step">E = D × {commissionPercent}% = {formatCurrency(calculations.D)} × {commissionPercent}% = {formatCurrency(calculations.E)} (Service & Facility Fee)</div>
              <div className="step">F = E × {clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.E)} × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.F)} (GST Service & Facility Fee)</div>
              <div className="step">G = E + F = {formatCurrency(calculations.E)} + {formatCurrency(calculations.F)} = {formatCurrency(calculations.G)} (Total Service & Facility Fee)</div>
              <div className="step">H = C = {formatCurrency(calculations.H)} (GST on Lab Fee)</div>
              <div className="step">I = D - G - H = {formatCurrency(calculations.D)} - {formatCurrency(calculations.G)} - {formatCurrency(calculations.H)} = {formatCurrency(calculations.I)} (Amount Remitted to Dentist)</div>
              <div className="step">BAS Refund = J = {formatCurrency(calculations.J)}</div>
              <div className="step">Total = I + J = {formatCurrency(calculations.I)} + {formatCurrency(calculations.J)} = {formatCurrency(calculations.total)}</div>
            </div>
          );
        
        case METHODS.GROSS_MERCHANT_BANK:
          return (
            <div className="formula-steps">
              <h5>Gross Method - Service & Facility Fee with Merchant/Bank Fees</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = {formatCurrency(calculations.C)} (Merchant Fee With GST)</div>
              <div className="step">D = {formatCurrency(calculations.D)} (Bank Fee)</div>
              <div className="step">E = A - B = {formatCurrency(calculations.A)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.E)} (Net Patient Fee)</div>
              <div className="step">F = E × {commissionPercent}% = {formatCurrency(calculations.E)} × {commissionPercent}% = {formatCurrency(calculations.F)} (Service & Facility Fee)</div>
              <div className="step">G = F × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.F)} × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.G)} (GST Service & Facility Fee)</div>
              <div className="step">H = F + G = {formatCurrency(calculations.F)} + {formatCurrency(calculations.G)} = {formatCurrency(calculations.H)} (Total Service & Facility Fee)</div>
              <div className="step">I = C = {formatCurrency(calculations.I)} (Merchant Fee inc GST)</div>
              <div className="step">J = I × {gstPercent}% = {formatCurrency(calculations.I)} × {gstPercent}% = {formatCurrency(calculations.J)} (GST on Merchant Fee)</div>
              <div className="step">K = I - J = {formatCurrency(calculations.I)} - {formatCurrency(calculations.J)} = {formatCurrency(calculations.K)} (Net Merchant Fee)</div>
              <div className="step">L = D = {formatCurrency(calculations.L)} (Bank Fee)</div>
              <div className="step">M = E - H - I - L = {formatCurrency(calculations.E)} - {formatCurrency(calculations.H)} - {formatCurrency(calculations.I)} - {formatCurrency(calculations.L)} = {formatCurrency(calculations.M)} (Amount Remitted to Dentist)</div>
              <div className="step">BAS Refund = N = G = {formatCurrency(calculations.N)}</div>
              <div className="step">Total = M + N = {formatCurrency(calculations.M)} + {formatCurrency(calculations.N)} = {formatCurrency(calculations.total)}</div>
            </div>
          );
        
        case METHODS.GROSS_PATIENT_GST:
          return (
            <div className="formula-steps">
              <h5>Gross Method - Service & Facility Fee with GST on Patient Fee</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = -{formatCurrency(calculations.C)} (GST on Patient Fee)</div>
              <div className="step">D = A -(-C)  = {formatCurrency(calculations.A)} -( {formatCurrency(calculations.C)}) = {formatCurrency(calculations.D)} (Patient Fee Excl GST)</div>
              <div className="step">E = D - B = {formatCurrency(calculations.D)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.E)} (Net Patient Fee)</div>
              <div className="step">F = E × {commissionPercent}% = {formatCurrency(calculations.E)} × {commissionPercent}% = {formatCurrency(calculations.F)} (Service & Facility Fee)</div>
              <div className="step">G = F × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.F)} × {calculations.gstOnServiceFacilityPercent ?? clinic?.financialSettings?.grossMethod?.gstOnServiceFacilityFeePercent ?? gstOnServiceFacilityFeePercent ?? gstPercent}% = {formatCurrency(calculations.G)} (GST Service & Facility Fee)</div>
              <div className="step">H = F + G = {formatCurrency(calculations.F)} + {formatCurrency(calculations.G)} = {formatCurrency(calculations.H)} (Total Service & Facility Fee)</div>
              <div className="step">I = B = {formatCurrency(calculations.I)} (Lab Fee Pay By Dentists)</div>
              <div className="step">Amount Remitted = E - H + I - B = {formatCurrency(calculations.E)} - {formatCurrency(calculations.H)} + {formatCurrency(calculations.I)} - {formatCurrency(calculations.B)} = {formatCurrency(calculations.amountRemittedToDentists)}</div>
              <div className="step">BAS Refund = J = G = {formatCurrency(calculations.J)}</div>
              <div className="step">Total = Amount Remitted + G = {formatCurrency(calculations.amountRemittedToDentists)} + {formatCurrency(calculations.G)} = {formatCurrency(calculations.total)}</div>
            </div>
          );
        
        case METHODS.GROSS_OUTWORK:
          return (
            <div className="formula-steps">
              <h5>Gross Method - Service & Facility with Outwork Charge Rate</h5>
              <div className="step">A = {formatCurrency(calculations.A)} (Gross Patient Fee)</div>
              <div className="step">B = {formatCurrency(calculations.B)} (Lab Fee)</div>
              <div className="step">C = {formatCurrency(calculations.C)} (Merchant Fee Cost)</div>
              <div className="step">D = {formatCurrency(calculations.D)} (GST on Lab Fee - Auto-calculated)</div>
              <div className="step">E = B + C + D = {formatCurrency(calculations.B)} + {formatCurrency(calculations.C)} + {formatCurrency(calculations.D)} = {formatCurrency(calculations.E)} (Total Outwork Cost)</div>
              <div className="step">F = A - E = {formatCurrency(calculations.A)} - {formatCurrency(calculations.E)} = {formatCurrency(calculations.F)} (Net Patient Fee)</div>
              <div className="step">G = F × {commissionPercent}% = {formatCurrency(calculations.F)} × {commissionPercent}% = {formatCurrency(calculations.G)} (Service & Facility Fee)</div>
              <div className="step">H = F × {gstPercent}% = {formatCurrency(calculations.F)} × {gstPercent}% = {formatCurrency(calculations.H)} (Lab Fee and Other Cost Charge)</div>
              <div className="step">I = G + H = {formatCurrency(calculations.G)} + {formatCurrency(calculations.H)} = {formatCurrency(calculations.I)} (Total Service Fee + Other Cost)</div>
              <div className="step">J = I × {gstPercent}% = {formatCurrency(calculations.I)} × {gstPercent}% = {formatCurrency(calculations.J)} (GST Service & Facility Fee)</div>
              <div className="step">Total S&F Fee inc GST = J + I = {formatCurrency(calculations.J)} + {formatCurrency(calculations.I)} = {formatCurrency(calculations.totalServiceFacilityFeeIncGst)}</div>
              <div className="step">Net Payable to Dentists = A - Total S&F Fee = {formatCurrency(calculations.A)} - {formatCurrency(calculations.totalServiceFacilityFeeIncGst)} = {formatCurrency(calculations.netPayableToDentists)}</div>
            </div>
          );
        
        default:
          return (
            <div className="formula-steps">
              <h5>Calculation Complete</h5>
              <p className="text-muted">Results calculated using {METHOD_LABELS[selectedMethod]} based on your financial settings.</p>
            </div>
          );
      }
    };

    const isNetMethod = selectedMethod === METHODS.NET_WITHOUT_SUPER || selectedMethod === METHODS.NET_WITH_SUPER;

    return (
      <div className="calculation-results">
        <h3>Calculation Results</h3>
        
        {renderFormulaSteps()}
        
        <div className="key-results">
          <div className="result-card">
            <h4>Net Patient Fee</h4>
            <div className="result-value">{formatCurrency(calculations.netPatientFee)}</div>
          </div>
          
          {isNetMethod ? (
            <>
              <div className="result-card">
                <h4>Dentist Commission</h4>
                <div className="result-value">{formatCurrency(calculations.dentistCommission)}</div>
              </div>
              
              <div className="result-card">
                <h4>GST on Commission</h4>
                <div className="result-value">{formatCurrency(calculations.gstOnCommission)}</div>
              </div>
              
              {calculations.superComponent && (
                <div className="result-card">
                  <h4>Super Component (Paid by Clinic)</h4>
                  <div className="result-value">{formatCurrency(calculations.superComponent)}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="result-card">
                <h4>Service & Facility Fee</h4>
                <div className="result-value">{formatCurrency(calculations.serviceFacilityFee)}</div>
              </div>
              
              <div className="result-card">
                <h4>GST on Service & Facility</h4>
                <div className="result-value">{formatCurrency(calculations.gstServiceFacilityFee)}</div>
              </div>
            </>
          )}
          
          <div className="result-card">
            <h4>BAS Refund</h4>
            <div className="result-value">{formatCurrency(calculations.basRefund)}</div>
          </div>
          
          <div className="result-card highlight">
            <h4>{isNetMethod ? 'Total Commission Payable' : 'Amount Remitted to Dentist'}</h4>
            <div className="result-value">{formatCurrency(calculations.dentistPayable)}</div>
          </div>
          
          <div className="result-card highlight">
            <h4>Total</h4>
            <div className="result-value">{formatCurrency(calculations.total || calculations.dentistPayable)}</div>
          </div>
        </div>

        {/* BAS Codes Section */}
        <div className="bas-codes">
          <h4>BAS Codes (Business Activity Statement)</h4>
          <div className="bas-grid">
            <div className="bas-item">
              <span className="bas-label">G1 - Total Income:</span>
              <span className="bas-value">{formatCurrency(calculations.basG1 || 0)}</span>
            </div>
            <div className="bas-item">
              <span className="bas-label">G3 - GST-free Sales:</span>
              <span className="bas-value">{formatCurrency(calculations.basG3 || 0)}</span>
            </div>
            <div className="bas-item">
              <span className="bas-label">1A - GST on Sales:</span>
              <span className="bas-value">{formatCurrency(calculations.bas1A || 0)}</span>
            </div>
            <div className="bas-item">
              <span className="bas-label">1B - GST Credits:</span>
              <span className="bas-value">{formatCurrency(calculations.bas1B || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!clinic) {
    return <div>Clinic not found</div>;
  }

  return (
    <div className="income-management-page">
      <div className="page-header">
        <h1>Australian Dental Clinic Income Management</h1>
        <p className="text-secondary">
          Calculate and manage income entries for {clinic.practiceName} using Australian dental industry standards
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          type="button"
          className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('calculator');
          }}
        >
          Income Calculator
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('entries');
          }}
        >
          Income Entries ({incomeEntries.length})
        </button>
      </div>

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Australian Dental Clinic Income Calculator</h2>
            </div>

            {/* Method Selector */}
            {renderMethodSelector()}

            {/* Input Fields - Only show if financial settings are configured and method is selected */}
            {clinic?.financialSettings && selectedMethod && renderInputFields()}

            {/* Calculation Results */}
            {clinic?.financialSettings && renderCalculationResults()}

            {/* Save Button */}
            {calculations && inputs.grossPatientFee && clinic?.financialSettings && (
              <div className="form-actions">
                <Button 
                  variant="primary" 
                  onClick={handleSaveEntry}
                >
                  Save Entry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const tempEntry = {
                      id: 'preview-' + Date.now(),
                      clinicId: id,
                      entryDate: new Date().toISOString().split('T')[0],
                      method: selectedMethod,
                      inputs: { ...inputs },
                      calculations: { ...calculations },
                      gstPercent,
                      commissionPercent,
                      serviceFacilityPercent,
                      gstOnCommission,
                      dentistPayable: calculations.dentistPayable || 0,
                      basRefund: calculations.basRefund || 0,
                      createdAt: new Date().toISOString()
                    };
                    handleGenerateReport(tempEntry);
                  }}
                >
                  Preview Report
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income Entries Tab */}
      {activeTab === 'entries' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Income Entries</h2>
              <div className="header-actions">
                {incomeEntries.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleGenerateSummaryReport}
                    >
                      View Summary Report
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadSummaryReport}
                    >
                      Download Summary
                    </Button>
                  </>
                )}
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('calculator')}
                >
                  Add New Entry
                </Button>
              </div>
            </div>

            {/* Report Help */}
            <ReportHelp />

            {/* Income Entries List */}
            <div className="data-table">
              {incomeEntries.length === 0 ? (
                <p className="text-secondary">No income entries created yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Type</th>
                      <th>Gross Patient Fee</th>
                      <th>Lab Fee</th>
                      <th>Dentist Payable</th>
                      <th>BAS Refund</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeEntries.map(entry => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.entryDate).toLocaleDateString()}</td>
                        <td>{METHOD_LABELS[entry.method] || entry.method}</td>
                        <td>{entry.gstOnCommission ? 'Net (Independent)' : 'Gross (Service & Facility)'}</td>
                        <td>{formatCurrency(entry.inputs.grossPatientFee)}</td>
                        <td>{formatCurrency(entry.inputs.labFee || 0)}</td>
                        <td className="dentist-payable">
                          {formatCurrency(entry.dentistPayable)}
                        </td>
                        <td>{formatCurrency(entry.basRefund)}</td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateReport(entry)}
                              title="Generate Report"
                            >
                              📄 Report
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(entry)}
                              title="Download Report"
                            >
                              💾 Download
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              title="Delete Entry"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Summary Statistics */}
            {incomeEntries.length > 0 && (
              <div className="summary-stats">
                <h3>Summary Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Entries:</span>
                    <span className="stat-value">{incomeEntries.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Gross Income:</span>
                    <span className="stat-value">
                      {formatCurrency(
                        incomeEntries.reduce((sum, entry) => sum + (parseFloat(entry.inputs.grossPatientFee) || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Dentist Payable:</span>
                    <span className="stat-value">
                      {formatCurrency(
                        incomeEntries.reduce((sum, entry) => sum + (entry.dentistPayable || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total BAS Refund:</span>
                    <span className="stat-value">
                      {formatCurrency(
                        incomeEntries.reduce((sum, entry) => sum + (entry.basRefund || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeManagementPage;