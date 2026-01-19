import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClinics, getClinicUsers, setClinicUsers } from '../../utils/localStorage.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingScreen from '../../components/common/LoadingScreen.jsx';

const ClinicUsersPage = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);

    const allUsers = getClinicUsers();
    const clinicUsers = allUsers.filter(user => user.clinicId === id);
    setUsers(clinicUsers);
    
    setIsLoading(false);
  }, [id]);

  const handleToggleUserStatus = (userId, isActive) => {
    try {
      const allUsers = getClinicUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === userId 
          ? { ...user, isActive, updatedAt: new Date().toISOString() }
          : user
      );
      
      setClinicUsers(updatedUsers);
      setUsers(updatedUsers.filter(user => user.clinicId === id));
      
      showSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      showError('Failed to update user status. Please try again.');
    }
  };

  const getPermissionCount = (user) => {
    const readOnlyCount = user.permissions?.readOnly?.length || 0;
    const editOnlyCount = user.permissions?.editOnly?.length || 0;
    return readOnlyCount + editOnlyCount;
  };

  const getPermissionSummary = (user) => {
    const readOnlyCount = user.permissions?.readOnly?.length || 0;
    const editOnlyCount = user.permissions?.editOnly?.length || 0;
    return `${readOnlyCount} read, ${editOnlyCount} edit`;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!clinic) {
    return (
      <div className="clinic-users-page">
        <div className="page-header">
          <h1>Clinic Not Found</h1>
          <p className="text-secondary">
            The requested clinic could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="clinic-users-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Clinic Users</h1>
          <p className="text-secondary">
            Manage users and permissions for {clinic.practiceName}
          </p>
        </div>
        <div className="page-header-actions">
          <Link to={`/clinics/${id}/users/add`} className="btn btn-primary">
            Add User
          </Link>
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">User Management</h2>
          <p className="form-card-description">
            {users.length === 0 
              ? 'No users have been added to this clinic yet.' 
              : `Managing ${users.length} user${users.length !== 1 ? 's' : ''} for this clinic`
            }
          </p>
        </div>
        
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3>No Users Added</h3>
            <p>Start by adding your first user to this clinic.</p>
            <Link to={`/clinics/${id}/users/add`} className="btn btn-primary">
              Add First User
            </Link>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={!user.isActive ? 'user-inactive' : ''}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="user-contact">
                        {user.phoneNumber}
                      </div>
                    </td>
                    <td>
                      <div className="permission-summary">
                        <span className="permission-count">{getPermissionCount(user)}</span>
                        <span className="permission-details">{getPermissionSummary(user)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`password-status ${user.passwordSet ? 'password-set' : 'password-pending'}`}>
                        {user.passwordSet ? 'Set' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions">
                        <Link 
                          to={`/clinics/${id}/users/${user.id}/edit`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Edit
                        </Link>
                        <Button
                          variant={user.isActive ? 'outline-danger' : 'outline-success'}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicUsersPage;