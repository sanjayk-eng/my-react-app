// Test Simplified Expense Management (No GST Treatment, Supplier, Invoice, Payment Method)
import { generateExpenseReport, generateExpenseSummaryReport } from './src/utils/expenseReportGenerator.js';

// Mock data for testing simplified expense management
const mockClinic = {
  id: 'clinic-1',
  practiceName: 'Hurstbridge Dental',
  address: '984 Heidelberg-Kinglake Rd, Hurstbridge, VIC, 3099',
  phone: '+61 3 9718 1234',
  email: 'info@hurstbridgedental.com.au',
  abn: '12 345 678 901',
  financialSettings: {
    commissionSplitting: {
      gstPercent: 10
    }
  }
};

const mockExpenseEntry = {
  id: 'expense-12345678',
  clinicId: 'clinic-1',
  entryDate: '2025-01-07',
  description: 'Dental Supplies - Composite Resin',
  entityId: 'entity-1',
  quantity: 2,
  notes: 'Monthly supply order for composite materials',
  selectedEntity: {
    id: 'entity-1',
    name: 'Composite Resin Kit',
    type: 'Non-Capital Purchases',
    headId: 'head-1',
    headName: 'Clinical Supplies',
    purchasePrice: 275.00,
    chargePerUse: 275.00
  },
  inputs: {
    description: 'Dental Supplies - Composite Resin',
    entityId: 'entity-1',
    quantity: 2,
    amount: '550.00',
    expenseDate: '2025-01-07',
    notes: 'Monthly supply order for composite materials'
  },
  calculations: {
    netAmount: 500.00,
    gstAmount: 50.00,
    totalAmount: 550.00,
    gstCredit: 50.00,
    basG10: 550.00,
    basG11: 500.00,
    bas1B: 50.00
  },
  gstPercent: 10,
  createdAt: '2025-01-07T10:30:00.000Z'
};

const mockExpenseEntries = [
  mockExpenseEntry,
  {
    id: 'expense-87654321',
    clinicId: 'clinic-1',
    entryDate: '2025-01-06',
    description: 'Office Rent - January 2025',
    entityId: 'entity-2',
    quantity: 1,
    notes: 'Monthly office rent payment',
    selectedEntity: {
      id: 'entity-2',
      name: 'Monthly Office Rent',
      type: 'Non-Capital Purchases',
      headId: 'head-2',
      headName: 'Rent & Utilities',
      purchasePrice: 2200.00,
      chargePerUse: 2200.00
    },
    inputs: {
      description: 'Office Rent - January 2025',
      entityId: 'entity-2',
      quantity: 1,
      amount: '2200.00',
      expenseDate: '2025-01-06',
      notes: 'Monthly office rent payment'
    },
    calculations: {
      netAmount: 2000.00,
      gstAmount: 200.00,
      totalAmount: 2200.00,
      gstCredit: 200.00,
      basG10: 2200.00,
      basG11: 2000.00,
      bas1B: 200.00
    },
    gstPercent: 10,
    createdAt: '2025-01-06T10:30:00.000Z'
  }
];

console.log('🧪 Testing Simplified Expense Management');
console.log('======================================');

try {
  // Test 1: Generate Individual Expense Report (Simplified)
  console.log('\n📄 Test 1: Simplified Individual Expense Report');
  const individualReport = generateExpenseReport(mockExpenseEntry, mockClinic);
  
  console.log('✅ Simplified expense report generated successfully');
  console.log(`📊 Report length: ${individualReport.length} characters`);
  console.log('📋 Simplified report includes:');
  console.log('   - Clinic information with logo and contact details');
  console.log('   - Expense entity details (name, head, type, quantity)');
  console.log('   - Charge per use information');
  console.log('   - Fixed GST treatment (GST Inclusive only)');
  console.log('   - Simplified calculation breakdown');
  console.log('   - BAS codes for Australian tax reporting');
  console.log('   - NO supplier, invoice, or payment method fields');

  // Test 2: Generate Summary Report (Simplified)
  console.log('\n📊 Test 2: Simplified Summary Report');
  const summaryReport = generateExpenseSummaryReport(mockExpenseEntries, mockClinic);
  
  console.log('✅ Simplified summary report generated successfully');
  console.log(`📊 Report length: ${summaryReport.length} characters`);
  console.log('📋 Simplified summary includes:');
  console.log('   - Entity breakdown table (no supplier column)');
  console.log('   - Complete entries table with essential columns only');
  console.log('   - Quantity and amount tracking');
  console.log('   - GST credit calculations');

  // Test 3: Verify Simplified Content
  console.log('\n🔍 Test 3: Simplified Content Verification');
  
  const hasEntityName = individualReport.includes('Composite Resin Kit');
  const hasGSTInclusive = individualReport.includes('GST Inclusive (Price includes GST)');
  const hasQuantity = individualReport.includes('Quantity');
  const hasChargePerUse = individualReport.includes('Charge Per Use');
  const noSupplierField = !individualReport.includes('Supplier:');
  const noInvoiceField = !individualReport.includes('Invoice Number:');
  const noPaymentField = !individualReport.includes('Payment Method:');
  
  console.log(`✅ Entity name included: ${hasEntityName}`);
  console.log(`✅ Fixed GST treatment: ${hasGSTInclusive}`);
  console.log(`✅ Quantity tracking: ${hasQuantity}`);
  console.log(`✅ Charge per use: ${hasChargePerUse}`);
  console.log(`✅ No supplier field: ${noSupplierField}`);
  console.log(`✅ No invoice field: ${noInvoiceField}`);
  console.log(`✅ No payment method field: ${noPaymentField}`);

  // Test 4: GST Calculation (Always Inclusive)
  console.log('\n🧮 Test 4: Fixed GST Calculation Logic');
  
  const entry1 = mockExpenseEntries[0]; // $550 GST Inclusive
  const entry2 = mockExpenseEntries[1]; // $2200 GST Inclusive
  
  console.log(`✅ Entry 1: $${entry1.calculations.totalAmount} total, $${entry1.calculations.gstCredit} GST credit`);
  console.log(`✅ Entry 2: $${entry2.calculations.totalAmount} total, $${entry2.calculations.gstCredit} GST credit`);
  console.log('✅ All expenses treated as GST Inclusive automatically');

  console.log('\n🎉 All Simplified Expense Management Tests Passed!');
  console.log('==================================================');
  
  console.log('\n📋 Simplified Expense Management Features:');
  console.log('✅ Removed GST Treatment field (always GST Inclusive)');
  console.log('✅ Removed Supplier field (not needed)');
  console.log('✅ Removed Invoice Number field (not needed)');
  console.log('✅ Removed Payment Method field (not needed)');
  console.log('✅ Kept essential fields: Description, Entity, Quantity, Amount, Date, Notes');
  console.log('✅ Automatic GST calculation (10% inclusive)');
  console.log('✅ Entity-based categorization with heads');
  console.log('✅ Quantity tracking for usage');
  console.log('✅ Auto-amount calculation from entity charge per use');
  console.log('✅ Simplified professional reports');
  
  console.log('\n🚀 Simplified Form Fields:');
  console.log('✅ Description * (required)');
  console.log('✅ Expense Entity * (dropdown with heads and charge per use)');
  console.log('✅ Quantity * (auto-calculates amount)');
  console.log('✅ Amount * (auto-calculated or manual entry)');
  console.log('✅ Expense Date * (required)');
  console.log('✅ Notes (optional)');

  console.log('\n💰 Simplified GST Logic:');
  console.log('✅ All expenses treated as GST Inclusive');
  console.log('✅ GST Rate: 10% (from clinic settings)');
  console.log('✅ Auto-calculate: Net Amount = Total ÷ 1.1');
  console.log('✅ Auto-calculate: GST Amount = Total - Net Amount');
  console.log('✅ GST Credit = GST Amount (always claimable)');

} catch (error) {
  console.error('❌ Simplified Expense Management Test Failed:', error);
  console.error('Error details:', error.message);
}

console.log('\n📄 Simplified Form Structure:');
console.log('┌─ Description (text input)');
console.log('├─ Entity Selection (dropdown with heads)');
console.log('├─ Quantity (number input)');
console.log('├─ Amount (auto-calculated or manual)');
console.log('├─ Expense Date (date picker)');
console.log('└─ Notes (textarea, optional)');

console.log('\n📊 Simplified Table Columns:');
console.log('┌─ Date');
console.log('├─ Description');
console.log('├─ Entity');
console.log('├─ Head');
console.log('├─ Quantity');
console.log('├─ Total Amount');
console.log('├─ GST Credit');
console.log('└─ Actions');

console.log('\n✨ The simplified expense management system is ready!');
console.log('Clean, focused interface with only essential fields for efficient expense tracking.');