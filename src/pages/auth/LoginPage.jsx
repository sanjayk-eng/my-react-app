import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/auth.js';
import { validateForm } from '../../utils/validation.js';
import { useToast } from '../../context/ToastContext.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import '../../styles/pages/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validationRules = {
    email: { required: true, type: 'email', label: 'Email' },
    password: { required: true, label: 'Password' }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
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

    try {
      const result = loginUser(formData.email, formData.password);
      
      if (result.success) {
        // Handle remember me functionality
        if (formData.rememberMe) {
          localStorage.setItem('rememberUser', formData.email);
        } else {
          localStorage.removeItem('rememberUser');
        }
        
        showSuccess('Login successful! Welcome back.');
        navigate('/dashboard');
      } else {
        setErrors({ password: result.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <div className="form-card-header text-center">
          <h1 className="form-card-title">Welcome Back</h1>
          <p className="form-card-description">
            Sign in to your Health Professional Accounting System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
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
          />

          <div className="form-checkbox mb-lg">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe">
              Remember me for 30 days
            </label>
          </div>

          <div className="form-card-footer">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="btn-full"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-center mt-lg">
          <p className="text-sm text-secondary mb-sm">
            <Link to="/forgot-password" className="text-primary font-medium">
              Forgot your password?
            </Link>
          </p>
          <p className="text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;