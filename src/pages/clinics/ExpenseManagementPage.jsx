import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, getExpenseEntries, setExpenseEntries, getExpenseHeads } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import { formatCurrency } from '../../utils/calculations.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
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
    headId: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [calculations, setCalculations] = useState(null);
  
  // Expense Entries State
  const [expenseEntries, setExpenseEntriesState] = useState([]);
  
  // Expense Heads State
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [selectedHead, setSelectedHead] = useState(null);

  // Calculate GST components based on head configuration
  const calculateExpenseGST = () => {
    const amount = parseFloat(inputs.amount) || 0;
    
    if (!selectedHead || !selectedHead.gstApplicable) {
      // GST-Free Head
      return {
        netAmount: amount,
        gstAmount: 0,
        totalAmount: amount,
        gstCredit: 0,
        // BAS Mapping for GST-Free expenses
        basG11: amount,  // G11 - Total purchases (all expenses go here)
        bas1B: 0        // 1B - No GST credits for GST-free
      };
    }

    const gstRate = (selectedHead.gstPercentage || 10) / 100;
    
    if (selectedHead.gstType === 'exclusive') {
      // Exclusive GST Head: Net = A, GST = A × R, Total = A + GST
      const netAmount = amount;
      const gstAmount = amount * gstRate;
      const totalAmount = amount + gstAmount;
      
      return {
        netAmount,
        gstAmount,
        totalAmount,
        gstCredit: gstAmount,
        // BAS Mapping for Exclusive GST expenses
        basG11: totalAmount,  // G11 - Total purchases (full amount including GST)
        bas1B: gstAmount     // 1B - GST credits claimed
      };
    } else {
      // Inclusive GST Head: Net = A / (1 + R), GST = A - Net, Total = A
      const totalAmount = amount;
      const netAmount = amount / (1 + gstRate);
      const gstAmount = amount - netAmount;
      
      return {
        netAmount,
        gstAmount,
        totalAmount,
        gstCredit: gstAmount,
        // BAS Mapping for Inclusive GST expenses
        basG11: totalAmount,  // G11 - Total purchases (full amount including GST)
        bas1B: gstAmount     // 1B - GST credits claimed
      };
    }
  };

  const performCalculation = () => {
    if (!inputs.amount || !inputs.headId) {
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
      headId: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setCalculations(null);
    setSelectedHead(null);
    setActiveTab('calculator');
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
      
      // Load expense heads for this clinic
      const heads = getExpenseHeads().filter(head => head.clinicId === id);
      setExpenseHeads(heads);
    } else {
      // Clear data if clinic not found
      setExpenseEntriesState([]);
      setExpenseHeads([]);
    }
    
    setIsLoading(false);
  }, [id]);

  // Real-time calculation when inputs change
  useEffect(() => {
    performCalculation();
  }, [inputs.amount, inputs.headId]);

  // Handle head selection
  useEffect(() => {
    if (inputs.headId) {
      const head = expenseHeads.find(h => h.id === inputs.headId);
      setSelectedHead(head);
    } else {
      setSelectedHead(null);
    }
  }, [inputs.headId, expenseHeads]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEntry = () => {
    if (!calculations || !inputs.amount || !inputs.headId || !inputs.description) return;
    
    const allEntries = getExpenseEntries();
    const newEntry = {
      id: generateUniqueId(),
      clinicId: id,
      entryDate: inputs.expenseDate,
      description: inputs.description,
      headId: inputs.headId,
      notes: inputs.notes,
      inputs: { ...inputs },
      calculations: { ...calculations },
      selectedHead: selectedHead, // Store head details for reporting
      createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [...allEntries, newEntry];
    setExpenseEntries(updatedEntries);
    setExpenseEntriesState(updatedEntries.filter(entry => entry.clinicId === id));
    
    // Clear form
    setInputs({
      description: '',
      headId: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setCalculations(null);
    setSelectedHead(null);
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      const allEntries = getExpenseEntries();
      const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
      setExpenseEntries(updatedEntries);
      setExpenseEntriesState(updatedEntries.filter(entry => entry.clinicId === id));
    }
  };

  const renderInputFields = () => {
    return (
      <div className="input-fields">
        <h4>Expense Information</h4>
        
        {expenseHeads.length === 0 && (
          <div className="alert alert-warning">
            <h5>No Expense Heads Available</h5>
            <p>Please create expense heads before adding expense entries.</p>
            <Button
              variant="primary"
              onClick={() => navigate(`/clinics/${id}/expenses-head`)}
            >
              Manage Expense Heads
            </Button>
          </div>
        )}

        {expenseHeads.length > 0 && (
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
                  label="Expense Head *"
                  value={inputs.headId}
                  onChange={(e) => handleInputChange('headId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Expense Head' },
                    ...expenseHeads.map(head => ({
                      value: head.id,
                      label: `${head.name} ${head.gstApplicable ? `(GST ${head.gstType === 'exclusive' ? 'Exclusive' : 'Inclusive'} ${head.gstPercentage || 10}%)` : '(GST-Free)'}`
                    }))
                  ]}
                  help="Select the expense head with its GST configuration"
                />
              </div>
            </div>

            {selectedHead && (
              <div className="head-info">
                <h5>Selected Head Details</h5>
                <div className="head-details">
                  <div className="detail-item">
                    <span className="detail-label">Head:</span>
                    <span className="detail-value">{selectedHead.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedHead.description}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">GST Applicable:</span>
                    <span className={`detail-value ${selectedHead.gstApplicable ? 'success' : 'secondary'}`}>
                      {selectedHead.gstApplicable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {selectedHead.gstApplicable && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">GST Rate:</span>
                        <span className="detail-value">{selectedHead.gstPercentage || 10}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">GST Type:</span>
                        <span className={`detail-value gst-type ${selectedHead.gstType || 'inclusive'}`}>
                          {selectedHead.gstType === 'exclusive' ? 'Exclusive GST' : 'Inclusive GST'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Amount *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputs.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  help={selectedHead?.gstApplicable 
                    ? `Enter amount ${selectedHead.gstType === 'exclusive' ? 'excluding' : 'including'} GST`
                    : "Enter the expense amount (GST-free)"
                  }
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

    const gstTypeLabel = selectedHead?.gstApplicable 
      ? (selectedHead.gstType === 'exclusive' ? 'GST Exclusive' : 'GST Inclusive')
      : 'GST-Free';

    return (
      <div className="calculation-results">
        <h3>Expense Calculation Results</h3>
        
        <div className="gst-breakdown">
          <h5>GST Breakdown - {gstTypeLabel}</h5>
          <div className="breakdown-steps">
            <div className="step">Amount Entered: {formatCurrency(parseFloat(inputs.amount) || 0)}</div>
            <div className="step">Net Amount (Excl. GST): {formatCurrency(calculations.netAmount)}</div>
            <div className="step">GST Amount ({selectedHead?.gstPercentage || 0}%): {formatCurrency(calculations.gstAmount)}</div>
            <div className="step">Total Amount: {formatCurrency(calculations.totalAmount)}</div>
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
              <span className="bas-label">G11 - Total Purchases:</span>
              <span className="bas-value">{formatCurrency(calculations.basG11 || 0)}</span>
            </div>
            <div className="bas-item">
              <span className="bas-label">1B - GST Credits:</span>
              <span className="bas-value">{formatCurrency(calculations.bas1B || 0)}</span>
            </div>
          </div>
          <div className="bas-explanation">
            <p><strong>G11</strong>: Total value of all purchases (including GST where applicable)</p>
            <p><strong>1B</strong>: GST credits you can claim back from the ATO</p>
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
        <h1>Head-Based Expense Management</h1>
        <p className="text-secondary">
          Track and manage business expenses for {clinic.practiceName} with head-based GST configuration
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
              <h2 className="form-card-title">Head-Based Expense Entry</h2>
            </div>

            {/* Input Fields */}
            {renderInputFields()}

            {/* Calculation Results */}
            {renderCalculationResults()}

            {/* Save Button */}
            <div className="form-actions">
              {/* Validation Messages */}
              {(!calculations || !inputs.amount || !inputs.headId || !inputs.description) && (
                <div className="validation-messages">
                  <h4>Complete the following to save:</h4>
                  <ul>
                    {!inputs.description && <li>Enter a description</li>}
                    {!inputs.headId && <li>Select an expense head</li>}
                    {!inputs.amount && <li>Enter an amount</li>}
                    {!calculations && <li>Calculation will appear when amount is entered</li>}
                  </ul>
                </div>
              )}
              
              <div className="button-group">
                <Button 
                  variant="primary" 
                  onClick={handleSaveEntry}
                  disabled={!calculations || !inputs.amount || !inputs.headId || !inputs.description}
                >
                  {(!calculations || !inputs.amount || !inputs.headId || !inputs.description) 
                    ? 'Complete Form to Save' 
                    : 'Save Expense Entry'
                  }
                </Button>
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
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('calculator')}
                >
                  Add New Expense
                </Button>
              </div>
            </div>

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
                      <th>Head</th>
                      <th>GST Type</th>
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
                        <td>{entry.selectedHead?.name || 'Unknown Head'}</td>
                        <td>
                          {entry.selectedHead?.gstApplicable ? (
                            <span className={`gst-type ${entry.selectedHead.gstType || 'inclusive'}`}>
                              {entry.selectedHead.gstType === 'exclusive' ? 'Exclusive' : 'Inclusive'} ({entry.selectedHead.gstPercentage || 10}%)
                            </span>
                          ) : (
                            <span className="gst-free">GST-Free</span>
                          )}
                        </td>
                        <td className="total-amount">
                          {formatCurrency(entry.calculations.totalAmount)}
                        </td>
                        <td className="gst-credit">
                          {formatCurrency(entry.calculations.gstCredit)}
                        </td>
                        <td>
                          <div className="action-buttons">
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