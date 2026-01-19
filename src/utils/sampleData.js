import { getClinics, setClinics, getUsers } from './localStorage.js';
import { generateUniqueId } from './auth.js';

export const initializeSampleData = () => {
  const existingClinics = getClinics();
  const users = getUsers();
  
  // Only add sample data if no clinics exist and there's at least one user
  if (existingClinics.length === 0 && users.length > 0) {
    const currentUser = users[0]; // Use first user as owner
    
    const sampleClinic = {
      id: generateUniqueId(),
      ownerId: currentUser.id,
      practiceName: 'Sample Dental Practice',
      abnNumber: '12345678901',
      address: '123 Main Street',
      city: 'Sydney',
      state: 'NSW',
      createdAt: new Date().toISOString(),
      financialSettings: {
        commissionSplitting: {
          commissionPercent: 25,
          gstOnCommission: false,
          gstPercent: 10
        },
        labFee: {
          enabled: true,
          payBy: 'Clinic'
        },
        netMethod: {
          enabled: true,
          withSuperHolding: false,
          superComponentPercent: 12
        },
        grossMethod: {
          enabled: false,
          serviceFacilityFee: true,
          gstOnLabFee: false,
          gstLabFeePercent: 10,
          merchantBankFee: false,
          merchantBankFeeWithGst: 0,
          gstOnPatientFee: false,
          gstPatientFeePercent: 10,
          labFeePayByDentist: false,
          labFeeOtherCostCharge: false,
          labFeeChargePercent: 0
        }
      },
      isActive: true
    };
    
    setClinics([sampleClinic]);
    console.log('Sample clinic data initialized');
    return sampleClinic;
  }
  
  return null;
};

export const initializeSampleUser = (clinicId) => {
  const { getClinicUsers, setClinicUsers } = require('./localStorage.js');
  
  const existingUsers = getClinicUsers();
  const clinicUsers = existingUsers.filter(user => user.clinicId === clinicId);
  
  // Add sample user if no users exist for this clinic
  if (clinicUsers.length === 0) {
    const sampleUser = {
      id: generateUniqueId(),
      clinicId: clinicId,
      fullName: 'Dr. John Smith',
      phoneNumber: '+61 2 1234 5678',
      email: 'john.smith@example.com',
      permissions: {
        readOnly: ['viewClinicInfo', 'viewGstMethod', 'seeAllIncomeEntry'],
        editOnly: ['editClinicInfo', 'incomeEntriesCrud']
      },
      createdAt: new Date().toISOString(),
      passwordSet: false,
      isActive: true
    };
    
    const updatedUsers = [...existingUsers, sampleUser];
    setClinicUsers(updatedUsers);
    console.log('Sample user data initialized');
    return sampleUser;
  }
  
  return null;
};

export const resetSampleData = () => {
  setClinics([]);
  console.log('Sample data reset');
};