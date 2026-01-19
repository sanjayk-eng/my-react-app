// Expense report generation utilities for Australian Dental Clinic Expense Management
import { formatCurrency } from './calculations.js';

// Generate HTML report for expense entry
export const generateExpenseReport = (entry, clinic) => {
  const reportDate = new Date().toLocaleDateString('en-AU');
  const entryDate = new Date(entry.entryDate).toLocaleDateString('en-AU');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Report - ${clinic.practiceName}</title>
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
            border-bottom: 2px solid #d32f2f;
            padding-bottom: 20px;
        }
        .clinic-info {
            flex: 1;
        }
        .clinic-logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #d32f2f, #f44336);
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
            color: #d32f2f;
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
            color: #d32f2f;
            margin-bottom: 10px;
        }
        .report-number {
            background: #ffebee;
            padding: 8px 15px;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .report-date {
            color: #666;
        }
        .expense-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .expense-info h3 {
            margin: 0 0 15px 0;
            color: #d32f2f;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .gst-breakdown {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .gst-breakdown h3 {
            margin: 0 0 15px 0;
            color: #d32f2f;
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
            color: #d32f2f;
        }
        .calculation-table .amount {
            text-align: right;
            font-weight: bold;
        }
        .calculation-table .bas-code {
            text-align: center;
            font-family: monospace;
            background: #ffebee;
        }
        .totals-section {
            background: #ffebee;
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
            color: #d32f2f;
        }
        .bas-section {
            background: #fff8e1;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .bas-section h3 {
            margin: 0 0 15px 0;
            color: #d32f2f;
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
        .gst-treatment-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .gst-treatment-info h4 {
            margin: 0 0 10px 0;
            color: #d32f2f;
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
                <div class="report-title">EXPENSE REPORT</div>
                <div class="report-number">Report #${entry.id.substring(0, 8).toUpperCase()}</div>
                <div class="report-date">
                    Generated: ${reportDate}<br>
                    Expense Date: ${entryDate}
                </div>
            </div>
        </div>

        <!-- Expense Information -->
        <div class="expense-info">
            <h3>Expense Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Description:</span>
                    <span class="info-value">${entry.description}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Entity:</span>
                    <span class="info-value">${entry.selectedEntity?.name || 'Unknown Entity'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Head:</span>
                    <span class="info-value">${entry.selectedEntity?.headName || 'Unknown Head'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span class="info-value">${entry.selectedEntity?.type || 'Unknown Type'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Quantity:</span>
                    <span class="info-value">${entry.quantity || 1}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Charge Per Use:</span>
                    <span class="info-value">${entry.selectedEntity?.chargePerUse ? formatCurrency(entry.selectedEntity.chargePerUse) : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Expense Date:</span>
                    <span class="info-value">${entryDate}</span>
                </div>
            </div>
            ${entry.notes ? `
            <div class="info-item" style="margin-top: 15px;">
                <span class="info-label">Notes:</span>
                <span class="info-value">${entry.notes}</span>
            </div>
            ` : ''}
        </div>

        <!-- GST Information -->
        <div class="gst-treatment-info">
            <h4>GST Treatment</h4>
            <p><strong>GST Inclusive (Price includes GST)</strong></p>
            <p>GST Rate: ${entry.gstPercent}%</p>
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
                <tr>
                    <td>Net Amount (Excl. GST)</td>
                    <td class="amount">${formatCurrency(entry.calculations.netAmount || 0)}</td>
                    <td class="bas-code">G11</td>
                </tr>
                <tr>
                    <td>GST Amount (${entry.gstPercent}%)</td>
                    <td class="amount">${formatCurrency(entry.calculations.gstAmount || 0)}</td>
                    <td class="bas-code">-</td>
                </tr>
                <tr>
                    <td>Total Amount (Incl. GST)</td>
                    <td class="amount">${formatCurrency(entry.calculations.totalAmount || 0)}</td>
                    <td class="bas-code">G10</td>
                </tr>
                <tr>
                    <td>GST Credit Available</td>
                    <td class="amount">${formatCurrency(entry.calculations.gstCredit || 0)}</td>
                    <td class="bas-code">1B</td>
                </tr>
            </tbody>
        </table>

        <!-- GST Breakdown -->
        <div class="gst-breakdown">
            <h3>GST Calculation Breakdown</h3>
            <div class="breakdown-step">Amount Entered (GST Inclusive): ${formatCurrency(parseFloat(entry.inputs.amount) || 0)}</div>
            <div class="breakdown-step">GST Component: ${formatCurrency(parseFloat(entry.inputs.amount) || 0)} ÷ 1.${entry.gstPercent/10} × ${entry.gstPercent}% = ${formatCurrency(entry.calculations.gstAmount)}</div>
            <div class="breakdown-step">Net Amount: ${formatCurrency(parseFloat(entry.inputs.amount) || 0)} - ${formatCurrency(entry.calculations.gstAmount)} = ${formatCurrency(entry.calculations.netAmount)}</div>
            <div class="breakdown-step">GST Credit Available: ${formatCurrency(entry.calculations.gstCredit)}</div>
        </div>

        <!-- Totals Section -->
        <div class="totals-section">
            <div class="total-row">
                <span>Net Amount (Excl. GST):</span>
                <span>${formatCurrency(entry.calculations.netAmount || 0)}</span>
            </div>
            <div class="total-row">
                <span>GST Amount:</span>
                <span>${formatCurrency(entry.calculations.gstAmount || 0)}</span>
            </div>
            <div class="total-row">
                <span>GST Credit Available:</span>
                <span>${formatCurrency(entry.calculations.gstCredit || 0)}</span>
            </div>
            <div class="total-row">
                <span>Total Expense Amount:</span>
                <span>${formatCurrency(entry.calculations.totalAmount || 0)}</span>
            </div>
        </div>

        <!-- BAS Codes Section -->
        <div class="bas-section">
            <h3>BAS Codes (Business Activity Statement)</h3>
            <div class="bas-grid">
                <div class="bas-item">
                    <span><strong>G10</strong> - Total Purchases:</span>
                    <span>${formatCurrency(entry.calculations.basG10 || 0)}</span>
                </div>
                <div class="bas-item">
                    <span><strong>G11</strong> - GST-free Purchases:</span>
                    <span>${formatCurrency(entry.calculations.basG11 || 0)}</span>
                </div>
                <div class="bas-item">
                    <span><strong>1B</strong> - GST Credits:</span>
                    <span>${formatCurrency(entry.calculations.bas1B || 0)}</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This report was generated automatically by the Australian Dental Clinic Expense Management System</p>
            <p>Generated on ${new Date().toLocaleString('en-AU')} | Report ID: ${entry.id}</p>
        </div>
    </div>
</body>
</html>`;
};

// Generate summary report for multiple expense entries
export const generateExpenseSummaryReport = (entries, clinic, dateRange = null) => {
  const totalEntries = entries.length;
  const totalExpenses = entries.reduce((sum, entry) => sum + (entry.calculations.totalAmount || 0), 0);
  const totalGSTCredits = entries.reduce((sum, entry) => sum + (entry.calculations.gstCredit || 0), 0);
  const totalNetExpenses = entries.reduce((sum, entry) => sum + (entry.calculations.netAmount || 0), 0);
  
  // Group by entity
  const entityTotals = entries.reduce((acc, entry) => {
    const entityName = entry.selectedEntity?.name || 'Unknown Entity';
    if (!acc[entityName]) {
      acc[entityName] = {
        count: 0,
        totalAmount: 0,
        gstCredit: 0,
        headName: entry.selectedEntity?.headName || 'Unknown Head'
      };
    }
    acc[entityName].count++;
    acc[entityName].totalAmount += entry.calculations.totalAmount || 0;
    acc[entityName].gstCredit += entry.calculations.gstCredit || 0;
    return acc;
  }, {});
  
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
    <title>Expense Summary Report - ${clinic.practiceName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .report-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #d32f2f;
            padding-bottom: 20px;
        }
        .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #d32f2f;
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
            border-left: 4px solid #d32f2f;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #d32f2f;
            font-size: 14px;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .category-breakdown {
            margin-bottom: 30px;
        }
        .category-breakdown h3 {
            color: #d32f2f;
            margin-bottom: 15px;
        }
        .category-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .category-table th,
        .category-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .category-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #d32f2f;
        }
        .category-table .amount {
            text-align: right;
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
            color: #d32f2f;
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
            <div class="report-title">Expense Summary Report</div>
            <div class="date-range">Period: ${dateRangeText}</div>
            <div class="date-range">Generated: ${reportDate}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Entries</h3>
                <div class="value">${totalEntries}</div>
            </div>
            <div class="summary-card">
                <h3>Total Expenses</h3>
                <div class="value">${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="summary-card">
                <h3>Total GST Credits</h3>
                <div class="value">${formatCurrency(totalGSTCredits)}</div>
            </div>
            <div class="summary-card">
                <h3>Net Expenses</h3>
                <div class="value">${formatCurrency(totalNetExpenses)}</div>
            </div>
        </div>

        <div class="category-breakdown">
            <h3>Expenses by Entity</h3>
            <table class="category-table">
                <thead>
                    <tr>
                        <th>Entity</th>
                        <th>Head</th>
                        <th>Count</th>
                        <th>Total Amount</th>
                        <th>GST Credits</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(entityTotals).map(([entityName, data]) => `
                    <tr>
                        <td>${entityName}</td>
                        <td>${data.headName}</td>
                        <td>${data.count}</td>
                        <td class="amount">${formatCurrency(data.totalAmount)}</td>
                        <td class="amount">${formatCurrency(data.gstCredit)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <h3>All Expense Entries</h3>
        <table class="entries-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Entity</th>
                    <th>Head</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>GST Credit</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map(entry => `
                <tr>
                    <td>${new Date(entry.entryDate).toLocaleDateString('en-AU')}</td>
                    <td>${entry.description}</td>
                    <td>${entry.selectedEntity?.name || 'Unknown Entity'}</td>
                    <td>${entry.selectedEntity?.headName || 'Unknown Head'}</td>
                    <td>${entry.quantity || 1}</td>
                    <td class="amount">${formatCurrency(entry.calculations.totalAmount || 0)}</td>
                    <td class="amount">${formatCurrency(entry.calculations.gstCredit || 0)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>This summary report was generated automatically by the Australian Dental Clinic Expense Management System</p>
            <p>Generated on ${new Date().toLocaleString('en-AU')}</p>
        </div>
    </div>
</body>
</html>`;
};

// Open report in new window for printing/saving
export const openReportWindow = (htmlContent, title = 'Expense Report') => {
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(htmlContent);
  reportWindow.document.close();
  reportWindow.document.title = title;
  
  // Auto-focus for printing
  reportWindow.focus();
  
  return reportWindow;
};

// Download report as HTML file
export const downloadReportAsHTML = (htmlContent, filename = 'expense-report.html') => {
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