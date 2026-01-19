// Report generation utilities for Australian Dental Clinic Income Management
import { formatCurrency } from './calculations.js';

// Method labels for reports
const METHOD_LABELS = {
  'net-without-super': 'Net Method - Without Super Holding (Independent Contractor)',
  'net-with-super': 'Net Method - With Super Holding (Independent Contractor)',
  'gross-basic': 'Gross Method - Service & Facility Fee with GST',
  'gross-lab-gst': 'Gross Method - S&F Fee with GST on Lab Fee Charged by Clinic',
  'gross-merchant-bank': 'Gross Method - S&F Fee with Merchant/Bank Fee Charged to Dentist',
  'gross-patient-gst': 'Gross Method - S&F Fee with GST on Lab Fee Paid by Dentist + GST on Patient Fee',
  'gross-outwork': 'Gross Method - Service & Facility with Outwork Charge Rate'
};

// Generate HTML report for income entry
export const generateIncomeReport = (entry, clinic, dentist = null) => {
  const reportDate = new Date().toLocaleDateString('en-AU');
  const entryDate = new Date(entry.entryDate).toLocaleDateString('en-AU');
  const isNetMethod = entry.method.includes('net');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Income Report - ${clinic.practiceName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5530;
            padding-bottom: 20px;
        }
        .clinic-info {
            flex: 1;
        }
        .clinic-logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #2c5530, #4a7c59);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 5px;
        }
        .clinic-address {
            color: #666;
            line-height: 1.4;
        }
        .report-info {
            text-align: right;
            flex: 1;
        }
        .report-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 10px;
        }
        .report-number {
            background: #f0f8f0;
            padding: 8px 15px;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .report-date {
            color: #666;
        }
        .dentist-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .dentist-info h3 {
            margin: 0 0 10px 0;
            color: #2c5530;
        }
        .method-info {
            background: #e8f4e8;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .method-info h3 {
            margin: 0 0 10px 0;
            color: #2c5530;
        }
        .calculation-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .calculation-table th,
        .calculation-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .calculation-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c5530;
        }
        .calculation-table .amount {
            text-align: right;
            font-weight: bold;
        }
        .calculation-table .bas-code {
            text-align: center;
            font-family: monospace;
            background: #f0f8f0;
        }
        .totals-section {
            background: #f0f8f0;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .total-row:last-child {
            border-bottom: none;
            font-size: 18px;
            font-weight: bold;
            color: #2c5530;
        }
        .bas-section {
            background: #fff8e1;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .bas-section h3 {
            margin: 0 0 15px 0;
            color: #2c5530;
        }
        .bas-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .bas-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 4px solid #ff9800;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .formula-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .formula-section h3 {
            margin: 0 0 15px 0;
            color: #2c5530;
        }
        .formula-step {
            padding: 8px 0;
            font-family: monospace;
            color: #444;
        }
        @media print {
            body { background: white; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header Section -->
        <div class="header">
            <div class="clinic-info">
                <div class="clinic-logo">
                    ${clinic.practiceName.substring(0, 2).toUpperCase()}
                </div>
                <div class="clinic-name">${clinic.practiceName}</div>
                <div class="clinic-address">
                    ${clinic.address || 'Address not provided'}<br>
                    ${clinic.phone ? `Phone: ${clinic.phone}` : ''}<br>
                    ${clinic.email ? `Email: ${clinic.email}` : ''}<br>
                    ${clinic.abn ? `ABN: ${clinic.abn}` : ''}
                </div>
            </div>
            <div class="report-info">
                <div class="report-title">INCOME CALCULATION REPORT</div>
                <div class="report-number">Report #${entry.id.substring(0, 8).toUpperCase()}</div>
                <div class="report-date">
                    Generated: ${reportDate}<br>
                    Entry Date: ${entryDate}
                </div>
            </div>
        </div>

        <!-- Dentist Information -->
        ${dentist ? `
        <div class="dentist-info">
            <h3>Dentist Information</h3>
            <strong>${dentist.name || 'Dentist Name'}</strong><br>
            ${dentist.email || 'Email not provided'}<br>
            ${dentist.phone || 'Phone not provided'}<br>
            Registration: ${dentist.registrationNumber || 'Not provided'}
        </div>
        ` : ''}

        <!-- Method Information -->
        <div class="method-info">
            <h3>Calculation Method</h3>
            <strong>${METHOD_LABELS[entry.method] || entry.method}</strong><br>
            Type: ${isNetMethod ? 'Net Method (Independent Contractor)' : 'Gross Method (Service & Facility Agreement)'}<br>
            Commission Rate: ${entry.commissionPercent}% | GST Rate: ${entry.gstPercent}%
        </div>

        <!-- Calculation Details -->
        <table class="calculation-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>BAS Code</th>
                </tr>
            </thead>
            <tbody>
                ${generateCalculationRows(entry)}
            </tbody>
        </table>

        <!-- Formula Steps -->
        <div class="formula-section">
            <h3>Calculation Formula</h3>
            ${generateFormulaSteps(entry)}
        </div>

        <!-- Totals Section -->
        <div class="totals-section">
            <div class="total-row">
                <span>Net Patient Fee:</span>
                <span>${formatCurrency(entry.calculations.netPatientFee || 0)}</span>
            </div>
            ${isNetMethod ? `
            <div class="total-row">
                <span>Dentist Commission:</span>
                <span>${formatCurrency(entry.calculations.dentistCommission || 0)}</span>
            </div>
            <div class="total-row">
                <span>GST on Commission:</span>
                <span>${formatCurrency(entry.calculations.gstOnCommission || 0)}</span>
            </div>
            ${entry.calculations.superComponent ? `
            <div class="total-row">
                <span>Super Component (Paid by Clinic):</span>
                <span>${formatCurrency(entry.calculations.superComponent)}</span>
            </div>
            ` : ''}
            ` : `
            <div class="total-row">
                <span>Service & Facility Fee:</span>
                <span>${formatCurrency(entry.calculations.serviceFacilityFee || 0)}</span>
            </div>
            <div class="total-row">
                <span>GST on Service & Facility:</span>
                <span>${formatCurrency(entry.calculations.gstServiceFacilityFee || 0)}</span>
            </div>
            `}
            <div class="total-row">
                <span>BAS Refund:</span>
                <span>${formatCurrency(entry.basRefund || 0)}</span>
            </div>
            <div class="total-row">
                <span>${isNetMethod ? 'Total Commission Payable:' : 'Amount Remitted to Dentist:'}</span>
                <span>${formatCurrency(entry.dentistPayable || 0)}</span>
            </div>
        </div>

        <!-- BAS Codes Section -->
        <div class="bas-section">
            <h3>BAS Codes (Business Activity Statement)</h3>
            <div class="bas-grid">
                <div class="bas-item">
                    <span><strong>G1</strong> - Total Income:</span>
                    <span>${formatCurrency(entry.calculations.basG1 || 0)}</span>
                </div>
                <div class="bas-item">
                    <span><strong>G3</strong> - GST-free Sales:</span>
                    <span>${formatCurrency(entry.calculations.basG3 || 0)}</span>
                </div>
                <div class="bas-item">
                    <span><strong>1A</strong> - GST on Sales:</span>
                    <span>${formatCurrency(entry.calculations.bas1A || 0)}</span>
                </div>
                <div class="bas-item">
                    <span><strong>1B</strong> - GST Credits:</span>
                    <span>${formatCurrency(entry.calculations.bas1B || 0)}</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This report was generated automatically by the Australian Dental Clinic Income Management System</p>
            <p>Generated on ${new Date().toLocaleString('en-AU')} | Report ID: ${entry.id}</p>
        </div>
    </div>
</body>
</html>`;
};

// Generate calculation rows for the table
const generateCalculationRows = (entry) => {
  const { inputs, calculations } = entry;
  const isNetMethod = entry.method.includes('net');
  
  let rows = [];
  
  // Common rows
  rows.push(`
    <tr>
      <td>Gross Patient Fee</td>
      <td class="amount">${formatCurrency(inputs.grossPatientFee || 0)}</td>
      <td class="bas-code">G1</td>
    </tr>
  `);
  
  if (inputs.labFee) {
    rows.push(`
      <tr>
        <td>Lab Fee</td>
        <td class="amount">${formatCurrency(inputs.labFee)}</td>
        <td class="bas-code">-</td>
      </tr>
    `);
  }
  
  rows.push(`
    <tr>
      <td>Net Patient Fee (GST-free)</td>
      <td class="amount">${formatCurrency(calculations.netPatientFee || 0)}</td>
      <td class="bas-code">G3</td>
    </tr>
  `);
  
  // Method-specific rows
  if (isNetMethod) {
    rows.push(`
      <tr>
        <td>Dentist Commission (${entry.commissionPercent}%)</td>
        <td class="amount">${formatCurrency(calculations.dentistCommission || 0)}</td>
        <td class="bas-code">-</td>
      </tr>
    `);
    
    rows.push(`
      <tr>
        <td>GST on Commission (${entry.gstPercent}%)</td>
        <td class="amount">${formatCurrency(calculations.gstOnCommission || 0)}</td>
        <td class="bas-code">1A</td>
      </tr>
    `);
    
    if (calculations.superComponent) {
      rows.push(`
        <tr>
          <td>Super Component (12% - Paid by Clinic)</td>
          <td class="amount">${formatCurrency(calculations.superComponent)}</td>
          <td class="bas-code">-</td>
        </tr>
      `);
    }
  } else {
    rows.push(`
      <tr>
        <td>Service & Facility Fee (${entry.serviceFacilityPercent || 60}%)</td>
        <td class="amount">${formatCurrency(calculations.serviceFacilityFee || 0)}</td>
        <td class="bas-code">-</td>
      </tr>
    `);
    
    rows.push(`
      <tr>
        <td>GST on Service & Facility Fee</td>
        <td class="amount">${formatCurrency(calculations.gstServiceFacilityFee || 0)}</td>
        <td class="bas-code">1B</td>
      </tr>
    `);
  }
  
  // Additional method-specific fields
  if (inputs.merchantFeeWithGst) {
    rows.push(`
      <tr>
        <td>Merchant Fee (with GST)</td>
        <td class="amount">${formatCurrency(inputs.merchantFeeWithGst)}</td>
        <td class="bas-code">-</td>
      </tr>
    `);
  }
  
  if (inputs.bankFee) {
    rows.push(`
      <tr>
        <td>Bank Fee</td>
        <td class="amount">${formatCurrency(inputs.bankFee)}</td>
        <td class="bas-code">-</td>
      </tr>
    `);
  }
  
  if (inputs.gstOnPatientFee) {
    rows.push(`
      <tr>
        <td>GST on Patient Fee</td>
        <td class="amount">${formatCurrency(inputs.gstOnPatientFee)}</td>
        <td class="bas-code">1A</td>
      </tr>
    `);
  }
  
  return rows.join('');
};

// Generate formula steps
const generateFormulaSteps = (entry) => {
  const { calculations, commissionPercent, gstPercent, serviceFacilityPercent } = entry;
  
  switch (entry.method) {
    case 'net-without-super':
      return `
        <div class="formula-step">A = ${formatCurrency(calculations.A)} (Gross Patient Fee)</div>
        <div class="formula-step">B = ${formatCurrency(calculations.B)} (Lab Fee)</div>
        <div class="formula-step">C = A - B = ${formatCurrency(calculations.C)} (Net Patient Fee)</div>
        <div class="formula-step">D = C × ${commissionPercent}% = ${formatCurrency(calculations.D)} (Dentist Commission)</div>
        <div class="formula-step">E = D × ${gstPercent}% = ${formatCurrency(calculations.E)} (GST on Commission)</div>
        <div class="formula-step">F = D + E = ${formatCurrency(calculations.F)} (Total Commission Payable)</div>
      `;
    
    case 'net-with-super':
      return `
        <div class="formula-step">A = ${formatCurrency(calculations.A)} (Gross Patient Fee)</div>
        <div class="formula-step">B = ${formatCurrency(calculations.B)} (Lab Fee)</div>
        <div class="formula-step">C = A - B = ${formatCurrency(calculations.C)} (Net Patient Fee)</div>
        <div class="formula-step">D = C × ${commissionPercent}% = ${formatCurrency(calculations.D)} (Dentist Commission)</div>
        <div class="formula-step">F = D ÷ 1.12 = ${formatCurrency(calculations.F)} (Commission Component)</div>
        <div class="formula-step">E = F × 12% = ${formatCurrency(calculations.E)} (Super Component)</div>
        <div class="formula-step">G = F × ${gstPercent}% = ${formatCurrency(calculations.G)} (GST on Commission)</div>
        <div class="formula-step">H = F + G = ${formatCurrency(calculations.H)} (Total Received by Dentist)</div>
      `;
    
    case 'gross-basic':
      return `
        <div class="formula-step">A = ${formatCurrency(calculations.A)} (Gross Patient Fee)</div>
        <div class="formula-step">B = ${formatCurrency(calculations.B)} (Lab Fee)</div>
        <div class="formula-step">C = A - B = ${formatCurrency(calculations.C)} (Net Patient Fee)</div>
        <div class="formula-step">D = C × ${serviceFacilityPercent || 60}% = ${formatCurrency(calculations.D)} (Service & Facility Fee)</div>
        <div class="formula-step">E = D × ${gstPercent}% = ${formatCurrency(calculations.E)} (GST Service & Facility Fee)</div>
        <div class="formula-step">F = D + E = ${formatCurrency(calculations.F)} (Total Service & Facility Fee)</div>
        <div class="formula-step">G = C - F = ${formatCurrency(calculations.G)} (Amount Remitted to Dentist)</div>
      `;
    
    default:
      return `<div class="formula-step">Calculation completed using ${METHOD_LABELS[entry.method] || entry.method}</div>`;
  }
};

// Generate PDF-ready report (for future PDF implementation)
export const generatePDFReport = async (entry, clinic, dentist = null) => {
  // This would integrate with a PDF library like jsPDF or Puppeteer
  // For now, return the HTML that can be printed or converted to PDF
  return generateIncomeReport(entry, clinic, dentist);
};

// Generate summary report for multiple entries
export const generateSummaryReport = (entries, clinic, dateRange = null) => {
  const totalEntries = entries.length;
  const totalGrossIncome = entries.reduce((sum, entry) => sum + (parseFloat(entry.inputs.grossPatientFee) || 0), 0);
  const totalDentistPayable = entries.reduce((sum, entry) => sum + (entry.dentistPayable || 0), 0);
  const totalBasRefund = entries.reduce((sum, entry) => sum + (entry.basRefund || 0), 0);
  
  const reportDate = new Date().toLocaleDateString('en-AU');
  const dateRangeText = dateRange ? 
    `${new Date(dateRange.start).toLocaleDateString('en-AU')} - ${new Date(dateRange.end).toLocaleDateString('en-AU')}` : 
    'All Time';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Income Summary Report - ${clinic.practiceName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .report-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5530;
            padding-bottom: 20px;
        }
        .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 20px;
            color: #666;
            margin-bottom: 10px;
        }
        .date-range {
            font-size: 16px;
            color: #888;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #2c5530;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #2c5530;
            font-size: 14px;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .entries-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .entries-table th,
        .entries-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .entries-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c5530;
        }
        .entries-table .amount {
            text-align: right;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="clinic-name">${clinic.practiceName}</div>
            <div class="report-title">Income Summary Report</div>
            <div class="date-range">Period: ${dateRangeText}</div>
            <div class="date-range">Generated: ${reportDate}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Entries</h3>
                <div class="value">${totalEntries}</div>
            </div>
            <div class="summary-card">
                <h3>Total Gross Income</h3>
                <div class="value">${formatCurrency(totalGrossIncome)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Dentist Payable</h3>
                <div class="value">${formatCurrency(totalDentistPayable)}</div>
            </div>
            <div class="summary-card">
                <h3>Total BAS Refund</h3>
                <div class="value">${formatCurrency(totalBasRefund)}</div>
            </div>
        </div>

        <table class="entries-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Gross Patient Fee</th>
                    <th>Lab Fee</th>
                    <th>Dentist Payable</th>
                    <th>BAS Refund</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map(entry => `
                <tr>
                    <td>${new Date(entry.entryDate).toLocaleDateString('en-AU')}</td>
                    <td>${METHOD_LABELS[entry.method] || entry.method}</td>
                    <td class="amount">${formatCurrency(entry.inputs.grossPatientFee || 0)}</td>
                    <td class="amount">${formatCurrency(entry.inputs.labFee || 0)}</td>
                    <td class="amount">${formatCurrency(entry.dentistPayable || 0)}</td>
                    <td class="amount">${formatCurrency(entry.basRefund || 0)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>This summary report was generated automatically by the Australian Dental Clinic Income Management System</p>
            <p>Generated on ${new Date().toLocaleString('en-AU')}</p>
        </div>
    </div>
</body>
</html>`;
};

// Open report in new window for printing/saving
export const openReportWindow = (htmlContent, title = 'Income Report') => {
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(htmlContent);
  reportWindow.document.close();
  reportWindow.document.title = title;
  
  // Auto-focus for printing
  reportWindow.focus();
  
  return reportWindow;
};

// Download report as HTML file
export const downloadReportAsHTML = (htmlContent, filename = 'income-report.html') => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};