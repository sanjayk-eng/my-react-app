import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, getExpenseEntries, setExpenseEntries, getExpenseHeads, getExpenseEntities } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import { formatCurrency } from '../../utils/calculations.js';
import { generateExpenseReport, generateExpenseSummaryReport, openReportWindow, downloadReportAsHTML } from '../../utils/expenseReportGenerator.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import ReportHelp from '../../components/common/ReportHelp.jsx';
import '../../styles/pages/expense-management.css';

const ExpenseManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Calculator State
  const [inputs, setInputs] = useState({
    description: '',
    entityId: '', // Changed from category to entityId
    quantity: 1, // Added quantity for entity usage
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [calculations, setCalculations] = useState(null);
  
  // Financial Settings from Clinic Configuration
  const [gstPercent, setGstPercent] = useState(10);
  
  // Expense Entries State
  const [expenseEntries, setExpenseEntriesState] = useState([]);
  
  // Expense Heads and Entities State
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [expenseEntities, setExpenseEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Calculate GST components - simplified to GST Inclusive only
  const calculateExpenseGST = () => {
    const amount = parseFloat(inputs.amount) || 0;
    const gstRate = gstPercent / 100;
    
    // Always treat as GST Inclusive (amount includes GST)
    const totalAmount = amount;
    const gstAmount = amount / (1 + gstRate) * gstRate;
    const netAmount = amount - gstAmount;
    const gstCredit = gstAmount; // Can claim GST credit
    
    return {
      netAmount,
      gstAmount,
      totalAmount,
      gstCredit,
      // BAS Codes for Australian Tax Office
      basG10: totalAmount, // Total purchases
      basG11: netAmount,   // GST-free purchases
      bas1B: gstCredit     // GST credits claimed
    };
  };

  const performCalculation = () => {
    if (!inputs.amount || !inputs.entityId) {
      setCalculations(null);
      return;
    }
    
    const result = calculateExpenseGST();
    setCalculations(result);
  };

  // Reset all state when clinic ID changes
  const resetState = () => {
    setInputs({
      description: '',
      entityId: '',
      quantity: 1,
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setCalculations(null);
    setSelectedEntity(null);
    setActiveTab('calculator');
    setGstPercent(10); // Reset to default
  };

  useEffect(() => {
    // Reset state when clinic changes
    resetState();
    setIsLoading(true);
    
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    
    if (foundClinic) {
      // Load expense entries for this clinic
      const entries = getExpenseEntries().filter(entry => entry.clinicId === id);
      setExpenseEntriesState(entries);
      
      // Load expense heads and entities for this clinic
      const heads = getExpenseHeads().filter(head => head.clinicId === id);
      const entities = getExpenseEntities().filter(entity => entity.clinicId === id);
      setExpenseHeads(heads);
      setExpenseEntities(entities);
      
      // Set GST percentage from clinic settings
      if (foundClinic.financialSettings?.commissionSplitting?.gstPercent) {
        setGstPercent(foundClinic.financialSettings.commissionSplitting.gstPercent);
      }
    } else {
      // Clear data if clinic not found
      setExpenseEntriesState([]);
      setExpenseHeads([]);
      setExpenseEntities([]);
    }
    
    setIsLoading(false);
  }, [id]);

  // Real-time calculation when inputs change
  useEffect(() => {
    performCalculation();
  }, [inputs.amount, gstPercent]);

  // Handle entity selection and auto-calculate amount
  useEffect(() => {
    if (inputs.entityId && inputs.quantity) {
      const entity = expenseEntities.find(e => e.id === inputs.entityId);
      if (entity) {
        setSelectedEntity(entity);
        const calculatedAmount = entity.chargePerUse * inputs.quantity;
        setInputs(prev => ({
          ...prev,
          amount: calculatedAmount.toString()
        }));
      }
    } else {
      setSelectedEntity(null);
    }
  }, [inputs.entityId, inputs.quantity, expenseEntities]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEntry = () => {
    if (!calculations || !inputs.amount || !inputs.entityId || !inputs.description) return;
    
    const allEntries = getExpenseEntries();
    const newEntry = {
      id: generateUniqueId(),
      clinicId: id,
      entryDate: inputs.expenseDate,
      description: inputs.description,
      entityId: inputs.entityId,
      quantity: inputs.quantity,
      notes: inputs.notes,
      inputs: { ...inputs },
      calculations: { ...calculations },
      gstPercent,
      selectedEntity: selectedEntity, // Store entity details for reporting
      createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [...allEntries, newEntry];
    setExpenseEntries(updatedEntries);
    setExpenseEntriesState(updatedEntries.filter(entry => entry.clinicId === id));
    
    // Clear form
    setInputs({
      description: '',
      entityId: '',
      quantity: 1,
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setCalculations(null);
    setSelectedEntity(null);
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      const allEntries = getExpenseEntries();
      const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
      setExpenseEntries(updatedEntries);
      setExpenseEntriesState(updatedEntries.filter(entry => entry.clinicId === id));
    }
  };

  const handleGenerateReport = (entry) => {
    const reportHTML = generateExpenseReport(entry, clinic);
    const reportTitle = `Expense Report - ${clinic.practiceName} - ${new Date(entry.entryDate).toLocaleDateString('en-AU')}`;
    openReportWindow(reportHTML, reportTitle);
  };

  const handleDownloadReport = (entry) => {
    const reportHTML = generateExpenseReport(entry, clinic);
    const filename = `expense-report-${clinic.practiceName.replace(/\s+/g, '-')}-${entry.entryDate}.html`;
    downloadReportAsHTML(reportHTML, filename);
  };

  const handleGenerateSummaryReport = () => {
    const reportHTML = generateExpenseSummaryReport(expenseEntries, clinic);
    const reportTitle = `Expense Summary Report - ${clinic.practiceName}`;
    openReportWindow(reportHTML, reportTitle);
  };

  const handleDownloadSummaryReport = () => {
    const reportHTML = generateExpenseSummaryReport(expenseEntries, clinic);
    const filename = `expense-summary-${clinic.practiceName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    downloadReportAsHTML(reportHTML, filename);
  };

  const renderInputFields = () => {
    const getEntityName = (entityId) => {
      const entity = expenseEntities.find(e => e.id === entityId);
      return entity ? entity.name : 'Unknown Entity';
    };

    const getHeadName = (headId) => {
      const head = expenseHeads.find(h => h.id === headId);
      return head ? head.name : 'Unknown Head';
    };

    return (
      <div className="input-fields">
        <h4>Expense Information</h4>
        
        {expenseEntities.length === 0 && (
          <div className="alert alert-warning">
            <h5>No Expense Entities Available</h5>
            <p>Please create expense heads and entities before adding expense entries.</p>
            <Button
              variant="primary"
              onClick={() => navigate(`/clinics/${id}/expenses-head`)}
            >
              Manage Expense Categories
            </Button>
          </div>
        )}

        {expenseEntities.length > 0 && (
          <>
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Description *"
                  type="text"
                  value={inputs.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter expense description"
                  help="Brief description of the expense"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Select
                  label="Expense Entity *"
                  value={inputs.entityId}
                  onChange={(e) => handleInputChange('entityId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Expense Entity' },
                    ...expenseEntities.map(entity => {
                      const head = expenseHeads.find(h => h.id === entity.headId);
                      return {
                        value: entity.id,
                        label: `${entity.name} (${head?.name || 'Unknown Head'}) - $${entity.chargePerUse.toFixed(2)}/use`
                      };
                    })
                  ]}
                  help="Select the expense entity from your configured categories"
                />
              </div>
            </div>

            {selectedEntity && (
              <div className="entity-info">
                <h5>Selected Entity Details</h5>
                <div className="entity-details">
                  <div className="detail-item">
                    <span className="detail-label">Entity:</span>
                    <span className="detail-value">{selectedEntity.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Head:</span>
                    <span className="detail-value">{getHeadName(selectedEntity.headId)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedEntity.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Purchase Price:</span>
                    <span className="detail-value">${selectedEntity.purchasePrice.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Charge Per Use:</span>
                    <span className="detail-value">${selectedEntity.chargePerUse.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Quantity *"
                  type="number"
                  min="1"
                  step="1"
                  value={inputs.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  help="Number of units/uses for this expense"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Amount *"
                  type="number"
                  min="0"
                  step="0.00"
                  value={inputs.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  help={selectedEntity ? `Auto-calculated: ${selectedEntity.chargePerUse.toFixed(2)} × ${inputs.quantity} = ${(selectedEntity.chargePerUse * inputs.quantity).toFixed(2)}` : "Enter the expense amount"}
                  disabled={!!selectedEntity}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Expense Date *"
                  type="date"
                  value={inputs.expenseDate}
                  onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                  help="Date when the expense was incurred"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Notes"
                  type="textarea"
                  value={inputs.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments"
                  help="Any additional information about this expense"
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCalculationResults = () => {
    if (!calculations) return null;

    return (
      <div className="calculation-results">
        <h3>Expense Calculation Results</h3>
        
        <div className="gst-breakdown">
          <h5>GST Breakdown - GST Inclusive (Price includes GST)</h5>
          <div className="breakdown-steps">
            <div className="step">Amount Entered: {formatCurrency(parseFloat(inputs.amount) || 0)}</div>
            <div className="step">Net Amount (Excl. GST): {formatCurrency(calculations.netAmount)}</div>
            <div className="step">GST Amount ({gstPercent}%): {formatCurrency(calculations.gstAmount)}</div>
            <div className="step">Total Amount (Incl. GST): {formatCurrency(calculations.totalAmount)}</div>
            <div className="step">GST Credit Available: {formatCurrency(calculations.gstCredit)}</div>
          </div>
        </div>
        
        <div className="key-results">
          <div className="result-card">
            <h4>Net Amount</h4>
            <div className="result-value">{formatCurrency(calculations.netAmount)}</div>
          </div>
          
          <div className="result-card">
            <h4>GST Amount</h4>
            <div className="result-value">{formatCurrency(calculations.gstAmount)}</div>
          </div>
          
          <div className="result-card">
            <h4>GST Credit</h4>
            <div className="result-value">{formatCurrency(calculations.gstCredit)}</div>
          </div>
          
          <div className="result-card highlight">
            <h4>Total Expense</h4>
            <div className="result-value">{formatCurrency(calculations.totalAmount)}</div>
          </div>
        </div>

        {/* BAS Codes Section */}
        <div className="bas-codes">
          <h4>BAS Codes (Business Activity Statement)</h4>
          <div className="bas-grid">
            <div className="bas-item">
              <span className="bas-label">G10 - Total Purchases:</span>
              <span className="bas-value">{formatCurrency(calculations.basG10 || 0)}</span>
            </div>
            <div className="bas-item">
              <span className="bas-label">G11 - GST-free Purchases:</span>
              <span className="bas-value">{formatCurrency(calculations.basG11 || 0)}</span>
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
    <div className="expense-management-page">
      <div className="page-header">
        <h1>Australian Dental Clinic Expense Management</h1>
        <p className="text-secondary">
          Track and manage business expenses for {clinic.practiceName} with Australian GST compliance
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
          Expense Entry
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('entries');
          }}
        >
          Expense Records ({expenseEntries.length})
        </button>
      </div>

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Australian Dental Clinic Expense Entry</h2>
            </div>

            <div className="gst-info">
              <h3>GST Configuration</h3>
              <div className="settings-summary">
                <div className="setting-item">
                  <span className="setting-label">GST Rate:</span>
                  <span className="setting-value">{gstPercent}%</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">BAS Compliance:</span>
                  <span className="setting-value">Enabled</span>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            {renderInputFields()}

            {/* Calculation Results */}
            {renderCalculationResults()}

            {/* Save Button - Always visible */}
            <div className="form-actions">
              {/* Validation Messages */}
              {(!calculations || !inputs.amount || !inputs.entityId || !inputs.description) && (
                <div className="validation-messages">
                  <h4>Complete the following to save:</h4>
                  <ul>
                    {!inputs.description && <li>Enter a description</li>}
                    {!inputs.entityId && <li>Select an expense entity</li>}
                    {!inputs.amount && <li>Enter an amount</li>}
                    {!calculations && <li>Calculation will appear when amount is entered</li>}
                  </ul>
                </div>
              )}
              
              <div className="button-group">
                <Button 
                  variant="primary" 
                  onClick={handleSaveEntry}
                  disabled={!calculations || !inputs.amount || !inputs.entityId || !inputs.description}
                >
                  {(!calculations || !inputs.amount || !inputs.entityId || !inputs.description) 
                    ? 'Complete Form to Save' 
                    : 'Save Expense Entry'
                  }
                </Button>
                
                {calculations && inputs.amount && inputs.entityId && inputs.description && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const tempEntry = {
                        id: 'preview-' + Date.now(),
                        clinicId: id,
                        entryDate: inputs.expenseDate,
                        description: inputs.description,
                        entityId: inputs.entityId,
                        quantity: inputs.quantity,
                        notes: inputs.notes,
                        inputs: { ...inputs },
                        calculations: { ...calculations },
                        gstPercent,
                        selectedEntity: selectedEntity,
                        createdAt: new Date().toISOString()
                      };
                      handleGenerateReport(tempEntry);
                    }}
                  >
                    Preview Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Entries Tab */}
      {activeTab === 'entries' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Expense Records</h2>
              <div className="header-actions">
                {expenseEntries.length > 0 && (
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
                  Add New Expense
                </Button>
              </div>
            </div>

            {/* Report Help */}
            <ReportHelp />

            {/* Expense Entries List */}
            <div className="data-table">
              {expenseEntries.length === 0 ? (
                <p className="text-secondary">No expense entries created yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Entity</th>
                      <th>Head</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>GST Credit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseEntries.map(entry => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.entryDate).toLocaleDateString('en-AU')}</td>
                        <td>{entry.description}</td>
                        <td>{entry.selectedEntity?.name || 'Unknown Entity'}</td>
                        <td>{expenseHeads.find(h => h.id === entry.selectedEntity?.headId)?.name || 'Unknown Head'}</td>
                        <td>{entry.quantity || 1}</td>
                        <td className="total-amount">
                          {formatCurrency(entry.calculations.totalAmount)}
                        </td>
                        <td className="gst-credit">
                          {formatCurrency(entry.calculations.gstCredit)}
                        </td>
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
            {expenseEntries.length > 0 && (
              <div className="summary-stats">
                <h3>Summary Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Entries:</span>
                    <span className="stat-value">{expenseEntries.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Expenses:</span>
                    <span className="stat-value">
                      {formatCurrency(
                        expenseEntries.reduce((sum, entry) => sum + (entry.calculations.totalAmount || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total GST Credits:</span>
                    <span className="stat-value">
                      {formatCurrency(
                        expenseEntries.reduce((sum, entry) => sum + (entry.calculations.gstCredit || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Net Expenses:</span>
                    <span className="stat-value">
                      {formatCurrency(
                        expenseEntries.reduce((sum, entry) => sum + (entry.calculations.netAmount || 0), 0)
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

export default ExpenseManagementPage;