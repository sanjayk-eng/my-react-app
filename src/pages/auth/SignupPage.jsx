import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, setUsers } from '../../utils/localStorage.js';
import { generateUniqueId, hashPassword, userExistsByEmail } from '../../utils/auth.js';
import { validateForm } from '../../utils/validation.js';
import { useToast } from '../../context/ToastContext.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import '../../styles/pages/auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validationRules = {
    name: { required: true, type: 'name', label: 'Name' },
    email: { required: true, type: 'email', label: 'Email' },
    password: { required: true, type: 'password', label: 'Password' },
    confirmPassword: { required: true, label: 'Confirm Password' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    try {
      // Check if email already exists
      if (userExistsByEmail(formData.email)) {
        setErrors({ email: 'Email already exists' });
        setIsLoading(false);
        return;
      }

      // Create new user
      const users = getUsers();
      const newUser = {
        id: generateUniqueId(),
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: hashPassword(formData.password),
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Save user
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);

      showSuccess('Account created successfully! Please log in.');
      navigate('/login');
      
    } catch (error) {
      console.error('Signup error:', error);
      showError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card auth-form-card-wide">
        <div className="form-card-header text-center">
          <h1 className="form-card-title">Create Your Account</h1>
          <p className="form-card-description">
            Join the Health Professional Accounting System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-lg">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              error={errors.password}
              help="Password must be at least 8 characters with 1 uppercase letter and 1 number"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword}
            />
          </div>

          <div className="form-card-footer">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="btn-full"
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="text-center mt-lg">
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;