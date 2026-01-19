import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, getClinicUsers, setClinicUsers } from '../../utils/localStorage.js';
import { useToast } from '../../context/ToastContext.jsx';
import ClinicUserForm from '../../components/forms/ClinicUserForm.jsx';
import LoadingScreen from '../../components/common/LoadingScreen.jsx';

const EditClinicUserPage = () => {
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [clinic, setClinic] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);

    const allUsers = getClinicUsers();
    const foundUser = allUsers.find(u => u.id === userId && u.clinicId === id);
    setUser(foundUser);
    
    setIsLoading(false);
  }, [id, userId]);

  const handleSaveUser = async (userData) => {
    try {
      const allUsers = getClinicUsers();
      
      // Check if email already exists for this clinic (excluding current user)
      const emailExists = allUsers.some(
        u => u.clinicId === id && 
             u.id !== userId && 
             u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        showError('A user with this email already exists in this clinic.');
        throw new Error('Email already exists');
      }

      const updatedUsers = allUsers.map(u => 
        u.id === userId 
          ? {
              ...u,
              fullName: userData.fullName.trim(),
              phoneNumber: userData.phoneNumber.trim(),
              email: userData.email.toLowerCase().trim(),
              permissions: userData.permissions,
              updatedAt: new Date().toISOString()
            }
          : u
      );
      
      setClinicUsers(updatedUsers);

      showSuccess('User updated successfully!');
      navigate(`/clinics/${id}/users`);
      
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.message !== 'Email already exists') {
        showError('Failed to update user. Please try again.');
      }
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(`/clinics/${id}/users`);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!clinic) {
    return (
      <div className="edit-clinic-user-page">
        <div className="page-header">
          <h1>Clinic Not Found</h1>
          <p className="text-secondary">
            The requested clinic could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="edit-clinic-user-page">
        <div className="page-header">
          <h1>User Not Found</h1>
          <p className="text-secondary">
            The requested user could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-clinic-user-page">
      <div className="page-header">
        <h1>Edit User</h1>
        <p className="text-secondary">
          Update user information and permissions for {user.fullName} in {clinic.practiceName}
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">User Information & Permissions</h2>
          <p className="form-card-description">
            Modify user details and adjust permissions for clinic access
          </p>
        </div>
        
        <ClinicUserForm
          user={user}
          onSave={handleSaveUser}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditClinicUserPage;