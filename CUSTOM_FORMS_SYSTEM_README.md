# Custom Forms System - Health Professional Accounting

## Overview

The Custom Forms System allows health professionals to create multiple custom financial forms with different calculation methods and add corresponding income entries. Each clinic can have multiple forms, and each form can have multiple entries with automatic calculations and BAS mapping.

## Features

### 🏥 Clinic Setup
- Each health professional can add one or more clinics
- Clinic information includes: Practice Name, ABN Number, Address, City, State

### 📋 Custom Financial Forms (Clinic Level)
- **Create/Edit/Delete** custom financial forms
- **Dynamic configuration** based on calculation method
- **Two main calculation methods**: Net Method and Gross Method
- **Form validation** and error handling
- **Data persistence** using localStorage

### 💰 Income Entry Management
- **Add income entries** for each custom form
- **Dynamic input fields** based on form configuration
- **Real-time calculations** with live updates
- **BAS mapping generation** for tax reporting
- **Entry validation** and error handling

### 📊 Reporting & Analytics
- **Summary totals** for all entries per form
- **BAS totals** aggregation
- **Detailed calculations** display
- **Export-ready data** structure

## Calculation Methods

### Net Method

#### A1. Net Method - Without Super Holding
**Configuration:**
- Commission Splitting % (Default: 40%)
- GST on Commission % (Default: 10%)
- Lab Fee Enabled (True/False)

**Input Fields:**
- A = Gross Patient Fee
- B = Lab Fee (if enabled)

**Calculations:**
- Net Patient Fee (C) = A - B
- Commission for Dentist (D) = C × Commission %
- GST on Commission (E) = D × GST %
- Total Commission (F) = D + E

**BAS Mapping:**
- 1A (GST on Sales) = E
- G1 (Total Sales incl GST) = F

#### A2. Net Method - With Super Holding
**Additional Calculations:**
- Commission Component (F) = D ÷ 1.12
- Super Component (E) = F × 12%
- Total for Reconciliation (G) = E + F
- GST on Commission (H) = F × GST %
- Total Payment to Dentist (I) = F + H

**BAS Mapping:**
- 1A (GST on Sales) = H
- G1 (Total Sales incl GST) = I

### Gross Method

#### B1. Gross Method - Standard (Lab Fee Paid by Clinic)
**Configuration:**
- Service & Facility Fee % (Default: 60%)
- GST on Service & Facility Fee % (Default: 10%)
- Lab Fee Enabled (True/False)

**Calculations:**
- Net Patient Fee (C) = A - B
- Service & Facility Fee (D) = C × Service %
- GST on Service Fee (E) = D × GST %
- Total Service Fee (F) = D + E
- Amount Remitted to Dentist (G) = C - F

**BAS Mapping:**
- 1B (GST Credit) = E
- G1 (Total Sales incl GST) = A
- G11 (Clinic Expenses) = B + F

#### B2. Gross Method - With GST on Lab Fee
**Additional Input:**
- GST on Lab Fee

**Modified Calculation:**
- Amount Remitted to Dentist (I) = C - F - GST on Lab Fee

**BAS Mapping:**
- 1B (GST Credit) = E + GST on Lab Fee

#### B3. Gross Method - With Merchant Fee / Bank Fee
**Additional Inputs:**
- Merchant Fee (Inc GST)
- Bank Fee

**Additional Calculations:**
- Merchant Fee GST Component = (Merchant Fee × GST%) / (100 + GST%)
- Net Merchant Fee = Merchant Fee - GST Component

#### B4. Gross Method - GST on Patient Fee + Lab Fee Paid by Dentist
**Configuration:**
- Lab Fee Paid By = Dentist
- GST on Patient Fee Enabled

**Modified Calculations:**
- Patient Fee Excl GST = A - GST on Patient Fee
- Net Patient Fee = Patient Fee Excl GST - Lab Fee
- Amount Remitted = Net Patient Fee - Total Service Fee + Lab Fee + GST on Patient Fee

#### B5. Gross Method - Outwork Charge Rate
**Configuration:**
- Outwork Charge Rate % (Default: 40%)
- Various outwork options (Merchant Fee, GST on Merchant Fee, GST on Lab Fee)

**Calculations:**
- Total Outwork Charge = Lab Fee + Merchant Fee + GST on Lab Fee + GST on Merchant Fee
- Lab & Other Cost Charge = Total Outwork Charge × Outwork %
- Total Service Fee + Other Charges = Service Fee + Lab & Other Cost Charge

## System Architecture

### Components Structure
```
src/
├── components/
│   └── forms/
│       ├── CustomFormManager.jsx      # Main container component
│       ├── CustomFormBuilder.jsx      # Form creation/editing
│       ├── CustomFormList.jsx         # Forms listing and management
│       ├── IncomeEntryForm.jsx        # Entry creation (existing, enhanced)
│       └── IncomeEntryList.jsx        # Entries listing and management
├── pages/
│   └── clinics/
│       └── CustomFormsPage.jsx        # Page wrapper
└── styles/
    └── CustomFormManager.css          # Complete styling
```

### Data Flow
1. **Clinic Selection** → Load clinic-specific forms
2. **Form Creation** → Configure calculation method and parameters
3. **Entry Creation** → Dynamic fields based on form configuration
4. **Real-time Calculations** → Automatic computation and BAS mapping
5. **Data Persistence** → localStorage with clinic isolation

### Navigation Structure
```
/clinics/:id/custom-forms
├── Custom Forms List
├── Create/Edit Form
├── Form Entries List
└── Create Entry
```

## Usage Instructions

### 1. Setup
1. Navigate to `/clinics/:id/custom-forms`
2. Ensure you have a clinic created and selected

### 2. Create Custom Forms
1. Click "Create New Form"
2. Enter form name
3. Select calculation method (Net or Gross)
4. Configure method-specific parameters
5. Save the form

### 3. Add Income Entries
1. Select a form from the list
2. Click "View Entries"
3. Click "Add Entry"
4. Fill in the dynamic input fields
5. Review calculations and BAS mapping
6. Save the entry

### 4. View Reports
1. Navigate to entries list for any form
2. View summary totals
3. Review BAS totals
4. Expand individual entries for details

## Data Storage

### LocalStorage Keys
- `customForms_{clinicId}` - Array of custom forms
- `incomeEntries_{clinicId}` - Array of income entries
- `clinics` - Array of all clinics
- `currentUser` - Current user information

### Data Structure Examples

#### Custom Form
```javascript
{
  id: "form-001",
  formName: "Standard Commission Form",
  calculationMethod: "net", // "net" or "gross"
  clinicId: "clinic-001",
  netMethod: {
    superHolding: "without", // "with" or "without"
    commissionSplitting: 40,
    gstOnCommission: 10,
    labFeeEnabled: true
  },
  grossMethod: {
    serviceFacilityFeePercent: 60,
    gstOnServiceFacilityFee: 10,
    labFeeEnabled: true,
    labFeePaidBy: "clinic", // "clinic" or "dentist"
    // ... other gross method options
  },
  createdAt: "2024-01-20T10:00:00.000Z",
  updatedAt: "2024-01-20T10:00:00.000Z"
}
```

#### Income Entry
```javascript
{
  id: "entry-001",
  customFormId: "form-001",
  clinicId: "clinic-001",
  grossPatientFee: "2500.00",
  labFee: "200.00",
  // ... other input fields based on form config
  calculations: {
    netPatientFee: 2300,
    commissionForDentist: 920,
    gstOnCommission: 92,
    totalCommission: 1012
  },
  basMapping: {
    "1A_GstOnSales": 92,
    "G1_TotalSalesWithGst": 1012
  },
  createdAt: "2024-01-20T10:00:00.000Z"
}
```

## Testing

### Demo Data Setup
Run the demo data setup to populate the system with sample data:

```javascript
// In browser console or React app
setupDemoData();
```

### Test Cases Covered
- ✅ All 6 calculation method variations
- ✅ Form CRUD operations
- ✅ Entry CRUD operations
- ✅ Real-time calculations
- ✅ BAS mapping generation
- ✅ Data persistence
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling

### Sample Test Data
- 4 different custom forms
- 8 income entries across all forms
- Total gross revenue: $24,700
- Complete calculation verification

## API Integration (Future)

The system is designed to easily integrate with a backend API:

```javascript
// Replace localStorage calls with API calls
const saveCustomForm = async (formData) => {
  const response = await fetch('/api/custom-forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return response.json();
};
```

## Responsive Design

- **Mobile-first** approach
- **Flexible grid** layouts
- **Touch-friendly** interactions
- **Collapsible** sections for mobile
- **Optimized** for tablets and desktops

## Security Considerations

- **Client-side validation** with server-side verification (when API integrated)
- **Data sanitization** for all inputs
- **Clinic-level data isolation**
- **User authentication** required
- **Input validation** for financial calculations

## Performance Optimizations

- **Lazy loading** of components
- **Memoized calculations** to prevent unnecessary re-renders
- **Efficient data structures** for fast lookups
- **Minimal re-renders** with proper state management
- **Optimized CSS** with minimal bundle size

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Troubleshooting

### Common Issues

1. **Forms not loading**
   - Check if clinic is selected
   - Verify localStorage data
   - Check browser console for errors

2. **Calculations not updating**
   - Ensure all required fields are filled
   - Check form configuration
   - Verify calculation method selection

3. **Data not persisting**
   - Check localStorage permissions
   - Verify clinic ID consistency
   - Clear browser cache if needed

### Debug Mode
Enable debug logging by adding to localStorage:
```javascript
localStorage.setItem('debug', 'true');
```

## Future Enhancements

- [ ] **Export to Excel/PDF** functionality
- [ ] **Advanced reporting** with charts
- [ ] **Bulk entry import** from CSV
- [ ] **Form templates** and sharing
- [ ] **Audit trail** for all changes
- [ ] **Advanced BAS integration** with ATO
- [ ] **Multi-currency** support
- [ ] **Automated backups** and sync
- [ ] **Role-based permissions**
- [ ] **API integration** with accounting software

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version:** 1.0.0  
**Last Updated:** January 20, 2026  
**Author:** Health Professional Accounting System Team