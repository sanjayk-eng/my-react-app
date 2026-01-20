// Demo Data Setup for Custom Forms System
// Run this script to populate the system with sample data for testing

console.log('Setting up demo data for Custom Forms System...');

// Create demo clinic
const demoClinic = {
  id: 'demo-clinic-001',
  practiceName: 'Sydney Dental Excellence',
  abnNumber: '98765432109',
  address: '456 George Street',
  city: 'Sydney',
  state: 'NSW',
  ownerId: 'demo-user-001',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Create demo user
const demoUser = {
  id: 'demo-user-001',
  email: 'demo@dentist.com',
  firstName: 'Dr. Sarah',
  lastName: 'Johnson',
  role: 'owner',
  createdAt: new Date().toISOString()
};

// Create sample custom forms
const demoForms = [
  {
    id: 'demo-form-001',
    formName: 'Standard Commission Form',
    calculationMethod: 'net',
    clinicId: demoClinic.id,
    netMethod: {
      superHolding: 'without',
      commissionSplitting: 40,
      gstOnCommission: 10,
      labFeeEnabled: true
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: 'demo-form-002',
    formName: 'Super Inclusive Commission',
    calculationMethod: 'net',
    clinicId: demoClinic.id,
    netMethod: {
      superHolding: 'with',
      commissionSplitting: 45,
      gstOnCommission: 10,
      labFeeEnabled: true
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: 'demo-form-003',
    formName: 'Service Fee Model',
    calculationMethod: 'gross',
    clinicId: demoClinic.id,
    grossMethod: {
      serviceFacilityFeePercent: 60,
      gstOnServiceFacilityFee: 10,
      labFeeEnabled: true,
      labFeePaidBy: 'clinic',
      gstOnLabFeeEnabled: false,
      merchantBankFeeEnabled: false,
      gstOnPatientFeeEnabled: false,
      outworkChargeEnabled: false
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'demo-form-004',
    formName: 'Complex Gross Model',
    calculationMethod: 'gross',
    clinicId: demoClinic.id,
    grossMethod: {
      serviceFacilityFeePercent: 55,
      gstOnServiceFacilityFee: 10,
      labFeeEnabled: true,
      labFeePaidBy: 'clinic',
      gstOnLabFeeEnabled: true,
      merchantBankFeeEnabled: true,
      gstOnMerchantFee: 10,
      gstOnPatientFeeEnabled: false,
      outworkChargeEnabled: false
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

// Create sample income entries
const demoEntries = [
  // Entries for Standard Commission Form
  {
    id: 'demo-entry-001',
    customFormId: 'demo-form-001',
    clinicId: demoClinic.id,
    grossPatientFee: '2500.00',
    labFee: '200.00',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-entry-002',
    customFormId: 'demo-form-001',
    clinicId: demoClinic.id,
    grossPatientFee: '1800.00',
    labFee: '150.00',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-entry-003',
    customFormId: 'demo-form-001',
    clinicId: demoClinic.id,
    grossPatientFee: '3200.00',
    labFee: '0.00',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Entries for Super Inclusive Commission
  {
    id: 'demo-entry-004',
    customFormId: 'demo-form-002',
    clinicId: demoClinic.id,
    grossPatientFee: '1500.00',
    labFee: '100.00',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-entry-005',
    customFormId: 'demo-form-002',
    clinicId: demoClinic.id,
    grossPatientFee: '2200.00',
    labFee: '0.00',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Entries for Service Fee Model
  {
    id: 'demo-entry-006',
    customFormId: 'demo-form-003',
    clinicId: demoClinic.id,
    grossPatientFee: '4500.00',
    labFee: '300.00',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-entry-007',
    customFormId: 'demo-form-003',
    clinicId: demoClinic.id,
    grossPatientFee: '3800.00',
    labFee: '250.00',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Entries for Complex Gross Model
  {
    id: 'demo-entry-008',
    customFormId: 'demo-form-004',
    clinicId: demoClinic.id,
    grossPatientFee: '5200.00',
    labFee: '400.00',
    gstOnLabFee: '40.00',
    merchantFeeIncGst: '156.00',
    bankFee: '3.50',
    createdAt: new Date().toISOString()
  }
];

// Function to setup demo data in localStorage
function setupDemoData() {
  try {
    // Setup user
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    
    // Setup clinic
    const existingClinics = JSON.parse(localStorage.getItem('clinics') || '[]');
    const updatedClinics = existingClinics.filter(c => c.id !== demoClinic.id);
    updatedClinics.push(demoClinic);
    localStorage.setItem('clinics', JSON.stringify(updatedClinics));
    
    // Setup custom forms
    const formsKey = `customForms_${demoClinic.id}`;
    localStorage.setItem(formsKey, JSON.stringify(demoForms));
    
    // Setup income entries
    const entriesKey = `incomeEntries_${demoClinic.id}`;
    localStorage.setItem(entriesKey, JSON.stringify(demoEntries));
    
    console.log('✅ Demo data setup complete!');
    console.log(`✅ Created demo clinic: ${demoClinic.practiceName}`);
    console.log(`✅ Created ${demoForms.length} custom forms`);
    console.log(`✅ Created ${demoEntries.length} income entries`);
    
    return {
      clinic: demoClinic,
      user: demoUser,
      forms: demoForms,
      entries: demoEntries
    };
  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
    return null;
  }
}

// Run setup if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  setupDemoData();
} else {
  // Node.js environment - just show the data structure
  console.log('Demo Data Structure:');
  console.log('Clinic:', demoClinic);
  console.log('Forms:', demoForms.length, 'forms');
  console.log('Entries:', demoEntries.length, 'entries');
  
  // Calculate some sample totals
  const totalGrossRevenue = demoEntries.reduce((sum, entry) => 
    sum + parseFloat(entry.grossPatientFee), 0
  );
  
  console.log(`Total Gross Revenue: $${totalGrossRevenue.toFixed(2)}`);
  
  console.log('\nTo use this demo data:');
  console.log('1. Copy this file to your browser console');
  console.log('2. Or include it in your React app and call setupDemoData()');
  console.log('3. Navigate to /clinics/demo-clinic-001/custom-forms');
}

// Export for use in React app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupDemoData, demoClinic, demoUser, demoForms, demoEntries };
}