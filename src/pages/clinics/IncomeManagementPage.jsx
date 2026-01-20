import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import IncomeEntryForm from '../../components/forms/IncomeEntryForm.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const IncomeManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [clinic, setClinic] = useState(null);
  const [customFinancialConfig, setCustomFinancialConfig] = useState(null);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('entry');

  useEffect(() => {
    loadClinicAndConfig();
  }, [id]);

  const loadClinicAndConfig = async () => {
    try {
      setIsLoading(true);
      
      // Get clinics from localStorage
      const clinics = JSON.parse(localStorage.getItem('clinics') || '[]');
      const foundClinic = clinics.find(c => c.id === id);
      
      if (!foundClinic) {
        navigate('/clinics');
        return;
      }
      
      setClinic(foundClinic);
      
      // Load custom financial configuration
      const savedConfig = localStorage.getItem(`customFinancialSettings_${id}`);
      if (savedConfig) {
        setCustomFinancialConfig(JSON.parse(savedConfig));
      }
      
      // Load income entries
      const savedEntries = localStorage.getItem(`incomeEntries_${id}`);
      if (savedEntries) {
        setIncomeEntries(JSON.parse(savedEntries));
      }
      
    } catch (error) {
      console.error('Error loading clinic and config:', error);
      showToast('Failed to load clinic information', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIncomeEntry = async (incomeEntry) => {
    try {
      const newEntry = {
        ...incomeEntry,
        id: Date.now().toString(),
        entryDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      const updatedEntries = [...incomeEntries, newEntry];
      setIncomeEntries(updatedEntries);
      
      // Save to localStorage
      localStorage.setItem(`incomeEntries_${id}`, JSON.stringify(updatedEntries));
      
      showToast('Income entry saved successfully!', 'success');
      setActiveTab('entries');
    } catch (error) {
      console.error('Error saving income entry:', error);
      showToast('Failed to save income entry', 'error');
    }
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      const updatedEntries = incomeEntries.filter(entry => entry.id !== entryId);
      setIncomeEntries(updatedEntries);
      localStorage.setItem(`incomeEntries_${id}`, JSON.stringify(updatedEntries));
      showToast('Income entry deleted successfully!', 'success');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Clinic not found</h2>
          <Button onClick={() => navigate('/clinics')} variant="primary">
            Back to Clinics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Income Management</h1>
          <p className="page-subtitle">
            Manage income entries for {clinic.practiceName}
          </p>
        </div>
        
        <div className="page-actions">
          {!customFinancialConfig && (
            <Button
              variant="primary"
              onClick={() => navigate(`/clinics/${id}/custom-financial-settings`)}
            >
              Configure Custom Form
            </Button>
          )}
          {customFinancialConfig && (
            <Button
              variant="outline"
              onClick={() => navigate(`/clinics/${id}/custom-financial-settings`)}
            >
              Edit Custom Form
            </Button>
          )}
        </div>
      </div>

      {!customFinancialConfig ? (
        <div className="page-content">
          <div className="alert alert-warning">
            <h3>Custom Financial Form Required</h3>
            <p>
              Please configure your custom financial form first before adding income entries.
              This will define the calculation method and input fields for your income entries.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate(`/clinics/${id}/custom-financial-settings`)}
            >
              Configure Custom Form
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              type="button"
              className={`tab-button ${activeTab === 'entry' ? 'active' : ''}`}
              onClick={() => setActiveTab('entry')}
            >
              Add Income Entry
            </button>
            <button 
              type="button"
              className={`tab-button ${activeTab === 'entries' ? 'active' : ''}`}
              onClick={() => setActiveTab('entries')}
            >
              Income Entries ({incomeEntries.length})
            </button>
          </div>

          <div className="page-content">
            {/* Income Entry Tab */}
            {activeTab === 'entry' && (
              <div className="tab-content">
                <div className="form-card">
                  <div className="form-card-header">
                    <h2 className="form-card-title">Add Income Entry</h2>
                  </div>
                  
                  <IncomeEntryForm
                    clinic={clinic}
                    customFinancialConfig={customFinancialConfig}
                    onSave={handleSaveIncomeEntry}
                    onCancel={() => setActiveTab('entries')}
                  />
                </div>
              </div>
            )}

            {/* Income Entries List Tab */}
            {activeTab === 'entries' && (
              <div className="tab-content">
                <div className="form-card">
                  <div className="form-card-header">
                    <h2 className="form-card-title">Income Entries</h2>
                    <div className="header-actions">
                      <Button
                        variant="primary"
                        onClick={() => setActiveTab('entry')}
                      >
                        Add New Entry
                      </Button>
                    </div>
                  </div>

                  {incomeEntries.length === 0 ? (
                    <div className="empty-state">
                      <p>No income entries created yet.</p>
                      <Button
                        variant="primary"
                        onClick={() => setActiveTab('entry')}
                      >
                        Add First Entry
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="data-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Method</th>
                              <th>Gross Patient Fee</th>
                              <th>Lab Fee</th>
                              <th>Amount Remitted</th>
                              <th>BAS Mapping</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {incomeEntries.map(entry => (
                              <tr key={entry.id}>
                                <td>{new Date(entry.entryDate).toLocaleDateString('en-AU')}</td>
                                <td>
                                  {entry.customFinancialConfig?.calculationMethod === 'net' ? 'Net Method' : 'Gross Method'}
                                  {entry.customFinancialConfig?.calculationMethod === 'net' && (
                                    <small className="text-muted">
                                      <br />({entry.customFinancialConfig.netMethod.superHolding === 'with' ? 'With' : 'Without'} Super)
                                    </small>
                                  )}
                                </td>
                                <td>{formatCurrency(entry.grossPatientFee)}</td>
                                <td>{formatCurrency(entry.labFee || 0)}</td>
                                <td className="amount-remitted">
                                  {formatCurrency(
                                    entry.calculations?.amountRemittedToDentist || 
                                    entry.calculations?.totalCommission || 
                                    entry.calculations?.totalPaymentReceived || 0
                                  )}
                                </td>
                                <td>
                                  <div className="bas-summary">
                                    {Object.entries(entry.basMapping || {}).map(([key, value]) => (
                                      <div key={key} className="bas-item">
                                        <span className="bas-key">{key}:</span>
                                        <span className="bas-value">{formatCurrency(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      title="Delete Entry"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Statistics */}
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
                                incomeEntries.reduce((sum, entry) => sum + (parseFloat(entry.grossPatientFee) || 0), 0)
                              )}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Total Amount Remitted:</span>
                            <span className="stat-value">
                              {formatCurrency(
                                incomeEntries.reduce((sum, entry) => {
                                  const amount = entry.calculations?.amountRemittedToDentist || 
                                               entry.calculations?.totalCommission || 
                                               entry.calculations?.totalPaymentReceived || 0;
                                  return sum + amount;
                                }, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeManagementPage;