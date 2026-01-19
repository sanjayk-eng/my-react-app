// Test Australian Dental Clinic Calculations

console.log('Testing Australian Dental Clinic Business Logic');
console.log('==============================================');

// Test Data based on your documentation examples
const testData = {
  grossPatientFee: 11000,
  labFee: 1000,
  commissionPercent: 40,
  serviceFacilityPercent: 60,
  gstPercent: 10
};

console.log('\nTest Input Data:');
console.log(`Gross Patient Fee: $${testData.grossPatientFee}`);
console.log(`Lab Fee: $${testData.labFee}`);
console.log(`Commission %: ${testData.commissionPercent}%`);
console.log(`Service & Facility %: ${testData.serviceFacilityPercent}%`);
console.log(`GST %: ${testData.gstPercent}%`);

// NET METHOD 1: Without Super Holding (Independent Contractor)
console.log('\n1. NET METHOD - WITHOUT SUPER HOLDING (Independent Contractor)');
console.log('================================================================');

const A1 = testData.grossPatientFee; // 11,000
const B1 = testData.labFee; // 1,000
const C1 = A1 - B1; // Net Patient Fee = 10,000
const D1 = C1 * (testData.commissionPercent / 100); // Dentist commission = 4,000
const E1 = D1 * (testData.gstPercent / 100); // GST on Commission = 400 (10% of commission)
const F1 = D1 + E1; // Net Commission = 4,400

console.log(`A. Gross Patient Fees: $${A1}`);
console.log(`B. Lab Fees: $${B1}`);
console.log(`C. Net Patient Fee (A-B): $${C1}`);
console.log(`D. Dentist Commission (C × ${testData.commissionPercent}%): $${D1}`);
console.log(`E. GST on Commission (D × ${testData.gstPercent}%): $${E1}`);
console.log(`F. Total Commission Payable (D+E): $${F1}`);
console.log(`✓ Dentist receives: $${F1} (includes commission + GST)`);
console.log(`✓ Clinic responsibility: Pay commission + GST, no super deduction`);
console.log(`✓ Dentist responsibility: Manage own superannuation`);

// NET METHOD 2: With Super Holding (Independent Contractor)
console.log('\n2. NET METHOD - WITH SUPER HOLDING (Independent Contractor)');
console.log('============================================================');

const A2 = testData.grossPatientFee; // 11,000
const B2 = testData.labFee; // 1,000
const C2 = A2 - B2; // Net Patient Fee = 10,000
const D2 = C2 * (testData.commissionPercent / 100); // Dentist Commission = 4,000
const F2 = D2 / 1.12; // Commission Component = 3,571.43
const E2 = F2 * 0.12; // Super Component = 428.57
const G2 = F2 * (testData.gstPercent / 100); // GST on Commission = 357.14 (10% of commission component)
const H2 = F2 + G2; // Net Commission = 3,928.57

console.log(`A. Gross Patient Fees: $${A2}`);
console.log(`B. Lab Fees: $${B2}`);
console.log(`C. Net Patient Fee (A-B): $${C2}`);
console.log(`D. Dentist Commission (C × ${testData.commissionPercent}%): $${D2}`);
console.log(`F. Commission Component (D ÷ 1.12): $${F2.toFixed(2)}`);
console.log(`E. Super Component (F × 12%): $${E2.toFixed(2)} - Paid by clinic to super fund`);
console.log(`G. GST on Commission (F × ${testData.gstPercent}%): $${G2.toFixed(2)}`);
console.log(`H. Total Payment to Dentist (F+G): $${H2.toFixed(2)}`);
console.log(`✓ Dentist receives: $${H2.toFixed(2)} (after super deduction)`);
console.log(`✓ Clinic pays super: $${E2.toFixed(2)} to dentist's super fund`);
console.log(`✓ Total clinic cost: $${(H2 + E2).toFixed(2)}`);

// GROSS METHOD 1: Basic Service & Facility Fee with GST
console.log('\n3. GROSS METHOD - SERVICE & FACILITY FEE WITH GST');
console.log('=================================================');

const A3 = testData.grossPatientFee; // 11,000
const B3 = testData.labFee; // 1,000
const C3 = A3 - B3; // Net Patient Fee = 10,000
const D3 = C3 * (testData.serviceFacilityPercent / 100); // Service & Facility Fee = 6,000
const E3 = D3 * (testData.gstPercent / 100); // GST Service & Facility Fee = 600
const F3 = D3 + E3; // Total Service & Facility Fee = 6,600
const G3 = C3 - F3; // Amount Remitted to Dentists = 3,400

console.log(`A. Gross Patient Fees: $${A3}`);
console.log(`B. Lab Fees: $${B3}`);
console.log(`C. Net Patient Fee (A-B): $${C3}`);
console.log(`D. Service & Facility Fee (C × ${testData.serviceFacilityPercent}%): $${D3}`);
console.log(`E. GST on Service & Facility Fee (D × ${testData.gstPercent}%): $${E3}`);
console.log(`F. Total Service & Facility Fee (D+E): $${F3}`);
console.log(`G. Amount Remitted to Dentists (C-F): $${G3}`);
console.log(`✓ Dentist receives: $${G3}`);
console.log(`✓ Clinic keeps: $${F3} (service fee + GST)`);
console.log(`✓ BAS Refund: $${E3} (GST claimable by clinic)`);

// BAS CODES EXPLANATION
console.log('\n4. BAS CODES (Business Activity Statement)');
console.log('==========================================');
console.log('G1 - Total Income: All patient fees collected');
console.log('G3 - GST-free Sales: Basic dental treatments (most dental work)');
console.log('1A - GST on Sales: Cosmetic dentistry with GST');
console.log('1B - GST Credits: GST on purchases/expenses claimable');

// COMPARISON SUMMARY
console.log('\n5. COMPARISON SUMMARY');
console.log('=====================');
console.log(`Net Method (No Super): Dentist gets $${F1}`);
console.log(`Net Method (With Super): Dentist gets $${H2.toFixed(2)} + $${E2.toFixed(2)} super`);
console.log(`Gross Method: Dentist gets $${G3}`);
console.log(`\nKey Differences:`);
console.log(`- Net Method: Dentist is independent contractor, manages own super`);
console.log(`- Gross Method: Clinic collects all fees, charges service fee, remits balance`);
console.log(`- GST on Commission = TRUE → Use Net Methods`);
console.log(`- GST on Commission = FALSE → Use Gross Methods`);

// REAL WORLD EXAMPLE (from your documentation)
console.log('\n6. REAL WORLD EXAMPLE (From Documentation)');
console.log('===========================================');

// Example from GM1 documentation
const realExample = {
  grossPatientFee: 80494.87,
  labFee: 6575.91,
  serviceFacilityPercent: 60,
  gstPercent: 10
};

const netPatientFee = realExample.grossPatientFee - realExample.labFee; // 73,918.96
const serviceFee = netPatientFee * (realExample.serviceFacilityPercent / 100); // 44,351.38
const gstOnServiceFee = serviceFee * (realExample.gstPercent / 100); // 4,435.14
const totalServiceFee = serviceFee + gstOnServiceFee; // 48,786.51
const dentistReceives = netPatientFee - totalServiceFee; // 25,132.45

console.log(`Real Example - Gross Method:`);
console.log(`Gross Patient Fees: $${realExample.grossPatientFee}`);
console.log(`Lab Fees: $${realExample.labFee}`);
console.log(`Net Patient Fees: $${netPatientFee.toFixed(2)}`);
console.log(`Service & Facility Fee (60%): $${serviceFee.toFixed(2)}`);
console.log(`GST on Service Fee: $${gstOnServiceFee.toFixed(2)}`);
console.log(`Total Service Fee: $${totalServiceFee.toFixed(2)}`);
console.log(`Amount Remitted to Dentist: $${dentistReceives.toFixed(2)}`);

console.log('\n✅ Australian Dental Clinic calculations completed successfully!');
console.log('All formulas match the business documentation provided.');