import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClinics, getExpenseHeads, setExpenseHeads } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';

const ExpenseHeadPage = () => {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Expense Heads State
  const [expenseHeads, setExpenseHeadsState] = useState([]);
  const [showHeadForm, setShowHeadForm] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [headFormData, setHeadFormData] = useState({
    name: '',
    description: '',
    gstApplicable: false,
    gstPercentage: 10,
    gstType: 'inclusive', // 'inclusive' or 'exclusive'
    labFeeApplicable: false,
    labFeePaidBy: 'clinic', // 'clinic' or 'dentist'
    gstOnLabFee: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    
    // Load expense heads
    const heads = getExpenseHeads().filter(head => head.clinicId === id);
    setExpenseHeadsState(heads);
    setIsLoading(false);
  }, [id]);

  const handleHeadFormChange = (field, value) => {
    setHeadFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // If lab fee is enabled, disable GST
      if (field === 'labFeeApplicable' && value === true) {
        newData.gstApplicable = false;
        newData.gstType = 'inclusive';
      }
      
      // If GST is enabled, disable lab fee
      if (field === 'gstApplicable' && value === true) {
        newData.labFeeApplicable = false;
        newData.labFeePaidBy = 'clinic';
        newData.gstOnLabFee = false;
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateHeadForm = () => {
    const newErrors = {};
    
    if (!headFormData.name.trim()) {
      newErrors.name = 'Head name is required';
    }
    
    if (!headFormData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveHead = () => {
    if (!validateHeadForm()) return;
    
    const allHeads = getExpenseHeads();
    
    if (editingHead) {
      // Update existing head
      const updatedHeads = allHeads.map(head => 
        head.id === editingHead.id 
          ? { ...head, ...headFormData, updatedAt: new Date().toISOString() }
          : head
      );
      setExpenseHeads(updatedHeads);
      setExpenseHeadsState(updatedHeads.filter(head => head.clinicId === id));
    } else {
      // Create new head
      const newHead = {
        id: generateUniqueId(),
        clinicId: id,
        ...headFormData,
        createdAt: new Date().toISOString()
      };
      const updatedHeads = [...allHeads, newHead];
      setExpenseHeads(updatedHeads);
      setExpenseHeadsState(updatedHeads.filter(head => head.clinicId === id));
    }
    
    // Reset form
    setHeadFormData({ 
      name: '', 
      description: '', 
      gstApplicable: false, 
      gstPercentage: 10, 
      gstType: 'inclusive',
      labFeeApplicable: false,
      labFeePaidBy: 'clinic',
      gstOnLabFee: false
    });
    setShowHeadForm(false);
    setEditingHead(null);
    setErrors({});
  };

  const handleEditHead = (head) => {
    setEditingHead(head);
    setHeadFormData({
      name: head.name,
      description: head.description,
      gstApplicable: head.gstApplicable || false,
      gstPercentage: head.gstPercentage || 10,
      gstType: head.gstType || 'inclusive',
      labFeeApplicable: head.labFeeApplicable || false,
      labFeePaidBy: head.labFeePaidBy || 'clinic',
      gstOnLabFee: head.gstOnLabFee || false
    });
    setShowHeadForm(true);
  };

  const handleDeleteHead = (headId) => {
    if (window.confirm('Are you sure you want to delete this expense head?')) {
      const allHeads = getExpenseHeads();
      const updatedHeads = allHeads.filter(head => head.id !== headId);
      setExpenseHeads(updatedHeads);
      setExpenseHeadsState(updatedHeads.filter(head => head.clinicId === id));
    }
  };

  const cancelForm = () => {
    setShowHeadForm(false);
    setEditingHead(null);
    setHeadFormData({ 
      name: '', 
      description: '', 
      gstApplicable: false, 
      gstPercentage: 10, 
      gstType: 'inclusive',
      labFeeApplicable: false,
      labFeePaidBy: 'clinic',
      gstOnLabFee: false
    });
    setErrors({});
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!clinic) {
    return <div>Clinic not found</div>;
  }

  return (
    <div className="expense-head-page">
      <div className="page-header">
        <h1>Expense Heads</h1>
        <p className="text-secondary">
          Manage expense categories with GST settings for {clinic.practiceName}
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">Expense Heads</h2>
          <Button
            variant="primary"
            onClick={() => setShowHeadForm(true)}
          >
            Add New Head
          </Button>
        </div>

        {/* Add/Edit Head Form */}
        {showHeadForm && (
          <div className="form-section">
            <h3>{editingHead ? 'Edit' : 'Add'} Expense Head</h3>
            
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Head Name *"
                  value={headFormData.name}
                  onChange={(e) => handleHeadFormChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Enter expense head name"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Description *"
                  value={headFormData.description}
                  onChange={(e) => handleHeadFormChange('description', e.target.value)}
                  error={errors.description}
                  placeholder="Enter description"
                  multiline
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={headFormData.labFeeApplicable}
                    onChange={(e) => handleHeadFormChange('labFeeApplicable', e.target.checked)}
                  />
                  Lab Fee Applicable
                </label>
              </div>
            </div>

            {headFormData.labFeeApplicable && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <Select
                      label="Lab Fee Paid By *"
                      value={headFormData.labFeePaidBy}
                      onChange={(e) => handleHeadFormChange('labFeePaidBy', e.target.value)}
                      options={[
                        { value: 'clinic', label: 'Paid by Clinic' },
                        { value: 'dentist', label: 'Paid by Dentist' }
                      ]}
                      help="Choose who pays the lab fee"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={headFormData.gstOnLabFee}
                        onChange={(e) => handleHeadFormChange('gstOnLabFee', e.target.checked)}
                      />
                      GST on Lab Fee
                    </label>
                  </div>
                </div>
              </>
            )}

            {!headFormData.labFeeApplicable && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={headFormData.gstApplicable}
                        onChange={(e) => handleHeadFormChange('gstApplicable', e.target.checked)}
                      />
                      GST Applicable
                    </label>
                  </div>
                </div>

                {headFormData.gstApplicable && (
                  <div className="form-row">
                    <div className="form-group">
                      <Select
                        label="GST Type *"
                        value={headFormData.gstType}
                        onChange={(e) => handleHeadFormChange('gstType', e.target.value)}
                        options={[
                          { value: 'inclusive', label: 'Inclusive GST (Price includes GST)' },
                          { value: 'exclusive', label: 'Exclusive GST (GST added to price)' }
                        ]}
                        help="Choose how GST is calculated for this expense head. GST rate is fixed at 10%."
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="form-actions">
              <Button variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveHead}>
                {editingHead ? 'Update' : 'Save'} Head
              </Button>
            </div>
          </div>
        )}

        {/* Expense Heads List */}
        <div className="data-table">
          {expenseHeads.length === 0 ? (
            <p className="text-secondary">No expense heads created yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>GST Applicable</th>
                  <th>GST Type</th>
                  <th>Lab Fee</th>
                  <th>Lab Fee Paid By</th>
                  <th>GST on Lab Fee</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseHeads.map(head => (
                  <tr key={head.id}>
                    <td>{head.name}</td>
                    <td>{head.description}</td>
                    <td>
                      <span className={`status-badge ${head.gstApplicable ? 'success' : 'secondary'}`}>
                        {head.gstApplicable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      {head.gstApplicable ? (
                        <span className={`gst-type ${head.gstType || 'inclusive'}`}>
                          {head.gstType === 'exclusive' ? 'Exclusive 10%' : 'Inclusive 10%'}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${head.labFeeApplicable ? 'success' : 'secondary'}`}>
                        {head.labFeeApplicable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      {head.labFeeApplicable ? (
                        <span className={`lab-fee-paid-by ${head.labFeePaidBy || 'clinic'}`}>
                          {head.labFeePaidBy === 'dentist' ? 'Dentist' : 'Clinic'}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {head.labFeeApplicable ? (
                        <span className={`status-badge ${head.gstOnLabFee ? 'success' : 'secondary'}`}>
                          {head.gstOnLabFee ? 'Yes' : 'No'}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{new Date(head.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditHead(head)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteHead(head.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseHeadPage;