import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth.js';
import { getProfile, setProfile } from '../../utils/localStorage.js';
import { validateForm } from '../../utils/validation.js';
import { useToast } from '../../context/ToastContext.jsx';
import { TIMEZONES } from '../../utils/constants.js';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';

const ProfilePage = () => {
  const { showSuccess, showError } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePhoto: '',
    phoneNumber: '',
    timezone: 'Sydney'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      // Load existing profile or create from user data
      const existingProfile = getProfile();
      if (existingProfile && existingProfile.userId === user.id) {
        setFormData(existingProfile);
        setPhotoPreview(existingProfile.profilePhoto || '');
      } else {
        // Initialize with user data
        setFormData(prev => ({
          ...prev,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email
        }));
      }
    }
  }, []);

  const validationRules = {
    name: { required: true, type: 'name', label: 'Name' },
    phoneNumber: { required: true, type: 'phone', label: 'Phone Number' },
    timezone: { required: true, label: 'Timezone' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError('Image size must be less than 2MB');
        return;
      }
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData(prev => ({ ...prev, profilePhoto: base64String }));
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const profileData = {
        ...formData,
        userId: currentUser.id,
        email: currentUser.email, // Keep email readonly
        updatedAt: new Date().toISOString()
      };

      setProfile(profileData);
      showSuccess('Profile updated successfully!');
      
    } catch (error) {
      console.error('Profile update error:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p className="text-secondary">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Profile Photo */}
          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <div className="profile-photo-section">
              <div className="profile-photo-preview">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="profile-photo-img" />
                ) : (
                  <div className="profile-photo-placeholder">
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="profile-photo-controls">
                <div className="form-file">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label className="form-file-label">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Photo
                  </label>
                </div>
                <span className="form-help">
                  Upload a photo (max 2MB, JPG/PNG)
                </span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                error={errors.name}
              />
            </div>
            <div className="form-col">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                disabled
                help="Email cannot be changed"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                error={errors.phoneNumber}
                help="Australian format: +61 or 0"
              />
            </div>
            <div className="form-col">
              <Select
                label="Timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                options={TIMEZONES}
                required
                error={errors.timezone}
              />
            </div>
          </div>

          <div className="form-card-footer">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;