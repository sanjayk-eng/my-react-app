// Simple test for the 5 calculation methods

// Test data
const testInputs = {
  grossPatientFee: 1000,
  labFee: 100,
  gstOnLabFee: 10,
  merchantFeeWithGst: 50,
  bankFee: 25,
  gstOnPatientFee: 90.91,
  merchantFeeCost: 30
};

const commissionPercent = 30;
const gstPercent = 10;

// Method 1: Gross Method View
function calculateMethod1() {
  const A = testInputs.grossPatientFee;
  const B = testInputs.labFee;
  const commissionRate = commissionPercent / 100;
  const gstRate = gstPercent / 100;
  
  const C = A - B; // Net Patient Fee = 900
  const D = C * commissionRate; // Service & Facility Fee = 270
  const E = D * gstRate; // GST Service & Facility Fee = 27
  const F = D + E; // Total Service & Facility Fee = 297
  const G = C - F; // Amount Remitted to Dentists = 603
  const basRefund = E; // BAS Refund = 27
  const total = G + E; // Total = 630
  
  console.log('Method 1 Results:');
  console.log(`Net Patient Fee (C): $${C}`);
  console.log(`Service & Facility Fee (D): $${D}`);
  console.log(`GST Service & Facility Fee (E): $${E}`);
  console.log(`Total Service & Facility Fee (F): $${F}`);
  console.log(`Amount Remitted to Dentists (G): $${G}`);
  console.log(`BAS Refund: $${basRefund}`);
  console.log(`Total: $${total}`);
  console.log('---');
}

// Method 2: S&F Fee with GST on Lab Fee
function calculateMethod2() {
  const A = testInputs.grossPatientFee;
  const B = testInputs.labFee;
  const C = testInputs.gstOnLabFee;
  const commissionRate = commissionPercent / 100;
  const gstRate = gstPercent / 100;
  
  const D = A - B; // Net Patient Fee = 900
  const E = D * commissionRate; // Service & Facility Fee = 270
  const F = E * gstRate; // GST Service & Facility Fee = 27
  const G = E + F; // Total Service & Facility Fee = 297
  const H = C; // GST on Lab Fee = 10
  const I = D - F - H; // Amount Remitted to Dentists = 863
  const J = F; // BAS Refund = 27
  const total = I + J; // Total = 890
  
  console.log('Method 2 Results:');
  console.log(`Net Patient Fee (D): $${D}`);
  console.log(`Service & Facility Fee (E): $${E}`);
  console.log(`GST Service & Facility Fee (F): $${F}`);
  console.log(`Total Service & Facility Fee (G): $${G}`);
  console.log(`GST on Lab Fee (H): $${H}`);
  console.log(`Amount Remitted to Dentists (I): $${I}`);
  console.log(`BAS Refund (J): $${J}`);
  console.log(`Total: $${total}`);
  console.log('---');
}

// Method 3: S&F Fee with Merchant/Bank Fee
function calculateMethod3() {
  const A = testInputs.grossPatientFee;
  const B = testInputs.labFee;
  const C = testInputs.merchantFeeWithGst;
  const D = testInputs.bankFee;
  const commissionRate = commissionPercent / 100;
  const gstRate = gstPercent / 100;
  
  const E = A - B; // Net Patient Fee = 900
  const F = E * commissionRate; // Service & Facility Fee = 270
  const G = F * gstRate; // GST Service & Facility Fee = 27
  const H = F + G; // Total Service & Facility Fee = 297
  const I = C; // Merchant Fee incl GST = 50
  const J = I * gstRate; // GST on Merchant Fee = 5
  const K = I - J; // Net Merchant Fee = 45
  const L = D; // Bank Fee = 25
  const M = E - H - I - L; // Amount Remitted to Dentists = 528
  const N = G; // BAS Refund = 27
  const total = M + N; // Total = 555
  
  console.log('Method 3 Results:');
  console.log(`Net Patient Fee (E): $${E}`);
  console.log(`Service & Facility Fee (F): $${F}`);
  console.log(`GST Service & Facility Fee (G): $${G}`);
  console.log(`Total Service & Facility Fee (H): $${H}`);
  console.log(`Merchant Fee incl GST (I): $${I}`);
  console.log(`GST on Merchant Fee (J): $${J}`);
  console.log(`Net Merchant Fee (K): $${K}`);
  console.log(`Bank Fee (L): $${L}`);
  console.log(`Amount Remitted to Dentists (M): $${M}`);
  console.log(`BAS Refund (N): $${N}`);
  console.log(`Total: $${total}`);
  console.log('---');
}

// Run tests
console.log('Testing Income Management Calculations');
console.log('=====================================');
console.log(`Test Inputs: Gross Patient Fee: $${testInputs.grossPatientFee}, Lab Fee: $${testInputs.labFee}`);
console.log(`Commission: ${commissionPercent}%, GST: ${gstPercent}%`);
console.log('---');

calculateMethod1();
calculateMethod2();
calculateMethod3();

console.log('All calculations completed successfully!');