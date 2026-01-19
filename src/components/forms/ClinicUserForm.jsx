import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

const ClinicUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    permissions: {
      readOnly: [],
      editOnly: []
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Permission definitions
  const readOnlyPermissions = [
    { id: 'viewClinicInfo', label: 'View Clinic Info' },
    { id: 'viewGstMethod', label: 'View GST Method' },
    { id: 'viewLabFeeRule', label: 'Lab Fee Rule' },
    { id: 'seeAllIncomeEntry', label: 'See All Income Entry' },
    { id: 'seeAllExpensesEntry', label: 'See All Expenses Entry' },
    { id: 'seeAllHeadInExpense', label: 'See All Head in Expense' },
    { id: 'seeBasReport', label: 'See BAS Report' },
    { id: 'exportPdfAndExcel', label: 'Export PDF and Excel' },
    { id: 'viewIncomeInvoice', label: 'View Income Invoice' },
    { id: 'viewExpensesInvoice', label: 'View Expenses Invoice' }
  ];

  const editOnlyPermissions = [
    { id: 'editClinicInfo', label: 'Edit Clinic Info' },
    { id: 'revenueSplitPercent', label: 'Revenue Split %' },
    { id: 'labFeeRule', label: 'Lab Fee Rule' },
    { id: 'incomeEntriesCrud', label: 'Income Entries (CRUD)' },
    { id: 'gstOnIncome', label: 'GST On Income' },
    { id: 'generateIncomeInvoice', label: 'Generate Income Invoice' },
    { id: 'addExpensesHeadEdit', label: 'Add Expenses Head / Edit' },
    { id: 'expensesEntriesCrud', label: 'Expenses Entries (CRUD)' },
    { id: 'gstOnExpenses', label: 'GST On Expenses' },
    { id: 'uploadExpensesReport', label: 'Upload Expenses Report' },
    { id: 'generateBas', label: 'Generate BAS' },
    { id: 'adjustBasEntry', label: 'Adjust BAS Entry' },
    { id: 'regenerateBas', label: 'Regenerate BAS' },
    { id: 'submitBas', label: 'Submit BAS' }
  ];

  // Initialize form with existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        permissions: {
          readOnly: user.permissions?.readOnly || [],
          editOnly: user.permissions?.editOnly || []
        }
      });
    }
  }, [user]);

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

  const handlePermissionChange = (permissionType, permissionId, isChecked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionType]: isChecked
          ? [...prev.permissions[permissionType], permissionId]
          : prev.permissions[permissionType].filter(id => id !== permissionId)
      }
    }));
  };

  const handleSelectAllPermissions = (permissionType, selectAll) => {
    const allPermissions = permissionType === 'readOnly' ? readOnlyPermissions : editOnlyPermissions;
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionType]: selectAll ? allPermissions.map(p => p.id) : []
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="clinic-user-form">
      {/* User Information */}
      <div className="form-section">
        <h3 className="form-section-title">User Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <Input
              label="Full Name *"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              error={errors.fullName}
              placeholder="Enter full name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Input
              label="Phone Number *"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              error={errors.phoneNumber}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="form-note">
          <p className="text-secondary">
            <strong>Note:</strong> After adding the user, they can create their own password in their profile.
          </p>
        </div>
      </div>

      {/* Read Only Permissions */}
      <div className="form-section">
        <div className="permission-section-header">
          <h3 className="form-section-title">Read Only Permissions</h3>
          <div className="permission-actions">
            <button
              type="button"
              className="btn-link"
              onClick={() => handleSelectAllPermissions('readOnly', true)}
            >
              Select All
            </button>
            <span className="separator">|</span>
            <button
              type="button"
              className="btn-link"
              onClick={() => handleSelectAllPermissions('readOnly', false)}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="permissions-grid">
          {readOnlyPermissions.map((permission) => (
            <div key={permission.id} className="permission-item">
              <label className="permission-label">
                <input
                  type="checkbox"
                  checked={formData.permissions.readOnly.includes(permission.id)}
                  onChange={(e) => handlePermissionChange('readOnly', permission.id, e.target.checked)}
                />
                <span className="permission-text">{permission.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Only Permissions */}
      <div className="form-section">
        <div className="permission-section-header">
          <h3 className="form-section-title">Edit Only Permissions</h3>
          <div className="permission-actions">
            <button
              type="button"
              className="btn-link"
              onClick={() => handleSelectAllPermissions('editOnly', true)}
            >
              Select All
            </button>
            <span className="separator">|</span>
            <button
              type="button"
              className="btn-link"
              onClick={() => handleSelectAllPermissions('editOnly', false)}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="permissions-grid">
          {editOnlyPermissions.map((permission) => (
            <div key={permission.id} className="permission-item">
              <label className="permission-label">
                <input
                  type="checkbox"
                  checked={formData.permissions.editOnly.includes(permission.id)}
                  onChange={(e) => handlePermissionChange('editOnly', permission.id, e.target.checked)}
                />
                <span className="permission-text">{permission.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

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
          {user ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </form>
  );
};

export default ClinicUserForm;