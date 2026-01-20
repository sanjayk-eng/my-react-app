import { useState } from 'react';
import Button from '../common/Button.jsx';

const CustomFormList = ({ forms, onCreateForm, onEditForm, onDeleteForm, onViewEntries }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteClick = (form) => {
    setDeleteConfirm(form.id);
  };

  const handleDeleteConfirm = (formId) => {
    onDeleteForm(formId);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getMethodDescription = (form) => {
    if (form.calculationMethod === 'net') {
      return `Net Method - ${form.netMethod.superHolding === 'with' ? 'With' : 'Without'} Super Holding`;
    } else {
      const features = [];
      if (form.grossMethod.gstOnLabFeeEnabled) features.push('GST on Lab Fee');
      if (form.grossMethod.merchantBankFeeEnabled) features.push('Merchant/Bank Fee');
      if (form.grossMethod.gstOnPatientFeeEnabled) features.push('GST on Patient Fee');
      if (form.grossMethod.outworkChargeEnabled) features.push('Outwork Charge');
      
      return `Gross Method${features.length > 0 ? ` - ${features.join(', ')}` : ''}`;
    }
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

  if (forms.length === 0) {
    return (
      <div className="custom-form-list empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">📋</div>
          <h3>No Custom Forms Created</h3>
          <p>Create your first custom financial form to start adding income entries.</p>
          <Button variant="primary" onClick={onCreateForm}>
            Create First Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-form-list">
      <div className="list-header">
        <h3>Custom Financial Forms</h3>
        <Button variant="primary" onClick={onCreateForm}>
          Create New Form
        </Button>
      </div>

      <div className="forms-grid">
        {forms.map((form) => (
          <div key={form.id} className="form-card">
            <div className="form-card-header">
              <h4 className="form-name">{form.formName}</h4>
              <div className="form-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => onEditForm(form)}
                  title="Edit Form"
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteClick(form)}
                  title="Delete Form"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="form-card-content">
              <div className="form-method">
                <span className="method-label">Method:</span>
                <span className="method-value">{getMethodDescription(form)}</span>
              </div>

              {form.calculationMethod === 'net' && (
                <div className="form-details">
                  <div className="detail-item">
                    <span>Commission:</span>
                    <span>{form.netMethod.commissionSplitting}%</span>
                  </div>
                  <div className="detail-item">
                    <span>GST on Commission:</span>
                    <span>{form.netMethod.gstOnCommission}%</span>
                  </div>
                  <div className="detail-item">
                    <span>Lab Fee:</span>
                    <span>{form.netMethod.labFeeEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              )}

              {form.calculationMethod === 'gross' && (
                <div className="form-details">
                  <div className="detail-item">
                    <span>Service Fee:</span>
                    <span>{form.grossMethod.serviceFacilityFeePercent}%</span>
                  </div>
                  <div className="detail-item">
                    <span>GST on Service Fee:</span>
                    <span>{form.grossMethod.gstOnServiceFacilityFee}%</span>
                  </div>
                  <div className="detail-item">
                    <span>Lab Fee:</span>
                    <span>
                      {form.grossMethod.labFeeEnabled 
                        ? `Enabled (${form.grossMethod.labFeePaidBy})` 
                        : 'Disabled'
                      }
                    </span>
                  </div>
                </div>
              )}

              <div className="form-meta">
                <div className="created-date">
                  Created: {formatDate(form.createdAt)}
                </div>
                {form.updatedAt && form.updatedAt !== form.createdAt && (
                  <div className="updated-date">
                    Updated: {formatDate(form.updatedAt)}
                  </div>
                )}
              </div>
            </div>

            <div className="form-card-footer">
              <Button
                variant="primary"
                size="small"
                onClick={() => onViewEntries(form)}
              >
                View Entries
              </Button>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm === form.id && (
              <div className="delete-confirm-overlay">
                <div className="delete-confirm-modal">
                  <h4>Delete Form</h4>
                  <p>
                    Are you sure you want to delete "{form.formName}"? 
                    This will also delete all associated income entries.
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
                      onClick={() => handleDeleteConfirm(form.id)}
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

export default CustomFormList;