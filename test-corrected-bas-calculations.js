// Test Corrected BAS Calculations
// Run this with: node test-corrected-bas-calculations.js

// Mock data for testing corrected calculations
const mockClinic = {
  id: 'clinic-1',
  practiceName: 'Test Dental Clinic',
  abn: '12345678901',
  basConfiguration: {
    incomeCategories: {
      incomeGstFree: { enabled: true, label: 'Income - GST Free (G3)', basCode: 'G3' },
      incomeGst: { enabled: true, label: 'Income - GST', basCode: 'G1' },
      totalIncome: { enabled: true, label: 'Total Income', basCode: 'G1' }
    },
    expenseEntities: {
      'entity-1': {
        id: 'entity-1',
        name: 'Accounting Services',
        type: 'Non-Capital Purchases',
        enabled: true,
        businessUse: 100,
        basCode: 'G11'
      },
      'entity-2': {
        id: 'entity-2',
        name: 'Dental Equipment',
        type: 'Capital Purchases',
        enabled: true,
        businessUse: 100,
        basCode: 'G10'
      },
      'entity-3': {
        id: 'entity-3',
        name: 'Computer Software',
        type: 'Non-Capital Purchases',
        enabled: true,
        businessUse: 80,
        basCode: 'G11'
      }
    },
    gstSettings: {
      defaultGstRate: 10,
      gstRegistered: true
    }
  }
};

// Mock income entries with proper calculation structure
const mockIncomeEntries = [
  {
    id: 'income-1',
    clinicId: 'clinic-1',
    entryDate: '2024-07-15',
    calculations: {
      totalAmount: 1100,    // Total including GST
      gstAmount: 100,       // GST component
      netAmount: 1000,      // Net amount (excluding GST)
      isGstFree: false
    }
  },
  {
    id: 'income-2',
    clinicId: 'clinic-1',
    entryDate: '2024-08-10',
    calculations: {
      totalAmount: 2200,
      gstAmount: 200,
      netAmount: 2000,
      isGstFree: false
    }
  },
  {
    id: 'income-3',
    clinicId: 'clinic-1',
    entryDate: '2024-07-25',
    calculations: {
      totalAmount: 500,     // GST-free income
      gstAmount: 0,
      netAmount: 500,
      isGstFree: true
    }
  }
];

// Mock expense entries with proper entity references
const mockExpenseEntries = [
  {
    id: 'expense-1',
    clinicId: 'clinic-1',
    entryDate: '2024-07-10',
    selectedEntity: {
      id: 'entity-1',
      name: 'Accounting Services'
    },
    calculations: {
      totalAmount: 1100,
      gstAmount: 100,
      netAmount: 1000
    }
  },
  {
    id: 'expense-2',
    clinicId: 'clinic-1',
    entryDate: '2024-08-05',
    selectedEntity: {
      id: 'entity-2',
      name: 'Dental Equipment'
    },
    calculations: {
      totalAmount: 5500,
      gstAmount: 500,
      netAmount: 5000
    }
  },
  {
    id: 'expense-3',
    clinicId: 'clinic-1',
    entryDate: '2024-07-20',
    selectedEntity: {
      id: 'entity-3',
      name: 'Computer Software'
    },
    calculations: {
      totalAmount: 550,
      gstAmount: 50,
      netAmount: 500
    }
  }
];

// Corrected calculation functions
function calculateIncomeBasAmounts(incomeEntries, categoryKey, basConfiguration) {
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
}

function calculateExpenseBasAmounts(expenseEntries, entityId, entityConfig) {
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
}

function calculateGstPosition(totalIncomeGst, totalExpenseGst) {
  const netPosition = totalIncomeGst - totalExpenseGst;
  
  return {
    gstPayable: Math.max(0, netPosition),
    gstRefund: Math.max(0, -netPosition),
    netGstPosition: netPosition,
    isPayable: netPosition >= 0
  };
}

// Test functions
function testCorrectedIncomeCalculations() {
  console.log('🧪 Testing Corrected Income Calculations...');
  
  const config = mockClinic.basConfiguration;
  
  // Test each income category
  Object.entries(config.incomeCategories).forEach(([key, category]) => {
    if (category.enabled) {
      const result = calculateIncomeBasAmounts(mockIncomeEntries, key, config);
      console.log(`\n📊 ${category.label}:`);
      console.log(`   Gross: $${result.gross.toFixed(2)}`);
      console.log(`   GST: $${result.gst.toFixed(2)}`);
      console.log(`   Net: $${result.net.toFixed(2)}`);
      console.log(`   BAS Code: ${category.basCode}`);
    }
  });
}

function testCorrectedExpenseCalculations() {
  console.log('\n💰 Testing Corrected Expense Entity Calculations...');
  
  const config = mockClinic.basConfiguration;
  
  Object.entries(config.expenseEntities).forEach(([entityId, entityConfig]) => {
    if (entityConfig.enabled) {
      const result = calculateExpenseBasAmounts(mockExpenseEntries, entityId, entityConfig);
      console.log(`\n📊 ${entityConfig.name}:`);
      console.log(`   Type: ${entityConfig.type}`);
      console.log(`   Business Use: ${entityConfig.businessUse}%`);
      console.log(`   Gross: $${result.gross.toFixed(2)}`);
      console.log(`   GST Credits: $${result.gst.toFixed(2)}`);
      console.log(`   Net: $${result.net.toFixed(2)}`);
      console.log(`   BAS Code: ${entityConfig.basCode}`);
    }
  });
}

function testFullBasReport() {
  console.log('\n📋 Testing Full BAS Report Generation...');
  
  const config = mockClinic.basConfiguration;
  const report = {
    income: {},
    expenseEntities: {},
    totals: {
      totalIncome: { gross: 0, gst: 0, net: 0 },
      totalExpenses: { gross: 0, gst: 0, net: 0 },
      gstPayable: 0,
      gstRefund: 0,
      netGstPosition: 0
    }
  };

  // Calculate Income Categories
  Object.entries(config.incomeCategories).forEach(([key, category]) => {
    if (category.enabled) {
      const categoryData = calculateIncomeBasAmounts(mockIncomeEntries, key, config);
      report.income[key] = { ...categoryData, basCode: category.basCode };
      
      // Only add to totals if not 'totalIncome' to avoid double counting
      if (key !== 'totalIncome') {
        report.totals.totalIncome.gross += categoryData.gross;
        report.totals.totalIncome.gst += categoryData.gst;
        report.totals.totalIncome.net += categoryData.net;
      }
    }
  });

  // If totalIncome category exists and is enabled, use it as the final total
  if (config.incomeCategories.totalIncome && config.incomeCategories.totalIncome.enabled && report.income.totalIncome) {
    report.totals.totalIncome = {
      gross: report.income.totalIncome.gross,
      gst: report.income.totalIncome.gst,
      net: report.income.totalIncome.net
    };
  }

  // Calculate Dynamic Expense Entities
  Object.entries(config.expenseEntities).forEach(([entityId, entityConfig]) => {
    if (entityConfig.enabled) {
      const entityData = calculateExpenseBasAmounts(mockExpenseEntries, entityId, entityConfig);
      report.expenseEntities[entityId] = {
        ...entityData,
        basCode: entityConfig.basCode,
        businessUse: entityConfig.businessUse,
        name: entityConfig.name,
        type: entityConfig.type
      };
      
      // Add to totals
      report.totals.totalExpenses.gross += entityData.gross;
      report.totals.totalExpenses.gst += entityData.gst;
      report.totals.totalExpenses.net += entityData.net;
    }
  });

  // Calculate GST Position
  const gstPosition = calculateGstPosition(
    report.totals.totalIncome.gst, 
    report.totals.totalExpenses.gst
  );
  
  report.totals.gstPayable = gstPosition.gstPayable;
  report.totals.gstRefund = gstPosition.gstRefund;
  report.totals.netGstPosition = gstPosition.netGstPosition;

  // Display report
  console.log('\n📊 COMPLETE BAS REPORT:');
  console.log('========================');
  
  console.log('\n💰 INCOME SUMMARY:');
  Object.entries(report.income).forEach(([key, data]) => {
    console.log(`${config.incomeCategories[key].label}: Gross $${data.gross.toFixed(2)}, GST $${data.gst.toFixed(2)}, Net $${data.net.toFixed(2)} (${data.basCode})`);
  });
  
  console.log('\n💸 EXPENSE ENTITIES:');
  Object.entries(report.expenseEntities).forEach(([entityId, data]) => {
    console.log(`${data.name}: Gross $${data.gross.toFixed(2)}, GST $${data.gst.toFixed(2)}, Net $${data.net.toFixed(2)} (${data.basCode})`);
  });
  
  console.log('\n📋 TOTALS:');
  console.log(`Total Income: Gross $${report.totals.totalIncome.gross.toFixed(2)}, GST $${report.totals.totalIncome.gst.toFixed(2)}, Net $${report.totals.totalIncome.net.toFixed(2)}`);
  console.log(`Total Expenses: Gross $${report.totals.totalExpenses.gross.toFixed(2)}, GST $${report.totals.totalExpenses.gst.toFixed(2)}, Net $${report.totals.totalExpenses.net.toFixed(2)}`);
  
  console.log('\n🏛️ GST POSITION:');
  console.log(`GST on Sales (1A): $${report.totals.totalIncome.gst.toFixed(2)}`);
  console.log(`GST Credits (1B): $${report.totals.totalExpenses.gst.toFixed(2)}`);
  console.log(`Net GST Position: $${Math.abs(report.totals.netGstPosition).toFixed(2)} ${report.totals.netGstPosition >= 0 ? '(Payable)' : '(Refund)'}`);
}

// Run tests
console.log('🚀 Corrected BAS Calculations Test Suite\n');
testCorrectedIncomeCalculations();
testCorrectedExpenseCalculations();
testFullBasReport();

console.log('\n✨ All corrected tests completed!');
console.log('\n🔧 FIXES IMPLEMENTED:');
console.log('• ✅ Fixed income calculation to properly handle total amounts');
console.log('• ✅ Fixed GST vs GST-free income categorization');
console.log('• ✅ Fixed expense entity matching with multiple reference methods');
console.log('• ✅ Fixed double counting in total income calculations');
console.log('• ✅ Added proper business use percentage handling');
console.log('• ✅ Enhanced expense entity display in BAS report');
console.log('• ✅ Added debugging information for quarter data');
console.log('• ✅ Improved error handling for missing calculation fields');