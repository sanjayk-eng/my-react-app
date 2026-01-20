import { useState } from 'react';
import Button from '../common/Button.jsx';

const IncomeEntryList = ({ entries, customForm, onAddEntry, onDeleteEntry, onBack }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const handleDeleteClick = (entry) => {
    setDeleteConfirm(entry.id);
  };

  const handleDeleteConfirm = (entryId) => {
    onDeleteEntry(entryId);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryTitle = (entry) => {
    const grossFee = formatCurrency(entry.grossPatientFee);
    const date = new Date(entry.createdAt).toLocaleDateString('en-AU');
    return `${grossFee} - ${date}`;
  };

  const calculateTotals = () => {
    const totals = entries.reduce((acc, entry) => {
      acc.totalGrossPatientFee += parseFloat(entry.grossPatientFee) || 0;
      
      if (entry.calculations) {
        // Add key calculation totals based on method
        if (customForm.calculationMethod === 'net') {
          if (entry.calculations.totalCommission) {
            acc.totalCommission += entry.calculations.totalCommission;
          }
          if (entry.calculations.totalPaymentToDentist) {
            acc.totalPaymentToDentist += entry.calculations.totalPaymentToDentist;
          }
        } else {
          if (entry.calculations.amountRemittedToDentist) {
            acc.totalRemittedToDentist += entry.calculations.amountRemittedToDentist;
          }
          if (entry.calculations.totalServiceFee) {
            acc.totalServiceFee += entry.calculations.totalServiceFee;
          }
        }
      }

      // BAS totals
      if (entry.basMapping) {
        Object.entries(entry.basMapping).forEach(([key, value]) => {
          if (!acc.basTotals[key]) acc.basTotals[key] = 0;
          acc.basTotals[key] += value || 0;
        });
      }

      return acc;
    }, {
      totalGrossPatientFee: 0,
      totalCommission: 0,
      totalPaymentToDentist: 0,
      totalRemittedToDentist: 0,
      totalServiceFee: 0,
      basTotals: {}
    });

    return totals;
  };

  if (entries.length === 0) {
    return (
      <div className="income-entry-list empty-state">
        <div className="list-header">
          <Button variant="outline" onClick={onBack}>
            ← Back to Forms
          </Button>
          <h3>Income Entries - {customForm.formName}</h3>
          <Button variant="primary" onClick={onAddEntry}>
            Add First Entry
          </Button>
        </div>

        <div className="empty-state-content">
          <div className="empty-state-icon">💰</div>
          <h4>No Income Entries</h4>
          <p>Start adding income entries using the "{customForm.formName}" configuration.</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="income-entry-list">
      <div className="list-header">
        <Button variant="outline" onClick={onBack}>
          ← Back to Forms
        </Button>
        <div className="header-info">
          <h3>Income Entries - {customForm.formName}</h3>
          <span className="entry-count">{entries.length} entries</span>
        </div>
        <Button variant="primary" onClick={onAddEntry}>
          Add Entry
        </Button>
      </div>

      {/* Summary Totals */}
      <div className="totals-summary">
        <h4>Summary Totals</h4>
        <div className="totals-grid">
          <div className="total-item">
            <span className="total-label">Total Gross Patient Fees:</span>
            <span className="total-value">{formatCurrency(totals.totalGrossPatientFee)}</span>
          </div>
          
          {customForm.calculationMethod === 'net' && (
            <>
              {totals.totalCommission > 0 && (
                <div className="total-item">
                  <span className="total-label">Total Commission:</span>
                  <span className="total-value">{formatCurrency(totals.totalCommission)}</span>
                </div>
              )}
              {totals.totalPaymentToDentist > 0 && (
                <div className="total-item">
                  <span className="total-label">Total Payment to Dentist:</span>
                  <span className="total-value">{formatCurrency(totals.totalPaymentToDentist)}</span>
                </div>
              )}
            </>
          )}

          {customForm.calculationMethod === 'gross' && (
            <>
              {totals.totalServiceFee > 0 && (
                <div className="total-item">
                  <span className="total-label">Total Service Fees:</span>
                  <span className="total-value">{formatCurrency(totals.totalServiceFee)}</span>
                </div>
              )}
              {totals.totalRemittedToDentist > 0 && (
                <div className="total-item">
                  <span className="total-label">Total Remitted to Dentist:</span>
                  <span className="total-value">{formatCurrency(totals.totalRemittedToDentist)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* BAS Totals */}
        {Object.keys(totals.basTotals).length > 0 && (
          <div className="bas-totals">
            <h5>BAS Totals</h5>
            <div className="bas-totals-grid">
              {Object.entries(totals.basTotals).map(([key, value]) => (
                <div key={key} className="bas-total-item">
                  <span className="bas-total-label">{key.replace(/_/g, ' ')}:</span>
                  <span className="bas-total-value">{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="entries-list">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header" onClick={() => toggleEntryExpansion(entry.id)}>
              <div className="entry-title">
                <h4>{getEntryTitle(entry)}</h4>
                <span className="entry-date">{formatDate(entry.createdAt)}</span>
              </div>
              <div className="entry-actions">
                <button
                  className="expand-btn"
                  title={expandedEntry === entry.id ? 'Collapse' : 'Expand'}
                >
                  {expandedEntry === entry.id ? '▼' : '▶'}
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(entry);
                  }}
                  title="Delete Entry"
                >
                  🗑️
                </button>
              </div>
            </div>

            {expandedEntry === entry.id && (
              <div className="entry-details">
                {/* Input Values */}
                <div className="details-section">
                  <h5>Input Values</h5>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span>Gross Patient Fee:</span>
                      <span>{formatCurrency(entry.grossPatientFee)}</span>
                    </div>
                    {entry.labFee && (
                      <div className="detail-item">
                        <span>Lab Fee:</span>
                        <span>{formatCurrency(entry.labFee)}</span>
                      </div>
                    )}
                    {entry.gstOnLabFee && (
                      <div className="detail-item">
                        <span>GST on Lab Fee:</span>
                        <span>{formatCurrency(entry.gstOnLabFee)}</span>
                      </div>
                    )}
                    {entry.merchantFeeIncGst && (
                      <div className="detail-item">
                        <span>Merchant Fee (Inc GST):</span>
                        <span>{formatCurrency(entry.merchantFeeIncGst)}</span>
                      </div>
                    )}
                    {entry.bankFee && (
                      <div className="detail-item">
                        <span>Bank Fee:</span>
                        <span>{formatCurrency(entry.bankFee)}</span>
                      </div>
                    )}
                    {entry.gstOnPatientFee && (
                      <div className="detail-item">
                        <span>GST on Patient Fee:</span>
                        <span>{formatCurrency(entry.gstOnPatientFee)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculations */}
                {entry.calculations && Object.keys(entry.calculations).length > 0 && (
                  <div className="details-section">
                    <h5>Calculations</h5>
                    <div className="details-grid">
                      {Object.entries(entry.calculations).map(([key, value]) => (
                        <div key={key} className="detail-item">
                          <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span>{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BAS Mapping */}
                {entry.basMapping && Object.keys(entry.basMapping).length > 0 && (
                  <div className="details-section">
                    <h5>BAS Mapping</h5>
                    <div className="details-grid">
                      {Object.entries(entry.basMapping).map(([key, value]) => (
                        <div key={key} className="detail-item">
                          <span>{key.replace(/_/g, ' ')}:</span>
                          <span>{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm === entry.id && (
              <div className="delete-confirm-overlay">
                <div className="delete-confirm-modal">
                  <h4>Delete Entry</h4>
                  <p>
                    Are you sure you want to delete this income entry?
                    <br />
                    <strong>{getEntryTitle(entry)}</strong>
                  </p>
                  <div className="delete-confirm-actions">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleDeleteCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteConfirm(entry.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeEntryList;