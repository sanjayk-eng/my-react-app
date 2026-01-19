import { STORAGE_KEYS } from './constants.js';

// Generic localStorage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key: ${key}`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key: ${key}`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key: ${key}`, error);
    return false;
  }
};

export const clearAllStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage', error);
    return false;
  }
};

// Specific data access functions
export const getUsers = () => getFromStorage(STORAGE_KEYS.HP_USERS, []);
export const setUsers = (users) => setToStorage(STORAGE_KEYS.HP_USERS, users);

export const getJwtToken = () => getFromStorage(STORAGE_KEYS.JWT_TOKEN);
export const setJwtToken = (token) => setToStorage(STORAGE_KEYS.JWT_TOKEN, token);
export const removeJwtToken = () => removeFromStorage(STORAGE_KEYS.JWT_TOKEN);

export const getProfile = () => getFromStorage(STORAGE_KEYS.HEALTH_PROFESSIONAL_PROFILE);
export const setProfile = (profile) => setToStorage(STORAGE_KEYS.HEALTH_PROFESSIONAL_PROFILE, profile);

export const getClinics = () => getFromStorage(STORAGE_KEYS.CLINICS, []);
export const setClinics = (clinics) => setToStorage(STORAGE_KEYS.CLINICS, clinics);

export const getClinicUsers = () => getFromStorage(STORAGE_KEYS.CLINIC_USERS, []);
export const setClinicUsers = (users) => setToStorage(STORAGE_KEYS.CLINIC_USERS, users);

export const getExpenseHeads = () => getFromStorage(STORAGE_KEYS.EXPENSES_HEADS, []);
export const setExpenseHeads = (heads) => setToStorage(STORAGE_KEYS.EXPENSES_HEADS, heads);

export const getExpenseEntities = () => getFromStorage(STORAGE_KEYS.EXPENSES_ENTITIES, []);
export const setExpenseEntities = (entities) => setToStorage(STORAGE_KEYS.EXPENSES_ENTITIES, entities);

export const getIncomeEntries = () => getFromStorage(STORAGE_KEYS.INCOME_ENTRIES, []);
export const setIncomeEntries = (entries) => setToStorage(STORAGE_KEYS.INCOME_ENTRIES, entries);

export const getExpenseEntries = () => getFromStorage(STORAGE_KEYS.EXPENSE_ENTRIES, []);
export const setExpenseEntries = (entries) => setToStorage(STORAGE_KEYS.EXPENSE_ENTRIES, entries);

export const getBasReports = () => getFromStorage(STORAGE_KEYS.BAS_REPORTS, []);
export const setBasReports = (reports) => setToStorage(STORAGE_KEYS.BAS_REPORTS, reports);