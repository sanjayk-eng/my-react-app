import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import CustomFormBuilder from './CustomFormBuilder.jsx';
import CustomFormList from './CustomFormList.jsx';
import IncomeEntryForm from './IncomeEntryForm.jsx';
import IncomeEntryList from './IncomeEntryList.jsx';

const CustomFormManager = ({ clinic }) => {
  const [customForms, setCustomForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [currentView, setCurrentView] = useState('forms'); // 'forms', 'create-form', 'entries', 'create-entry'
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [editingForm, setEditingForm] = useState(null);

  useEffect(() => {
    loadCustomForms();
    loadIncomeEntries();
  }, [clinic?.id]);

  const loadCustomForms = () => {
    // Load custom forms from localStorage or API
    const storageKey = `customForms_${clinic?.id}`;
    const savedForms = localStorage.getItem(storageKey);
    if (savedForms) {
      setCustomForms(JSON.parse(savedForms));
    }
  };

  const loadIncomeEntries = () => {
    // Load income entries from localStorage or API
    const storageKey = `incomeEntries_${clinic?.id}`;
    const savedEntries = localStorage.getItem(storageKey);
    if (savedEntries) {
      setIncomeEntries(JSON.parse(savedEntries));
    }
  };

  const saveCustomForm = (formData) => {
    const newForm = {
      id: editingForm?.id || Date.now().toString(),
      ...formData,
      clinicId: clinic.id,
      createdAt: editingForm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedForms;
    if (editingForm) {
      updatedForms = customForms.map(form => 
        form.id === editingForm.id ? newForm : form
      );
    } else {
      updatedForms = [...customForms, newForm];
    }

    setCustomForms(updatedForms);
    
    // Save to localStorage
    const storageKey = `customForms_${clinic.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedForms));
    
    setCurrentView('forms');
    setEditingForm(null);
  };

  const deleteCustomForm = (formId) => {
    const updatedForms = customForms.filter(form => form.id !== formId);
    setCustomForms(updatedForms);
    
    // Also delete related income entries
    const updatedEntries = incomeEntries.filter(entry => entry.customFormId !== formId);
    setIncomeEntries(updatedEntries);
    
    // Save to localStorage
    const formsStorageKey = `customForms_${clinic.id}`;
    const entriesStorageKey = `incomeEntries_${clinic.id}`;
    localStorage.setItem(formsStorageKey, JSON.stringify(updatedForms));
    localStorage.setItem(entriesStorageKey, JSON.stringify(updatedEntries));
    
    if (selectedForm?.id === formId) {
      setSelectedForm(null);
      setCurrentView('forms');
    }
  };

  const saveIncomeEntry = (entryData) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entryData,
      customFormId: selectedForm.id,
      clinicId: clinic.id,
      createdAt: new Date().toISOString()
    };

    const updatedEntries = [...incomeEntries, newEntry];
    setIncomeEntries(updatedEntries);
    
    // Save to localStorage
    const storageKey = `incomeEntries_${clinic.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
    
    setCurrentView('entries');
  };

  const deleteIncomeEntry = (entryId) => {
    const updatedEntries = incomeEntries.filter(entry => entry.id !== entryId);
    setIncomeEntries(updatedEntries);
    
    // Save to localStorage
    const storageKey = `incomeEntries_${clinic.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
  };

  const getEntriesForSelectedForm = () => {
    return incomeEntries.filter(entry => entry.customFormId === selectedForm?.id);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create-form':
        return (
          <CustomFormBuilder
            clinic={clinic}
            editingForm={editingForm}
            onSave={saveCustomForm}
            onCancel={() => {
              setCurrentView('forms');
              setEditingForm(null);
            }}
          />
        );
      
      case 'entries':
        return (
          <IncomeEntryList
            entries={getEntriesForSelectedForm()}
            customForm={selectedForm}
            onAddEntry={() => setCurrentView('create-entry')}
            onDeleteEntry={deleteIncomeEntry}
            onBack={() => setCurrentView('forms')}
          />
        );
      
      case 'create-entry':
        return (
          <IncomeEntryForm
            clinic={clinic}
            customFinancialConfig={selectedForm}
            onSave={saveIncomeEntry}
            onCancel={() => setCurrentView('entries')}
          />
        );
      
      default:
        return (
          <CustomFormList
            forms={customForms}
            onCreateForm={() => setCurrentView('create-form')}
            onEditForm={(form) => {
              setEditingForm(form);
              setCurrentView('create-form');
            }}
            onDeleteForm={deleteCustomForm}
            onViewEntries={(form) => {
              setSelectedForm(form);
              setCurrentView('entries');
            }}
          />
        );
    }
  };

  return (
    <div className="custom-form-manager">
      <div className="manager-header">
        <h2>Financial Forms Management</h2>
        <div className="clinic-info">
          <span className="clinic-name">{clinic?.practiceName}</span>
          <span className="clinic-abn">ABN: {clinic?.abnNumber}</span>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="breadcrumb">
        <button 
          className={`breadcrumb-item ${currentView === 'forms' ? 'active' : ''}`}
          onClick={() => setCurrentView('forms')}
        >
          Custom Forms
        </button>
        {selectedForm && (
          <>
            <span className="breadcrumb-separator">›</span>
            <button 
              className={`breadcrumb-item ${currentView === 'entries' ? 'active' : ''}`}
              onClick={() => setCurrentView('entries')}
            >
              {selectedForm.formName} - Entries
            </button>
          </>
        )}
        {currentView === 'create-entry' && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">Add Entry</span>
          </>
        )}
        {currentView === 'create-form' && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              {editingForm ? 'Edit Form' : 'Create Form'}
            </span>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="manager-content">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default CustomFormManager;