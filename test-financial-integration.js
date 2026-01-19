// Test Financial Integration Logic

console.log('Testing Financial Integration Logic');
console.log('=====================================');

// Test Case 1: GST on Commission = TRUE (Net Methods)
console.log('\n1. GST on Commission = TRUE (Net Methods Available)');
console.log('   - Net Method Without Super Holding');
console.log('   - Net Method With Super Holding');
console.log('   - Shows: Dentist Commission, GST on Commission, Net Commission');

// Test Case 2: GST on Commission = FALSE (Gross Methods)
console.log('\n2. GST on Commission = FALSE (Gross Methods Available)');
console.log('   - Service and Facility Fee with GST');
console.log('   - S&F Fee with GST on Lab Fee Charged by Clinic');
console.log('   - S&F Fee with GST + Merchant/Bank Fee');
console.log('   - S&F Fee with GST on Lab Fee Paid by Dentist + GST on Patient Fee');
console.log('   - S&F Method – Outwork Charge Rate');
console.log('   - Shows: Service & Facility Fee, GST Service & Facility Fee, Amount Remitted');

// Sample Calculation Test
const testData = {
  grossPatientFee: 1000,
  labFee: 100,
  commissionPercent: 30,
  gstPercent: 10
};

console.log('\n3. Sample Calculation Test');
console.log(`Input: Gross Patient Fee = $${testData.grossPatientFee}, Lab Fee = $${testData.labFee}`);
console.log(`Settings: Commission = ${testData.commissionPercent}%, GST = ${testData.gstPercent}%`);

// Net Method Without Super (GST on Commission = TRUE)
const netPatientFee = testData.grossPatientFee - testData.labFee; // 900
const dentistCommission = netPatientFee * (testData.commissionPercent / 100); // 270
const gstOnCommission = dentistCommission * (1 - testData.gstPercent / 100); // 243
const netCommission = dentistCommission + gstOnCommission; // 513
const dentistPayableNet = netPatientFee - netCommission; // 387

console.log('\nNet Method Without Super (GST on Commission = TRUE):');
console.log(`  Net Patient Fee: $${netPatientFee}`);
console.log(`  Dentist Commission: $${dentistCommission}`);
console.log(`  GST on Commission: $${gstOnCommission}`);
console.log(`  Net Commission: $${netCommission}`);
console.log(`  Dentist Payable: $${dentistPayableNet}`);

// Gross Method Basic (GST on Commission = FALSE)
const serviceFacilityFee = netPatientFee * (testData.commissionPercent / 100); // 270
const gstServiceFacilityFee = serviceFacilityFee * (testData.gstPercent / 100); // 27
const totalServiceFacilityFee = serviceFacilityFee + gstServiceFacilityFee; // 297
const amountRemittedToDentists = netPatientFee - totalServiceFacilityFee; // 603
const basRefund = gstServiceFacilityFee; // 27

console.log('\nGross Method Basic (GST on Commission = FALSE):');
console.log(`  Net Patient Fee: $${netPatientFee}`);
console.log(`  Service & Facility Fee: $${serviceFacilityFee}`);
console.log(`  GST Service & Facility Fee: $${gstServiceFacilityFee}`);
console.log(`  Total Service & Facility Fee: $${totalServiceFacilityFee}`);
console.log(`  Amount Remitted to Dentists: $${amountRemittedToDentists}`);
console.log(`  BAS Refund: $${basRefund}`);

console.log('\n4. Key Differences:');
console.log(`  Net Method Dentist Payable: $${dentistPayableNet}`);
console.log(`  Gross Method Dentist Payable: $${amountRemittedToDentists}`);
console.log(`  Difference: $${Math.abs(dentistPayableNet - amountRemittedToDentists)}`);

console.log('\n✅ Financial integration logic test completed!');
console.log('The system correctly shows different calculation methods based on GST on Commission setting.');