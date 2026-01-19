import { useState } from 'react';
import Button from './Button.jsx';

const ReportHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="report-help">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{ marginBottom: '10px' }}
      >
        📄 Report Help
      </Button>
      
      {isOpen && (
        <div className="help-content">
          <div className="help-section">
            <h4>📊 Report Generation Features</h4>
            <ul>
              <li><strong>Preview Report:</strong> Generate a preview of your report before saving the entry</li>
              <li><strong>Individual Reports:</strong> Generate detailed reports for each income entry</li>
              <li><strong>Summary Reports:</strong> Generate comprehensive reports for all entries</li>
              <li><strong>Download:</strong> Save reports as HTML files for record keeping</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>📋 Report Contents</h4>
            <ul>
              <li>Clinic information with branding</li>
              <li>Dentist information (if available)</li>
              <li>Calculation method details</li>
              <li>Step-by-step formula breakdown</li>
              <li>BAS codes for tax compliance</li>
              <li>Professional formatting for printing</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>🖨️ Using Reports</h4>
            <ul>
              <li><strong>View:</strong> Click "📄 Report" to open in new window</li>
              <li><strong>Print:</strong> Use browser's print function (Ctrl+P)</li>
              <li><strong>Save:</strong> Click "💾 Download" to save as HTML file</li>
              <li><strong>Share:</strong> Email or share the HTML file with accountants</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>🏦 BAS Compliance</h4>
            <p>Reports include Australian BAS codes:</p>
            <ul>
              <li><strong>G1:</strong> Total Income</li>
              <li><strong>G3:</strong> GST-free Sales</li>
              <li><strong>1A:</strong> GST on Sales</li>
              <li><strong>1B:</strong> GST Credits</li>
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .report-help {
          margin-bottom: 20px;
        }
        
        .help-content {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 20px;
          margin-top: 10px;
        }
        
        .help-section {
          margin-bottom: 20px;
        }
        
        .help-section:last-child {
          margin-bottom: 0;
        }
        
        .help-section h4 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .help-section ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .help-section li {
          margin-bottom: 5px;
          color: #495057;
        }
        
        .help-section p {
          margin: 0 0 10px 0;
          color: #6c757d;
        }
        
        .help-section strong {
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
};

export default ReportHelp;