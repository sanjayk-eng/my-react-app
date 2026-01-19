// Financial calculation utilities

// Net Method Without Super Holding
export const calculateNetMethodWithoutSuper = (grossPatientFee, labFee, commissionPercent, gstPercent) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  
  const C = A - B; // Net Patient Fee(C) = A - B
  const D = C * commissionRate; // Dentist commission (D) = C * (Commission Splitting ratio)%
  const E = D * gstRate; // GST on Commission (E) = D * (GST on Commission)%
  const F = D + E; // Net Commission(F) = D + E
  
  return {
    grossPatientFee: A,
    labFee: B,
    netPatientFee: C,
    dentistCommission: D,
    gstOnCommission: E,
    netCommission: F,
    dentistPayable: C - F,
    basRefund: 0
  };
};

// Net Method With Super Holding
export const calculateNetMethodWithSuper = (grossPatientFee, labFee, commissionPercent, gstPercent, superPercent = 12) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  const superRate = parseFloat(superPercent) / 100;
  
  const C = A - B; // Net Patient Fee(C) = A - B
  const D = C * commissionRate; // Dentist Commission (D) = C * (Commission Splitting ratio)%
  const F = D / 1.12; // Commission Component (F) = D/1.12
  const E = F * superRate; // Super Component (E) = F * (12 % of Commission Component)
  const G = F * gstRate; // GST on Commission (G) = F * (GST on Commission)%
  const H = F + G; // Net Commission(H) = F + G
  
  return {
    grossPatientFee: A,
    labFee: B,
    netPatientFee: C,
    dentistCommission: D,
    superComponent: E,
    commissionComponent: F,
    gstOnCommission: G,
    netCommission: H,
    dentistPayable: C - H,
    basRefund: 0
  };
};

// Gross Method - Basic Service and Facility Fee
export const calculateGrossMethodBasic = (grossPatientFee, labFee, commissionPercent, gstPercent) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  
  const C = A - B; // Net Patient Fee(C) = A - B
  const D = C * commissionRate; // Service and Facility Fee (D) = C * (GST on Commission)%
  const E = D * gstRate; // GST Service and Facility Fee (E) = D * (GST)%
  const F = D + E; // Total Service and Facility Fee(F) = D + E
  const G = C - F; // Amount Remitted to the Dentists(G) = C - F
  const basRefund = E; // BAS Refund = E
  const total = G + E; // Total = G + E
  
  return {
    grossPatientFee: A,
    labFee: B,
    netPatientFee: C,
    serviceFacilityFee: D,
    gstServiceFacilityFee: E,
    totalServiceFacilityFee: F,
    amountRemittedToDentists: G,
    basRefund,
    total,
    dentistPayable: G
  };
};

// Gross Method - With GST on Lab Fee
export const calculateGrossMethodWithLabFeeGst = (grossPatientFee, labFee, gstOnLabFee, commissionPercent, gstPercent) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const C = parseFloat(gstOnLabFee) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  
  const D = A - B; // Net Patient Fee(D) = A - B
  const E = D * commissionRate; // Service and Facility Fee (E) = D * (GST on Commission)%
  const F = E * gstRate; // GST Service and Facility Fee (F) = E * (GST)%
  const G = E + F; // Total Service and Facility Fee(G) = E + F
  const H = C; // GST on Lab Fee (H) = C
  const I = D - F - H; // Amount Remitted to the Dentists(I) = D - F - H
  const J = F; // BAS Refund = J
  const total = I + J; // Total = I + J
  
  return {
    grossPatientFee: A,
    labFee: B,
    gstOnLabFee: C,
    netPatientFee: D,
    serviceFacilityFee: E,
    gstServiceFacilityFee: F,
    totalServiceFacilityFee: G,
    gstOnLabFeeCharged: H,
    amountRemittedToDentists: I,
    basRefund: J,
    total,
    dentistPayable: I
  };
};

// Gross Method - With Merchant/Bank Fee
export const calculateGrossMethodWithMerchantBank = (grossPatientFee, labFee, merchantFeeWithGst, bankFee, commissionPercent, gstPercent) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const C = parseFloat(merchantFeeWithGst) || 0;
  const D = parseFloat(bankFee) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  
  const E = A - B; // Net Patient Fee(E) = A - B
  const F = E * commissionRate; // Service and Facility Fee (F) = E * (GST on Commission)%
  const G = F * gstRate; // GST Service and Facility Fee (G) = F * (GST)%
  const H = F + G; // Total Service and Facility Fee(H) = F + G
  const I = C; // Merchant Fee inc GST(I) = C
  const J = I * gstRate; // GST on Merchant Fee (J) = I * (GST)%
  const K = I - J; // Net Merchant Fee (K) = I - J
  const L = D; // Bank Fee(L) = D
  const M = E - H - I - L; // Amount Remitted to the Dentists(M) = E - H - I - L
  const N = G; // BAS Refund(N) = G
  const total = G + N; // Total = G + N
  
  return {
    grossPatientFee: A,
    labFee: B,
    merchantFeeWithGst: C,
    bankFee: D,
    netPatientFee: E,
    serviceFacilityFee: F,
    gstServiceFacilityFee: G,
    totalServiceFacilityFee: H,
    merchantFeeIncGst: I,
    gstOnMerchantFee: J,
    netMerchantFee: K,
    bankFeeCharged: L,
    amountRemittedToDentists: M,
    basRefund: N,
    total,
    dentistPayable: M
  };
};

// Gross Method - With GST on Patient Fee
export const calculateGrossMethodWithPatientFeeGst = (grossPatientFee, labFee, gstOnPatientFee, commissionPercent, gstPercent, labFeePayByDentists = 0) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const C = parseFloat(gstOnPatientFee) || 0;
  const labFeeByDentists = parseFloat(labFeePayByDentists) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  
  const D = A - C; // Patient Fee(Excl GST) (D) = A - C
  const E = D - B; // Net Patient Fee(E) = D - B
  const F = E * commissionRate; // Service and Facility Fee (F) = E * (GST on Commission)%
  const G = F * gstRate; // GST Service and Facility Fee (G) = F * (GST)%
  const H = F + G; // Total Service and Facility Fee(H) = F + G
  const I = labFeeByDentists || B; // Lab Fee Pay By Dentists(I) = labFeeByDentists or B
  const amountRemitted = E - H; // Amount Remitted to the Dentists = E - H
  const J = G; // BAS Refund (J) = G
  const total = amountRemitted + G; // Total = amountRemitted + G
  
  return {
    grossPatientFee: A,
    labFee: B,
    gstOnPatientFee: C,
    patientFeeExclGst: D,
    netPatientFee: E,
    serviceFacilityFee: F,
    gstServiceFacilityFee: G,
    totalServiceFacilityFee: H,
    labFeePayByDentists: I,
    amountRemittedToDentists: amountRemitted,
    basRefund: J,
    total,
    dentistPayable: amountRemitted
  };
};

// Gross Method - Outwork Charge Rate
export const calculateOutworkChargeRate = (grossPatientFee, labFee, merchantFeeCost, gstOnLabFee, commissionPercent, gstPercent, labFeeChargePercent) => {
  const A = parseFloat(grossPatientFee) || 0;
  const B = parseFloat(labFee) || 0;
  const C = parseFloat(merchantFeeCost) || 0;
  const D = parseFloat(gstOnLabFee) || 0;
  const commissionRate = parseFloat(commissionPercent) / 100;
  const gstRate = parseFloat(gstPercent) / 100;
  const labChargeRate = parseFloat(labFeeChargePercent) / 100;
  
  const E = B + C + D; // Total Outwork Cost (E) = B + C + D
  const F = A - E; // Net Patient Fee(F) = A - E
  const G = F * commissionRate; // Service and Facility Fee (G) = F * (GST on Commission)%
  const H = F * labChargeRate; // Lab Fee and Other Cost Charge (H) = F * (GST)%
  const I = G + H; // Total Service Fee + Other Cost(I) = G + H
  const J = I * gstRate; // GST Service and Facility Fee (J) = I * (GST)%
  const K = J + I; // Total Service and Facility Fee + inc GST(K) = J + I
  const netPayable = A - K; // Net Payable to Dentists(I) = A - K
  
  return {
    grossPatientFee: A,
    labFee: B,
    merchantFeeCost: C,
    gstOnLabFee: D,
    totalOutworkCost: E,
    netPatientFee: F,
    serviceFacilityFee: G,
    labFeeOtherCostCharge: H,
    totalServiceFeeOtherCost: I,
    gstServiceFacilityFee: J,
    totalServiceFacilityFeeIncGst: K,
    netPayableToDentists: netPayable,
    dentistPayable: netPayable,
    basRefund: 0
  };
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount || 0);
};

// Helper function to format percentage
export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(2)}%`;
};