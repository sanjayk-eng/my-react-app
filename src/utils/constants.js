// Application constants
export const STORAGE_KEYS = {
  HP_USERS: 'hpUsers',
  JWT_TOKEN: 'jwtToken',
  HEALTH_PROFESSIONAL_PROFILE: 'healthProfessionalProfile',
  CLINICS: 'clinics',
  CLINIC_USERS: 'clinicUsers',
  PERMISSIONS: 'permissions',
  EXPENSES_HEADS: 'expensesHeads',
  EXPENSES_ENTITIES: 'expensesEntities',
  INCOME_ENTRIES: 'incomeEntries',
  EXPENSE_ENTRIES: 'expenseEntries',
  BAS_REPORTS: 'basReports',
  APP_SETTINGS: 'appSettings'
};

export const TIMEZONES = [
  { value: 'Sydney', label: 'Sydney (AEST)' },
  { value: 'Melbourne', label: 'Melbourne (AEST)' },
  { value: 'Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Perth', label: 'Perth (AWST)' }
];

export const STATES = [
  { value: 'NSW', label: 'New South Wales (NSW)' },
  { value: 'VIC', label: 'Victoria (VIC)' },
  { value: 'QLD', label: 'Queensland (QLD)' },
  { value: 'WA', label: 'Western Australia (WA)' },
  { value: 'SA', label: 'South Australia (SA)' },
  { value: 'TAS', label: 'Tasmania (TAS)' },
  { value: 'NT', label: 'Northern Territory (NT)' },
  { value: 'ACT', label: 'Australian Capital Territory (ACT)' }
];

export const EXPENSE_TYPES = [
  { value: 'Capital Purchases', label: 'Capital Purchases' },
  { value: 'Non-Capital Purchases', label: 'Non-Capital Purchases' }
];

export const CALCULATION_TYPES = {
  NET_WITHOUT_SUPER: 'net-without-super',
  NET_WITH_SUPER: 'net-with-super',
  GROSS_BASIC: 'gross-basic',
  GROSS_LAB_GST: 'gross-lab-gst',
  GROSS_MERCHANT_BANK: 'gross-merchant-bank',
  GROSS_PATIENT_GST: 'gross-patient-gst',
  GROSS_OUTWORK: 'gross-outwork'
};

export const READ_ONLY_PERMISSIONS = [
  { id: 'viewClinicInfo', label: 'View Clinic Info' },
  { id: 'viewGstMethod', label: 'View GST Method' },
  { id: 'viewLabFeeRule', label: 'View Lab Fee Rule' },
  { id: 'viewIncomeEntries', label: 'See All Income Entry' },
  { id: 'viewExpenseEntries', label: 'See All Expenses Entry' },
  { id: 'viewExpenseHeads', label: 'See All Head in Expense' },
  { id: 'viewBasReport', label: 'See BAS Report' },
  { id: 'exportPdfExcel', label: 'Export PDF and Excel' },
  { id: 'viewIncomeInvoice', label: 'View Income Invoice' },
  { id: 'viewExpenseInvoice', label: 'View Expenses Invoice' }
];

export const EDIT_ONLY_PERMISSIONS = [
  { id: 'editClinicInfo', label: 'Edit Clinic Info' },
  { id: 'editRevenueSplit', label: 'Revenue Split %' },
  { id: 'editLabFeeRule', label: 'Lab Fee Rule' },
  { id: 'crudIncomeEntries', label: 'Income Entries (CRUD)' },
  { id: 'editGstOnIncome', label: 'GST On Income' },
  { id: 'generateIncomeInvoice', label: 'Generate Income Invoice' },
  { id: 'crudExpenseHeads', label: 'Add Expenses Head / Edit' },
  { id: 'crudExpenseEntries', label: 'Expenses Entries (CRUD)' },
  { id: 'editGstOnExpenses', label: 'GST On Expenses' },
  { id: 'uploadExpenseReport', label: 'Upload Expenses Report' },
  { id: 'generateBas', label: 'Generate BAS' },
  { id: 'adjustBasEntry', label: 'Adjust BAS Entry' },
  { id: 'regenerateBas', label: 'Regenerate BAS' },
  { id: 'submitBas', label: 'Submit BAS' }
];