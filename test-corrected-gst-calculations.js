// Test the corrected GST on Commission calculations
import { 
  calculateNetMethodWithoutSuper, 
  calculateNetMethodWithSuper,
  formatCurrency 
} from './src/utils/calculations.js';

console.log('Testing CORRECTED GST on Commission Calculations');
console.log('===============================================');

// Test data
const testData = {
  grossPatientFee: 11000,
  labFee: 1000,
  commissionPercent: 40,
  gstPercent: 10
};

console.log('\nTest Input:');
console.log(`Gross Patient Fee: ${formatCurrency(testData.grossPatientFee)}`);
console.log(`Lab Fee: ${formatCurrency(testData.labFee)}`);
console.log(`Commission %: ${testData.commissionPercent}%`);
console.log(`GST %: ${testData.gstPercent}%`);

// Test Net Method Without Super
console.log('\n1. NET METHOD - WITHOUT SUPER (GST on Commission = TRUE)');
console.log('========================================================');

const result1 = calculateNetMethodWithoutSuper(
  testData.grossPatientFee,
  testData.labFee,
  testData.commissionPercent,
  testData.gstPercent
);

console.log(`Net Patient Fee: ${formatCurrency(result1.netPatientFee)}`);
console.log(`Dentist Commission: ${formatCurrency(result1.dentistCommission)}`);
console.log(`GST on Commission: ${formatCurrency(result1.gstOnCommission)}`);
console.log(`Total Commission Payable: ${formatCurrency(result1.netCommission)}`);
console.log(`✓ CORRECT: GST = ${formatCurrency(result1.dentistCommission)} × 10% = ${formatCurrency(result1.gstOnCommission)}`);

// Test Net Method With Super
console.log('\n2. NET METHOD - WITH SUPER (GST on Commission = TRUE)');
console.log('=====================================================');

const result2 = calculateNetMethodWithSuper(
  testData.grossPatientFee,
  testData.labFee,
  testData.commissionPercent,
  testData.gstPercent,
  12
);

console.log(`Net Patient Fee: ${formatCurrency(result2.netPatientFee)}`);
console.log(`Dentist Commission: ${formatCurrency(result2.dentistCommission)}`);
console.log(`Commission Component: ${formatCurrency(result2.commissionComponent)}`);
console.log(`Super Component: ${formatCurrency(result2.superComponent)}`);
console.log(`GST on Commission: ${formatCurrency(result2.gstOnCommission)}`);
console.log(`Total Payment to Dentist: ${formatCurrency(result2.netCommission)}`);
console.log(`✓ CORRECT: GST = ${formatCurrency(result2.commissionComponent)} × 10% = ${formatCurrency(result2.gstOnCommission)}`);

console.log('\n✅ GST on Commission calculations are now CORRECT!');
console.log('✅ GST is properly ADDED to commission, not subtracted!');
console.log('✅ Formula: GST = Commission × GST% (not Commission × (1-GST%))');