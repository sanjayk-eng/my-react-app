// BAS Calculation Utilities

/**
 * Enhanced expense category matching
 * Maps expense entity names to BAS categories
 */
export const matchExpenseToBasCategory = (entityName, entityType) => {
  const entityNameLower = entityName.toLowerCase();
  
  // Non-Capital Purchase Categories
  const nonCapitalMappings = {
    accountingFees: ['accounting', 'bookkeeping', 'tax', 'audit'],
    auditInsurance: ['audit', 'professional indemnity', 'liability insurance'],
    businessInsurance: ['business insurance', 'public liability', 'property insurance'],
    conferencesOverseas: ['conference', 'overseas', 'international', 'seminar abroad'],
    conferencesAust: ['conference', 'australian', 'domestic', 'seminar', 'workshop'],
    computerExpense: ['computer', 'software', 'it support', 'cloud', 'subscription'],
    homeOfficeGst: ['home office', 'office rent', 'utilities'],
    homeOfficeGstFree: ['home office', 'office supplies'],
    laboratoryWorkGstFree: ['laboratory', 'lab work', 'pathology'],
    laboratoryWorkGst: ['laboratory', 'lab equipment', 'lab supplies'],
    subscriptionGstFree: ['membership', 'professional body'],
    subscriptionGst: ['subscription', 'magazine', 'journal'],
    bankFees: ['bank', 'banking', 'transaction fee', 'account fee'],
    merchantFees: ['merchant', 'payment', 'eftpos', 'credit card'],
    motorVehicleSetRate: ['vehicle', 'car', 'motor', 'travel'],
    mvInsurance: ['vehicle insurance', 'car insurance', 'motor insurance'],
    mvRegistration: ['registration', 'rego', 'vehicle registration'],
    mvFuel: ['fuel', 'petrol', 'diesel', 'gas'],
    mvRepairsMaintenance: ['repair', 'maintenance', 'service', 'mechanic']
  };

  // Capital Purchase Categories
  const capitalMappings = {
    equipment: ['equipment', 'machinery', 'tools'],
    furniture: ['furniture', 'desk', 'chair', 'cabinet'],
    computerHardware: ['computer', 'laptop', 'server', 'hardware'],
    medicalEquipment: ['medical', 'dental', 'x-ray', 'scanner'],
    officeEquipment: ['printer', 'phone', 'office equipment']
  };

  const mappings = entityType === 'Capital Purchases' ? capitalMappings : nonCapitalMappings;
  
  // Find matching category
  for (const [category, keywords] of Object.entries(mappings)) {
    if (keywords.some(keyword => entityNameLower.includes(keyword))) {
      return category;
    }
  }
  
  return null; // No match found
};

/**
 * Calculate BAS amounts for income entries
 */
export const calculateIncomeBasAmounts = (incomeEntries, categoryKey, basConfiguration) => {
  let gross = 0, gst = 0, net = 0;

  incomeEntries.forEach(entry => {
    const calc = entry.calculations;
    if (!calc) return;
    
    // Get the total income amount from various possible fields
    const totalAmount = calc.totalAmount || calc.grossPatientFee || calc.totalIncome || 0;
    const gstAmount = calc.gstAmount || calc.bas1A || calc.gstOnCommission || calc.gstOnIncome || 0;
    const netAmount = calc.netAmount || (totalAmount - gstAmount) || 0;
    
    // Map income categories to calculation results
    switch (categoryKey) {
      case 'incomeGstFree':
      case 'otherIncomeGstFree':
        // GST-free income - check if this entry is GST-free
        if (gstAmount === 0 || calc.isGstFree) {
          gross += totalAmount;
          gst += 0; // GST-free
          net += totalAmount;
        }
        break;
        
      case 'incomeGst':
      case 'otherIncomeGst':
        // Income with GST - check if this entry has GST
        if (gstAmount > 0 && !calc.isGstFree) {
          gross += totalAmount;
          gst += gstAmount;
          net += netAmount;
        }
        break;
        
      case 'totalIncome':
        // Total income (all income regardless of GST status)
        gross += totalAmount;
        gst += gstAmount;
        net += netAmount;
        break;
    }
  });

  return { gross, gst, net };
};

/**
 * Calculate BAS amounts for expense entries using dynamic entity configuration
 */
export const calculateExpenseBasAmounts = (expenseEntries, entityId, entityConfig) => {
  let gross = 0, gst = 0, net = 0;

  // Filter expenses that match this specific entity
  const relevantExpenses = expenseEntries.filter(entry => {
    // Check multiple possible ways the entity might be referenced
    return (entry.selectedEntity && entry.selectedEntity.id === entityId) ||
           (entry.entityId === entityId) ||
           (entry.expenseEntityId === entityId);
  });

  relevantExpenses.forEach(entry => {
    const calc = entry.calculations;
    if (!calc) return;
    
    const businessUsePercent = (entityConfig.businessUse || 100) / 100;
    
    // Get amounts from various possible calculation fields
    const entryGross = (calc.totalAmount || calc.grossAmount || calc.amount || 0) * businessUsePercent;
    const entryGst = (calc.gstAmount || calc.gstCredit || calc.gst || 0) * businessUsePercent;
    const entryNet = (calc.netAmount || (entryGross - entryGst) || 0) * businessUsePercent;
    
    gross += entryGross;
    gst += entryGst;
    net += entryNet;
  });

  return { gross, gst, net };
};

/**
 * Generate quarter date range
 */
export const getQuarterDateRange = (quarter, year, financialYearStart = 'July') => {
  let quarterMonths;
  
  if (financialYearStart === 'July') {
    // Australian Financial Year (July-June)
    quarterMonths = {
      Q1: [7, 8, 9],     // July-September
      Q2: [10, 11, 12],  // October-December  
      Q3: [1, 2, 3],     // January-March
      Q4: [4, 5, 6]      // April-June
    };
  } else {
    // Calendar Year (January-December)
    quarterMonths = {
      Q1: [1, 2, 3],     // January-March
      Q2: [4, 5, 6],     // April-June
      Q3: [7, 8, 9],     // July-September
      Q4: [10, 11, 12]   // October-December
    };
  }

  const months = quarterMonths[quarter];
  if (!months) return null;

  // Adjust year for financial year quarters
  let startYear = year;
  let endYear = year;
  
  if (financialYearStart === 'July') {
    if (quarter === 'Q1' || quarter === 'Q2') {
      startYear = year;
      endYear = year;
    } else {
      startYear = year + 1;
      endYear = year + 1;
    }
  }

  const startDate = new Date(startYear, months[0] - 1, 1);
  const endDate = new Date(endYear, months[2], 0); // Last day of the month

  return { startDate, endDate, months };
};

/**
 * Filter entries by date range
 */
export const filterEntriesByDateRange = (entries, startDate, endDate) => {
  return entries.filter(entry => {
    const entryDate = new Date(entry.entryDate);
    return entryDate >= startDate && entryDate <= endDate;
  });
};

/**
 * Calculate GST position
 */
export const calculateGstPosition = (totalIncomeGst, totalExpenseGst) => {
  const netPosition = totalIncomeGst - totalExpenseGst;
  
  return {
    gstPayable: Math.max(0, netPosition),
    gstRefund: Math.max(0, -netPosition),
    netGstPosition: netPosition,
    isPayable: netPosition >= 0
  };
};

/**
 * Format BAS report data for export
 */
export const formatBasReportForExport = (reportData, clinic, quarter, year) => {
  return {
    clinicName: clinic.practiceName,
    abn: clinic.abn || 'Not provided',
    quarter,
    year,
    generatedAt: new Date().toISOString(),
    reportData,
    summary: {
      totalIncome: reportData.totals.totalIncome,
      totalExpenses: reportData.totals.totalExpenses,
      gstPosition: {
        gstPayable: reportData.totals.gstPayable,
        gstRefund: reportData.totals.gstRefund,
        netPosition: reportData.totals.netGstPosition
      }
    }
  };
};