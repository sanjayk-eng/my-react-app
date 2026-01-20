import { useState, useEffect } from 'react';
import { getExpenseEntities, getExpenseHeads } from '../../utils/localStorage.js';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';

const BasConfigurationForm = ({ clinic, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Income Categories (static - these are standard BAS categories)
    incomeCategories: {
      incomeGstFree: { enabled: true, label: 'Income - GST Free (G3)', basCode: 'G3' },
      incomeGst: { enabled: true, label: 'Income - GST', basCode: 'G1' },
      otherIncomeGstFree: { enabled: true, label: 'Other income - GST Free', basCode: 'G3' },
      otherIncomeGst: { enabled: true, label: 'Other income - GST', basCode: 'G1' },
      totalIncome: { enabled: true, label: 'Total Income', basCode: 'G1' }
    },
    // Dynamic expense entities (loaded from existing expense entities)
    expenseEntities: {},
    // GST Settings
    gstSettings: {
      defaultGstRate: 10,
      gstFreeThreshold: 0,
      gstRegistered: true
    },
    // Quarterly Settings
    quarterlySettings: {
      financialYearStart: 'July', // July, January
      currentQuarter: 'Q1',
      reportingPeriod: 'Quarterly' // Monthly, Quarterly
    }
  });

  const [expenseEntities, setExpenseEntities] = useState([]);
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing expense entities and heads
  useEffect(() => {
    if (clinic?.id) {
      const entities = getExpenseEntities().filter(entity => entity.clinicId === clinic.id);
      const heads = getExpenseHeads().filter(head => head.clinicId === clinic.id);
      
      setExpenseEntities(entities);
      setExpenseHeads(heads);
      
      // Initialize expense entities configuration
      const expenseEntitiesConfig = {};
      entities.forEach(entity => {
        expenseEntitiesConfig[entity.id] = {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          headId: entity.headId,
          enabled: true,
          businessUse: 100, // Default 100% business use
          basCode: entity.type === 'Capital Purchases' ? 'G10' : 'G11'
        };
      });
      
      setFormData(prev => ({
        ...prev,
        expenseEntities: expenseEntitiesConfig
      }));
    }
  }, [clinic?.id]);

  // Initialize form with existing clinic BAS configuration
  useEffect(() => {
    if (clinic?.basConfiguration) {
      setFormData(prevData => ({
        ...prevData,
        ...clinic.basConfiguration,
        // Merge existing expense entities config with current entities
        expenseEntities: {
          ...prevData.expenseEntities,
          ...(clinic.basConfiguration.expenseEntities || {})
        }
      }));
    }
  }, [clinic]);

  const handleIncomeChange = (categoryKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      incomeCategories: {
        ...prev.incomeCategories,
        [categoryKey]: {
          ...prev.incomeCategories[categoryKey],
          [field]: value
        }
      }
    }));
  };

  const handleExpenseEntityChange = (entityId, field, value) => {
    setFormData(prev => ({
      ...prev,
      expenseEntities: {
        ...prev.expenseEntities,
        [entityId]: {
          ...prev.expenseEntities[entityId],
          [field]: value
        }
      }
    }));

    // Clear any existing errors for this field
    const errorKey = `expenseEntities.${entityId}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  const handleSettingsChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear any existing errors for this field
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate GST rate
    if (!formData.gstSettings.defaultGstRate || 
        formData.gstSettings.defaultGstRate < 0 || 
        formData.gstSettings.defaultGstRate > 100) {
      newErrors['gstSettings.defaultGstRate'] = 'GST rate must be between 0 and 100';
    }

    // Validate business use percentages for enabled entities
    Object.entries(formData.expenseEntities).forEach(([entityId, entity]) => {
      if (entity.enabled && (entity.businessUse < 0 || entity.businessUse > 100)) {
        newErrors[`expenseEntities.${entityId}.businessUse`] = 'Business use must be between 0 and 100%';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving BAS configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeadName = (headId) => {
    const head = expenseHeads.find(h => h.id === headId);
    return head ? head.name : 'Unknown Head';
  };

  const groupEntitiesByType = () => {
    const grouped = {
      'Capital Purchases': [],
      'Non-Capital Purchases': []
    };

    expenseEntities.forEach(entity => {
      if (grouped[entity.type]) {
        grouped[entity.type].push(entity);
      }
    });

    return grouped;
  };

  const renderExpenseEntitiesSection = () => {
    if (expenseEntities.length === 0) {
      return (
        <div className="form-section">
          <h3 className="form-section-title">Expense Entities</h3>
          <div className="alert alert-info">
            <h4>No Expense Entities Found</h4>
            <p>Please create expense entities first before configuring BAS settings.</p>
            <p>Go to Expense Categories → Expense Entities to create your expense entities.</p>
          </div>
        </div>
      );
    }

    const groupedEntities = groupEntitiesByType();

    return (
      <div className="form-section">
        <h3 className="form-section-title">Expense Entities Configuration</h3>
        <p className="form-section-description">
          Configure BAS settings for your existing expense entities. These are dynamically loaded from your expense management.
        </p>

        {Object.entries(groupedEntities).map(([type, entities]) => (
          <div key={type} className="entity-type-section">
            <h4 className="entity-type-title">
              {type} 
              <span className="bas-code">BAS: {type === 'Capital Purchases' ? 'G10' : 'G11'}</span>
            </h4>
            
            {entities.length === 0 ? (
              <p className="text-muted">No {type.toLowerCase()} entities created yet.</p>
            ) : (
              <div className="entities-grid">
                {entities.map(entity => {
                  const entityConfig = formData.expenseEntities[entity.id] || {};
                  return (
                    <div key={entity.id} className="entity-item">
                      <div className="entity-header">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={entityConfig.enabled || false}
                            onChange={(e) => handleExpenseEntityChange(entity.id, 'enabled', e.target.checked)}
                          />
                          <span className="checkbox-text">{entity.name}</span>
                        </label>
                        <div className="entity-meta">
                          <span className="entity-head">{getHeadName(entity.headId)}</span>
                          <span className="entity-price">${entity.chargePerUse?.toFixed(2)}/use</span>
                        </div>
                      </div>
                      
                      {entityConfig.enabled && (
                        <div className="entity-controls">
                          <div className="form-group">
                            <Input
                              label="Business Use %"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={entityConfig.businessUse || 100}
                              onChange={(e) => handleExpenseEntityChange(entity.id, 'businessUse', parseInt(e.target.value) || 0)}
                              error={errors[`expenseEntities.${entity.id}.businessUse`]}
                              placeholder="100"
                              size="sm"
                              help="Percentage of this expense used for business purposes"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bas-configuration-form">
      {/* Configuration Summary */}
      <div className="form-section config-summary">
        <h3 className="form-section-title">BAS Configuration Summary</h3>
        <div className="config-grid">
          <div className="config-item">
            <span className="config-label">GST Rate:</span>
            <span className="config-value">{formData.gstSettings.defaultGstRate}%</span>
          </div>
          <div className="config-item">
            <span className="config-label">GST Registered:</span>
            <span className={`config-value ${formData.gstSettings.gstRegistered ? 'enabled' : 'disabled'}`}>
              {formData.gstSettings.gstRegistered ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Expense Entities:</span>
            <span className="config-value">{expenseEntities.length} entities</span>
          </div>
          <div className="config-item">
            <span className="config-label">Enabled Entities:</span>
            <span className="config-value">
              {Object.values(formData.expenseEntities).filter(e => e.enabled).length} enabled
            </span>
          </div>
        </div>
      </div>

      {/* Income Categories */}
      <div className="form-section">
        <h3 className="form-section-title">Income Categories</h3>
        <p className="form-section-description">Standard BAS income categories</p>
        
        <div className="categories-grid">
          {Object.entries(formData.incomeCategories).map(([key, category]) => (
            <div key={key} className="category-item">
              <div className="category-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={category.enabled}
                    onChange={(e) => handleIncomeChange(key, 'enabled', e.target.checked)}
                  />
                  <span className="checkbox-text">{category.label}</span>
                </label>
                <span className="bas-code">BAS: {category.basCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Expense Entities */}
      {renderExpenseEntitiesSection()}

      {/* GST Settings */}
      <div className="form-section">
        <h3 className="form-section-title">GST Settings</h3>
        
        <div className="form-row">
          <div className="form-group">
            <Input
              label="Default GST Rate (%) *"
              type="number"
              min="0"
              max="100"
              step="0.00"
              value={formData.gstSettings.defaultGstRate}
              onChange={(e) => handleSettingsChange('gstSettings', 'defaultGstRate', parseFloat(e.target.value) || 10)}
              error={errors['gstSettings.defaultGstRate']}
              placeholder="10"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.gstSettings.gstRegistered}
                onChange={(e) => handleSettingsChange('gstSettings', 'gstRegistered', e.target.checked)}
              />
              <span className="checkbox-text">GST Registered Business</span>
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Input
              label="GST-Free Threshold ($)"
              type="number"
              min="0"
              step="0.00"
              value={formData.gstSettings.gstFreeThreshold}
              onChange={(e) => handleSettingsChange('gstSettings', 'gstFreeThreshold', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              help="Threshold below which transactions are considered GST-free"
            />
          </div>
        </div>
      </div>

      {/* Quarterly Settings */}
      <div className="form-section">
        <h3 className="form-section-title">Reporting Settings</h3>
        
        <div className="form-row">
          <div className="form-group">
            <Select
              label="Financial Year Start *"
              value={formData.quarterlySettings.financialYearStart}
              onChange={(e) => handleSettingsChange('quarterlySettings', 'financialYearStart', e.target.value)}
              options={[
                { value: 'July', label: 'July (Standard Australian Financial Year)' },
                { value: 'January', label: 'January (Calendar Year)' }
              ]}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Select
              label="Reporting Period *"
              value={formData.quarterlySettings.reportingPeriod}
              onChange={(e) => handleSettingsChange('quarterlySettings', 'reportingPeriod', e.target.value)}
              options={[
                { value: 'Quarterly', label: 'Quarterly (Recommended)' },
                { value: 'Monthly', label: 'Monthly' }
              ]}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <Select
              label="Current Quarter *"
              value={formData.quarterlySettings.currentQuarter}
              onChange={(e) => handleSettingsChange('quarterlySettings', 'currentQuarter', e.target.value)}
              options={[
                { value: 'Q1', label: 'Q1 (July-September)' },
                { value: 'Q2', label: 'Q2 (October-December)' },
                { value: 'Q3', label: 'Q3 (January-March)' },
                { value: 'Q4', label: 'Q4 (April-June)' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Save BAS Configuration
        </Button>
      </div>
    </form>
  );
};

export default BasConfigurationForm;