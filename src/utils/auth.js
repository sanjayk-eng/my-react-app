import { getUsers, getJwtToken, setJwtToken, removeJwtToken } from './localStorage.js';

// Generate unique ID
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Generate random string for JWT token
export const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Simple password hashing (base64 for demo)
export const hashPassword = (password) => {
  return btoa(password);
};

// Verify password
export const verifyPassword = (password, hashedPassword) => {
  return btoa(password) === hashedPassword;
};

// Generate JWT token
export const generateJwtToken = (user) => {
  const token = {
    token: generateRandomString(64),
    userId: user.id,
    email: user.email,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    issuedAt: new Date().toISOString()
  };
  return token;
};

// Validate JWT token
export const validateToken = (tokenData) => {
  if (!tokenData) return false;
  
  try {
    const { expiresAt, userId } = tokenData;
    
    // Check if token is expired
    if (new Date() > new Date(expiresAt)) {
      return false;
    }
    
    // Check if user still exists
    const users = getUsers();
    const user = users.find(u => u.id === userId && u.isActive);
    
    return !!user;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getJwtToken();
  if (!validateToken(token)) return null;
  
  const users = getUsers();
  return users.find(u => u.id === token.userId);
};

// Check if user exists by email
export const userExistsByEmail = (email) => {
  const users = getUsers();
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Login user
export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.isActive
  );
  
  if (!user || !verifyPassword(password, user.password)) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  const token = generateJwtToken(user);
  setJwtToken(token);
  
  return { success: true, user, token };
};

// Logout user
export const logoutUser = () => {
  removeJwtToken();
  // Could clear other user-specific data here if needed
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getJwtToken();
  return validateToken(token);
};