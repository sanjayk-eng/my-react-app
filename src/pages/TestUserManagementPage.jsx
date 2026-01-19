import { useState, useEffect } from 'react';
import { getClinics, getClinicUsers } from '../utils/localStorage.js';
import { initializeSampleData } from '../utils/sampleData.js';
import Button from '../components/common/Button.jsx';

const TestUserManagementPage = () => {
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);

  useEffect(() => {
    // Initialize sample data
    initializeSampleData();
    
    // Load data
    const loadedClinics = getClinics();
    const loadedUsers = getClinicUsers();
    
    setClinics(loadedClinics);
    setUsers(loadedUsers);
    
    if (loadedClinics.length > 0) {
      setSelectedClinic(loadedClinics[0]);
    }
  }, []);

  const getClinicUsers = (clinicId) => {
    return users.filter(user => user.clinicId === clinicId);
  };

  const getPermissionDetails = (user) => {
    const readOnly = user.permissions?.readOnly || [];
    const editOnly = user.permissions?.editOnly || [];
    
    return {
      readOnlyCount: readOnly.length,
      editOnlyCount: editOnly.length,
      readOnlyPermissions: readOnly,
      editOnlyPermissions: editOnly
    };
  };

  return (
    <div className="test-user-management-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>User Management Test Page</h1>
        <p>Test the complete user management flow: Add users → Set permissions → Edit permissions</p>
      </div>

      {/* Clinic Selection */}
      {clinics.length > 0 && (
        <div className="clinic-selector" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h3>Selected Clinic: {selectedClinic?.practiceName}</h3>
          <p>ABN: {selectedClinic?.abnNumber}</p>
          <p>Financial Settings Configured: {selectedClinic?.financialSettings ? '✅ Yes' : '❌ No'}</p>
        </div>
      )}

      {/* Financial Settings Summary */}
      {selectedClinic?.financialSettings && (
        <div className="financial-settings-summary" style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3>Financial Settings Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <h4>Commission Settings</h4>
              <p>Commission %: {selectedClinic.financialSettings.commissionSplitting?.commissionPercent || 0}%</p>
              <p>GST on Commission: {selectedClinic.financialSettings.commissionSplitting?.gstOnCommission ? '✅ Yes' : '❌ No'}</p>
              <p>GST %: {selectedClinic.financialSettings.commissionSplitting?.gstPercent || 10}%</p>
            </div>
            <div>
              <h4>Lab Fee Settings</h4>
              <p>Lab Fee Enabled: {selectedClinic.financialSettings.labFee?.enabled ? '✅ Yes' : '❌ No'}</p>
              <p>Pay By: {selectedClinic.financialSettings.labFee?.payBy || 'Clinic'}</p>
            </div>
            <div>
              <h4>Gross Method Settings</h4>
              <p>GST on Lab Fee: {selectedClinic.financialSettings.grossMethod?.gstOnLabFee ? '✅ Yes' : '❌ No'}</p>
              <p>Merchant/Bank Fee: {selectedClinic.financialSettings.grossMethod?.merchantBankFee ? '✅ Yes' : '❌ No'}</p>
              <p>GST on Patient Fee: {selectedClinic.financialSettings.grossMethod?.gstOnPatientFee ? '✅ Yes' : '❌ No'}</p>
              <p>Lab Fee Pay By Dentist: {selectedClinic.financialSettings.grossMethod?.labFeePayByDentist ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px' }}>
            <h4>Expected Input Fields Based on Settings:</h4>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li>✅ Gross Patient Fee (Always shown)</li>
              {selectedClinic.financialSettings.labFee?.enabled && <li>✅ Lab Fee (Lab fee enabled)</li>}
              {selectedClinic.financialSettings.grossMethod?.gstOnLabFee && <li>✅ GST on Lab Fee (GST on lab fee enabled)</li>}
              {selectedClinic.financialSettings.grossMethod?.merchantBankFee && <li>✅ Merchant Fee (Merchant/Bank fee enabled)</li>}
              {selectedClinic.financialSettings.grossMethod?.gstOnPatientFee && <li>✅ GST on Patient Fee (GST on patient fee enabled)</li>}
              {selectedClinic.financialSettings.grossMethod?.labFeePayByDentist && <li>✅ Lab Fee Pay By Dentists (Lab fee pay by dentist enabled)</li>}
            </ul>
          </div>
        </div>
      )}

      {/* User Management Actions */}
      {selectedClinic && (
        <div className="user-actions" style={{ marginBottom: '2rem' }}>
          <h3>User Management Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button
              onClick={() => window.location.href = `/clinics/${selectedClinic.id}/users/add`}
              variant="primary"
            >
              Add New User
            </Button>
            <Button
              onClick={() => window.location.href = `/clinics/${selectedClinic.id}/users`}
              variant="outline"
            >
              Manage Users
            </Button>
            <Button
              onClick={() => window.location.href = `/clinics/${selectedClinic.id}/settings`}
              variant="outline"
            >
              Financial Settings
            </Button>
            <Button
              onClick={() => window.location.href = `/clinics/${selectedClinic.id}/income`}
              variant="outline"
            >
              Test Income Management
            </Button>
          </div>
        </div>
      )}

      {/* Current Users Display */}
      {selectedClinic && (
        <div className="current-users" style={{ marginBottom: '2rem' }}>
          <h3>Current Users ({getClinicUsers(selectedClinic.id).length})</h3>
          
          {getClinicUsers(selectedClinic.id).length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '8px', marginTop: '1rem' }}>
              <p>No users added yet. Click "Add New User" to get started.</p>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {getClinicUsers(selectedClinic.id).map((user) => {
                const permissions = getPermissionDetails(user);
                return (
                  <div key={user.id} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    backgroundColor: user.isActive ? '#ffffff' : '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: user.isActive ? '#1a202c' : '#64748b' }}>
                          {user.fullName} {!user.isActive && '(Inactive)'}
                        </h4>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                          📧 {user.email}
                        </p>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                          📱 {user.phoneNumber}
                        </p>
                        <p style={{ margin: '0', fontSize: '0.875rem' }}>
                          🔐 Password: {user.passwordSet ? '✅ Set' : '⏳ Pending'}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ 
                            backgroundColor: '#2563eb', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {permissions.readOnlyCount + permissions.editOnlyCount} permissions
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          {permissions.readOnlyCount} read • {permissions.editOnlyCount} edit
                        </div>
                        <Button
                          size="sm"
                          onClick={() => window.location.href = `/clinics/${selectedClinic.id}/users/${user.id}/edit`}
                        >
                          Edit Permissions
                        </Button>
                      </div>
                    </div>
                    
                    {/* Permission Details */}
                    {(permissions.readOnlyPermissions.length > 0 || permissions.editOnlyPermissions.length > 0) && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                        {permissions.readOnlyPermissions.length > 0 && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.75rem', color: '#059669' }}>READ ONLY:</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {permissions.readOnlyPermissions.join(', ')}
                            </div>
                          </div>
                        )}
                        {permissions.editOnlyPermissions.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '0.75rem', color: '#dc2626' }}>EDIT ONLY:</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {permissions.editOnlyPermissions.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Test Instructions */}
      <div className="test-instructions" style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px', 
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#0c4a6e', marginBottom: '1rem' }}>🧪 Test Instructions</h3>
        <ol style={{ color: '#0c4a6e', lineHeight: '1.6' }}>
          <li><strong>Configure Financial Settings:</strong> Click "Financial Settings" → Enable/disable various options like "GST on Lab Fee", "Lab Fee Pay By Dentist", etc.</li>
          <li><strong>Test Income Management:</strong> Click "Test Income Management" → Select calculation method → Verify correct input fields appear based on settings</li>
          <li><strong>Add a User:</strong> Click "Add New User" → Fill in name, phone, email → Select permissions → Save</li>
          <li><strong>View Users:</strong> Check the user list above to see the added user with their permissions</li>
          <li><strong>Edit Permissions:</strong> Click "Edit Permissions" on any user → Modify their read/edit permissions → Save</li>
          <li><strong>Verify Changes:</strong> Return to this page to see updated permission counts and details</li>
        </ol>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px' }}>
          <h4 style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>Income Management Features:</h4>
          <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: '0 0 0.5rem 0' }}>
            <strong>Dynamic Input Fields:</strong> Input fields appear/disappear based on financial settings and calculation method selected.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: '0' }}>
            <strong>New Fields Added:</strong> Lab Fee Pay By Dentists, GST on Lab Fee, Merchant Fee, GST on Patient Fee - all controlled by financial settings.
          </p>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '6px' }}>
          <h4 style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>Permission Types:</h4>
          <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: '0' }}>
            <strong>Read Only:</strong> View Clinic Info, View GST Method, See Income/Expense Entries, etc.<br/>
            <strong>Edit Only:</strong> Edit Clinic Info, Manage Income/Expenses, Generate Reports, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestUserManagementPage;