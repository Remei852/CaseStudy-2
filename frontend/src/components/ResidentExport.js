// final export
import React from 'react';
import { Download, Save } from 'lucide-react';
import Papa from 'papaparse';

// Helper function to convert residents data to CSV format
const convertToCSV = (residents) => {
  // Define all fields to include in the export
  const fields = [
    'id', 
    'firstname', 
    'lastname', 
    'birthday', 
    'gender', 
    'age', 
    'address', 
    'email', 
    'pnumber', 
    'civilStatus', 
    'nationality',
    'religion', 
    'houseNumber', 
    'purok', 
    'yearsOfResidency', 
    'voter',
    'employmentStatus', 
    'occupation', 
    'monthlyIncome', 
    'educationLevel',
    'senior',
    'pwd'
  ];
  
  // Use PapaParse to convert the data to CSV
  const csv = Papa.unparse({
    fields: fields,
    data: residents.map(resident => 
      // Create an array for each resident with values for each field
      fields.map(field => resident[field] !== undefined ? resident[field] : '')
    )
  });
  
  return csv;
};

// Export to CSV file function
export const exportToCSV = (residents, filename = 'residents-data') => {
  // Convert data to CSV format
  const csv = convertToCSV(residents);
  
  // Create a Blob containing the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link and trigger the download
  const link = document.createElement('a');
  
  // Create URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  // Append link to document, click it to trigger download, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Backup modal component
const BackupModal = ({ isOpen, onClose, residents, onExport }) => {
  if (!isOpen) return null;
  
  const handleBackup = () => {
    onExport(residents);
    onClose();
  };
  
  return (
    <div className="backup-modal-overlay">
      <div className="backup-modal-card">
        <h3>Backup Resident Data</h3>
        <p>This will export all resident data to a CSV file.</p>
        <p>The file will include all resident information and can be used for backup purposes.</p>
        <div className="backup-modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleBackup} className="confirm-btn">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

// Export button component to add to the UI
const ExportButton = ({ residents, showBackupModal, setShowBackupModal }) => {
  return (
    <>
      <button 
        className="export-data-btn" 
        onClick={() => setShowBackupModal(true)}
        title="Backup/Export Resident Data"
      >
        <Save size={20} />
        <span>Backup Data</span>
      </button>
      
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        residents={residents}
        onExport={exportToCSV}
      />
    </>
  );
};

export default ExportButton;