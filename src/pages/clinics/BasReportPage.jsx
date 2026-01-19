import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, setClinics, getIncomeEntries, getExpenseEntries, getBasReports, setBasReports } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import { formatCurrency } from '../../utils/calculations.js';
import { 
  getQuarterDateRange, 
  filterEntriesByDateRange, 
  calculateIncomeBasAmounts, 
  calculateExpenseBasAmounts, 
  calculateGstPosition,
  formatBasReportForExport 
} from '../../utils/basCalculations.js';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import BasConfigurationForm from '../../components/forms/BasConfigurationForm.jsx';

const BasReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('report');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Data State
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [basReports, setBasReportsState] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);

  // Configuration State
  const [showConfiguration, setShowConfiguration] = useState(false);

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    
    if (foundClinic) {
      // Load income and expense entries for this clinic
      const income = getIncomeEntries().filter(entry => entry.clinicId === id);
      const expenses = getExpenseEntries().filter(entry => entry.clinicId === id);
      const reports = getBasReports().filter(report => report.clinicId === id);
      
      setIncomeEntries(income);
      setExpenseEntries(expenses);
      setBasReportsState(reports);
      
      // Check if BAS configuration exists
      if (!foundClinic.basConfiguration) {
        setShowConfiguration(true);
        setActiveTab('configuration');
      }
    }
    
    setIsLoading(false);
  }, [id]);

  const handleSaveBasConfiguration = async (configData) => {
    try {
      const clinics = getClinics();
      const updatedClinics = clinics.map(c => 
        c.id === id 
          ? { ...c, basConfiguration: configData }
          : c
      );
      
      // Update localStorage using the utility function
      setClinics(updatedClinics);
      
      setClinic(prev => ({ ...prev, basConfiguration: configData }));
      setShowConfiguration(false);
      setActiveTab('report');
    } catch (error) {
      console.error('Error saving BAS configuration:', error);
    }
  };

  const generateBasReport = () => {
    if (!clinic?.basConfiguration) {
      alert('Please configure BAS settings first');
      return;
    }

    const quarterData = getQuarterData(selectedQuarter, selectedYear);
    const reportData = calculateBasReport(quarterData);
    
    const newReport = {
      id: generateUniqueId(),
      clinicId: id,
      quarter: selectedQuarter,
      year: selectedYear,
      reportData,
      generatedAt: new Date().toISOString(),
      status: 'Draft'
    };

    const allReports = getBasReports();
    const updatedReports = [...allReports, newReport];
    setBasReports(updatedReports);
    setBasReportsState(updatedReports.filter(report => report.clinicId === id));
    setCurrentReport(newReport);
  };

  const exportBasReport = (format = 'json') => {
    if (!currentReport) {
      alert('No report to export');
      return;
    }

    const exportData = formatBasReportForExport(
      currentReport.reportData, 
      clinic, 
      currentReport.quarter, 
      currentReport.year
    );

    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bas-report-${clinic.practiceName.replace(/\s+/g, '-')}-${currentReport.quarter}-${currentReport.year}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getQuarterData = (quarter, year) => {
    const financialYearStart = clinic?.basConfiguration?.quarterlySettings?.financialYearStart || 'July';
    const dateRange = getQuarterDateRange(quarter, year, financialYearStart);
    
    if (!dateRange) return { income: [], expenses: [], startDate: null, endDate: null };

    const quarterIncome = filterEntriesByDateRange(incomeEntries, dateRange.startDate, dateRange.endDate);
    const quarterExpenses = filterEntriesByDateRange(expenseEntries, dateRange.startDate, dateRange.endDate);

    return { 
      income: quarterIncome, 
      expenses: quarterExpenses, 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate 
    };
  };

  const calculateBasReport = (quarterData) => {
    const config = clinic.basConfiguration;
    const report = {
      income: {},
      expenseEntities: {},
      totals: {
        totalIncome: { gross: 0, gst: 0, net: 0 },
        totalExpenses: { gross: 0, gst: 0, net: 0 },
        gstPayable: 0,
        gstRefund: 0,
        netGstPosition: 0
      }
    };

    // Calculate Income Categories
    Object.entries(config.incomeCategories).forEach(([key, category]) => {
      if (category.enabled) {
        const categoryData = calculateIncomeCategory(quarterData.income, key, category, config);
        report.income[key] = categoryData;
        
        // Only add to totals if not 'totalIncome' to avoid double counting
        if (key !== 'totalIncome') {
          report.totals.totalIncome.gross += categoryData.gross;
          report.totals.totalIncome.gst += categoryData.gst;
          report.totals.totalIncome.net += categoryData.net;
        }
      }
    });

    // If totalIncome category exists and is enabled, use it as the final total
    if (config.incomeCategories.totalIncome && config.incomeCategories.totalIncome.enabled && report.income.totalIncome) {
      report.totals.totalIncome = {
        gross: report.income.totalIncome.gross,
        gst: report.income.totalIncome.gst,
        net: report.income.totalIncome.net
      };
    }

    // Calculate Dynamic Expense Entities
    Object.entries(config.expenseEntities || {}).forEach(([entityId, entityConfig]) => {
      if (entityConfig.enabled) {
        const entityData = calculateExpenseEntityCategory(quarterData.expenses, entityId, entityConfig);
        report.expenseEntities[entityId] = entityData;
        
        // Add to totals
        report.totals.totalExpenses.gross += entityData.gross;
        report.totals.totalExpenses.gst += entityData.gst;
        report.totals.totalExpenses.net += entityData.net;
      }
    });

    // Calculate GST Position
    const gstPosition = calculateGstPosition(
      report.totals.totalIncome.gst, 
      report.totals.totalExpenses.gst
    );
    
    report.totals.gstPayable = gstPosition.gstPayable;
    report.totals.gstRefund = gstPosition.gstRefund;
    report.totals.netGstPosition = gstPosition.netGstPosition;

    return report;
  };

  const calculateIncomeCategory = (incomeEntries, categoryKey, category, config) => {
    const amounts = calculateIncomeBasAmounts(incomeEntries, categoryKey, config);
    return { ...amounts, basCode: category.basCode };
  };

  const calculateExpenseEntityCategory = (expenseEntries, entityId, entityConfig) => {
    const amounts = calculateExpenseBasAmounts(expenseEntries, entityId, entityConfig);
    
    return { 
      ...amounts, 
      basCode: entityConfig.basCode, 
      businessUse: entityConfig.businessUse,
      name: entityConfig.name,
      type: entityConfig.type,
      headId: entityConfig.headId
    };
  };

  const matchesExpenseCategory = (entityName, categoryKey) => {
    // Simple matching logic - you can enhance this based on your needs
    const categoryMappings = {
      accountingFees: ['accounting', 'bookkeeping'],
      auditInsurance: ['audit', 'insurance'],
      businessInsurance: ['insurance', 'liability'],
      conferencesOverseas: ['conference', 'overseas', 'international'],
      conferencesAust: ['conference', 'australian', 'domestic'],
      computerExpense: ['computer', 'software', 'it'],
      homeOfficeGst: ['home office', 'office'],
      homeOfficeGstFree: ['home office', 'office'],
      laboratoryWorkGstFree: ['laboratory', 'lab'],
      laboratoryWorkGst: ['laboratory', 'lab'],
      subscriptionGstFree: ['subscription', 'membership'],
      subscriptionGst: ['subscription', 'membership'],
      bankFees: ['bank', 'banking'],
      merchantFees: ['merchant', 'payment'],
      motorVehicleSetRate: ['vehicle', 'car', 'motor'],
      mvInsurance: ['vehicle insurance', 'car insurance'],
      mvRegistration: ['registration', 'rego'],
      mvFuel: ['fuel', 'petrol', 'diesel'],
      mvRepairsMaintenance: ['repair', 'maintenance', 'service'],
      equipment: ['equipment'],
      furniture: ['furniture'],
      computerHardware: ['computer', 'hardware'],
      medicalEquipment: ['medical', 'dental'],
      officeEquipment: ['office equipment']
    };

    const keywords = categoryMappings[categoryKey] || [];
    const entityNameLower = entityName.toLowerCase();
    
    return keywords.some(keyword => entityNameLower.includes(keyword.toLowerCase()));
  };

  const renderBasReportTable = () => {
    if (!currentReport) {
      return (
        <div className="no-report">
          <p>No report generated yet. Click "Generate BAS Report" to create one.</p>
        </div>
      );
    }

    const { reportData } = currentReport;

    return (
      <div className="bas-report-table">
        <div className="report-header">
          <h3>{selectedQuarter} ({getQuarterLabel(selectedQuarter)}) {selectedYear}</h3>
          <div className="report-actions">
            <div className="report-meta">
              <span>Generated: {new Date(currentReport.generatedAt).toLocaleDateString('en-AU')}</span>
              <span>Status: {currentReport.status}</span>
            </div>
            <div className="export-buttons">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportBasReport('json')}
              >
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                Print Report
              </Button>
            </div>
          </div>
        </div>

        <table className="bas-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>% bus.use</th>
              <th>Gross</th>
              <th>GST</th>
              <th>Net</th>
              <th>BAS Code</th>
            </tr>
          </thead>
          <tbody>
            {/* Income Section */}
            <tr className="section-header">
              <td colSpan="6"><strong>INCOME</strong></td>
            </tr>
            {Object.entries(reportData.income).map(([key, data]) => (
              <tr key={key}>
                <td>{clinic.basConfiguration.incomeCategories[key]?.label}</td>
                <td>-</td>
                <td>{formatCurrency(data.gross)}</td>
                <td>{formatCurrency(data.gst)}</td>
                <td>{formatCurrency(data.net)}</td>
                <td>{data.basCode}</td>
              </tr>
            ))}
            
            {/* Total Income */}
            <tr className="total-row">
              <td><strong>Total Income</strong></td>
              <td>-</td>
              <td><strong>{formatCurrency(reportData.totals.totalIncome.gross)}</strong></td>
              <td><strong>{formatCurrency(reportData.totals.totalIncome.gst)}</strong></td>
              <td><strong>{formatCurrency(reportData.totals.totalIncome.net)}</strong></td>
              <td>G1</td>
            </tr>

            {/* Dynamic Expense Entities Section */}
            <tr className="section-header">
              <td colSpan="6"><strong>EXPENSE ENTITIES</strong></td>
            </tr>
            {Object.keys(reportData.expenseEntities).length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No expense entities configured or no expenses for this quarter</td>
              </tr>
            ) : (
              Object.entries(reportData.expenseEntities).map(([entityId, data]) => (
                <tr key={entityId}>
                  <td>{data.name || `Entity ${entityId}`}</td>
                  <td>{data.businessUse || 100}%</td>
                  <td>{formatCurrency(data.gross)}</td>
                  <td>{formatCurrency(data.gst)}</td>
                  <td>{formatCurrency(data.net)}</td>
                  <td>{data.basCode}</td>
                </tr>
              ))
            )}

            {/* Total Expenses */}
            <tr className="total-row">
              <td><strong>Total Expenses</strong></td>
              <td>-</td>
              <td><strong>{formatCurrency(reportData.totals.totalExpenses.gross)}</strong></td>
              <td><strong>{formatCurrency(reportData.totals.totalExpenses.gst)}</strong></td>
              <td><strong>{formatCurrency(reportData.totals.totalExpenses.net)}</strong></td>
              <td>G10/G11</td>
            </tr>

            {/* GST Summary */}
            <tr className="section-header">
              <td colSpan="6"><strong>GST SUMMARY</strong></td>
            </tr>
            <tr className="summary-row">
              <td>GST on Sales (1A)</td>
              <td>-</td>
              <td>-</td>
              <td>{formatCurrency(reportData.totals.totalIncome.gst)}</td>
              <td>-</td>
              <td>1A</td>
            </tr>
            <tr className="summary-row">
              <td>GST Credits (1B)</td>
              <td>-</td>
              <td>-</td>
              <td>{formatCurrency(reportData.totals.totalExpenses.gst)}</td>
              <td>-</td>
              <td>1B</td>
            </tr>
            <tr className="total-row">
              <td><strong>Net GST Position</strong></td>
              <td>-</td>
              <td>-</td>
              <td><strong>{formatCurrency(Math.abs(reportData.totals.netGstPosition))}</strong></td>
              <td>-</td>
              <td>{reportData.totals.netGstPosition >= 0 ? 'Payable' : 'Refund'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const getQuarterLabel = (quarter) => {
    const labels = {
      Q1: 'July-September',
      Q2: 'October-December', 
      Q3: 'January-March',
      Q4: 'April-June'
    };
    return labels[quarter];
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!clinic) {
    return <div>Clinic not found</div>;
  }

  return (
    <div className="bas-report-page">
      <div className="page-header">
        <h1>BAS Reports</h1>
        <p className="text-secondary">
          Generate and manage BAS reports for {clinic.practiceName}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          type="button"
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
          disabled={!clinic.basConfiguration}
        >
          BAS Report
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'configuration' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuration')}
        >
          BAS Configuration
        </button>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">BAS Configuration</h2>
              <p className="form-card-description">
                Configure BAS categories and settings for dynamic report generation
              </p>
            </div>
            
            <BasConfigurationForm
              clinic={clinic}
              onSave={handleSaveBasConfiguration}
              onCancel={() => {
                setShowConfiguration(false);
                if (clinic.basConfiguration) {
                  setActiveTab('report');
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="tab-content">
          {!clinic.basConfiguration ? (
            <div className="form-card">
              <div className="alert alert-warning">
                <h3>BAS Configuration Required</h3>
                <p>Please configure BAS settings before generating reports.</p>
                <Button 
                  variant="primary" 
                  onClick={() => setActiveTab('configuration')}
                >
                  Configure BAS Settings
                </Button>
              </div>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-card-header">
                <h2 className="form-card-title">BAS Report Generation</h2>
                <div className="header-actions">
                  <div className="quarter-selector">
                    <Select
                      label="Quarter"
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      options={[
                        { value: 'Q1', label: 'Q1 (July-September)' },
                        { value: 'Q2', label: 'Q2 (October-December)' },
                        { value: 'Q3', label: 'Q3 (January-March)' },
                        { value: 'Q4', label: 'Q4 (April-June)' }
                      ]}
                    />
                  </div>
                  <div className="year-selector">
                    <Select
                      label="Year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      options={Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return { value: year, label: year.toString() };
                      })}
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={generateBasReport}
                  >
                    Generate BAS Report
                  </Button>
                </div>
              </div>

              {/* Data Summary */}
              <div className="data-summary">
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Income Entries:</span>
                    <span className="stat-value">{incomeEntries.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Expense Entries:</span>
                    <span className="stat-value">{expenseEntries.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Generated Reports:</span>
                    <span className="stat-value">{basReports.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Configured Entities:</span>
                    <span className="stat-value">
                      {Object.values(clinic.basConfiguration?.expenseEntities || {}).filter(e => e.enabled).length}
                    </span>
                  </div>
                </div>
                
                {/* Quarter Data Preview */}
                {(() => {
                  const quarterData = getQuarterData(selectedQuarter, selectedYear);
                  return (
                    <div className="quarter-preview">
                      <h4>Quarter Data Preview ({selectedQuarter} {selectedYear})</h4>
                      <div className="preview-stats">
                        <div className="preview-item">
                          <span className="preview-label">Income Entries in Quarter:</span>
                          <span className="preview-value">{quarterData.income.length}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">Expense Entries in Quarter:</span>
                          <span className="preview-value">{quarterData.expenses.length}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">Date Range:</span>
                          <span className="preview-value">
                            {quarterData.startDate ? quarterData.startDate.toLocaleDateString('en-AU') : 'N/A'} - {quarterData.endDate ? quarterData.endDate.toLocaleDateString('en-AU') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* BAS Report Table */}
              {renderBasReportTable()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BasReportPage;

