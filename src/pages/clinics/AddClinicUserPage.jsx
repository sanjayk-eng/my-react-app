import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinics, getClinicUsers, setClinicUsers } from '../../utils/localStorage.js';
import { useToast } from '../../context/ToastContext.jsx';
import { generateUniqueId } from '../../utils/auth.js';
import ClinicUserForm from '../../components/forms/ClinicUserForm.jsx';
import LoadingScreen from '../../components/common/LoadingScreen.jsx';

const AddClinicUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    setIsLoading(false);
  }, [id]);

  const handleSaveUser = async (userData) => {
    try {
      const existingUsers = getClinicUsers();
      
      // Check if email already exists for this clinic
      const emailExists = existingUsers.some(
        user => user.clinicId === id && user.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        showError('A user with this email already exists in this clinic.');
        throw new Error('Email already exists');
      }

      const newUser = {
        id: generateUniqueId(),
        clinicId: id,
        fullName: userData.fullName.trim(),
        phoneNumber: userData.phoneNumber.trim(),
        email: userData.email.toLowerCase().trim(),
        permissions: userData.permissions,
        createdAt: new Date().toISOString(),
        passwordSet: false,
        isActive: true
      };

      const updatedUsers = [...existingUsers, newUser];
      setClinicUsers(updatedUsers);

      showSuccess('User added successfully! They can now set their password.');
      navigate(`/clinics/${id}/users`);
      
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.message !== 'Email already exists') {
        showError('Failed to add user. Please try again.');
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
      <div className="add-clinic-user-page">
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
    <div className="add-clinic-user-page">
      <div className="page-header">
        <h1>Add Clinic User</h1>
        <p className="text-secondary">
          Add a new user to {clinic.practiceName} with specific permissions
        </p>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">User Information & Permissions</h2>
          <p className="form-card-description">
            Enter user details and assign appropriate permissions for clinic access
          </p>
        </div>
        
        <ClinicUserForm
          onSave={handleSaveUser}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddClinicUserPage;