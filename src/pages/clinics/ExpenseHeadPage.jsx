import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClinics, getExpenseHeads, setExpenseHeads, getExpenseEntities, setExpenseEntities } from '../../utils/localStorage.js';
import { generateUniqueId } from '../../utils/auth.js';
import { EXPENSE_TYPES } from '../../utils/constants.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';

const ExpenseHeadPage = () => {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('heads'); // 'heads' or 'entities'
  
  // Expense Heads State
  const [expenseHeads, setExpenseHeadsState] = useState([]);
  const [showHeadForm, setShowHeadForm] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [headFormData, setHeadFormData] = useState({
    name: '',
    description: ''
  });
  
  // Expense Entities State
  const [expenseEntities, setExpenseEntitiesState] = useState([]);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [entityFormData, setEntityFormData] = useState({
    name: '',
    type: 'Capital Purchases',
    headId: '',
    purchasePrice: 0,
    chargePerUse: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const clinics = getClinics();
    const foundClinic = clinics.find(c => c.id === id);
    setClinic(foundClinic);
    
    // Load expense heads and entities
    const heads = getExpenseHeads().filter(head => head.clinicId === id);
    const entities = getExpenseEntities().filter(entity => entity.clinicId === id);
    
    setExpenseHeadsState(heads);
    setExpenseEntitiesState(entities);
    setIsLoading(false);
  }, [id]);

  // Auto-calculate charge per use for Non-Capital purchases
  useEffect(() => {
    if (entityFormData.type === 'Non-Capital Purchases') {
      setEntityFormData(prev => ({
        ...prev,
        chargePerUse: prev.purchasePrice
      }));
    }
  }, [entityFormData.type, entityFormData.purchasePrice]);

  const handleHeadFormChange = (field, value) => {
    setHeadFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleEntityFormChange = (field, value) => {
    setEntityFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateHeadForm = () => {
    const newErrors = {};
    
    if (!headFormData.name.trim()) {
      newErrors.name = 'Head name is required';
    }
    
    if (!headFormData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEntityForm = () => {
    const newErrors = {};
    
    if (!entityFormData.name.trim()) {
      newErrors.name = 'Entity name is required';
    }
    
    if (!entityFormData.headId) {
      newErrors.headId = 'Please select an expense head';
    }
    
    if (!entityFormData.purchasePrice || entityFormData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    
    if (entityFormData.type === 'Capital Purchases' && (!entityFormData.chargePerUse || entityFormData.chargePerUse <= 0)) {
      newErrors.chargePerUse = 'Charge per use must be greater than 0 for capital purchases';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveHead = () => {
    if (!validateHeadForm()) return;
    
    const allHeads = getExpenseHeads();
    
    if (editingHead) {
      // Update existing head
      const updatedHeads = allHeads.map(head => 
        head.id === editingHead.id 
          ? { ...head, ...headFormData, updatedAt: new Date().toISOString() }
          : head
      );
      setExpenseHeads(updatedHeads);
      setExpenseHeadsState(updatedHeads.filter(head => head.clinicId === id));
    } else {
      // Create new head
      const newHead = {
        id: generateUniqueId(),
        clinicId: id,
        ...headFormData,
        createdAt: new Date().toISOString()
      };
      const updatedHeads = [...allHeads, newHead];
      setExpenseHeads(updatedHeads);
      setExpenseHeadsState(updatedHeads.filter(head => head.clinicId === id));
    }
    
    // Reset form
    setHeadFormData({ name: '', description: '' });
    setShowHeadForm(false);
    setEditingHead(null);
    setErrors({});
  };

  const handleSaveEntity = () => {
    if (!validateEntityForm()) return;
    
    const allEntities = getExpenseEntities();
    
    if (editingEntity) {
      // Update existing entity
      const updatedEntities = allEntities.map(entity => 
        entity.id === editingEntity.id 
          ? { ...entity, ...entityFormData, updatedAt: new Date().toISOString() }
          : entity
      );
      setExpenseEntities(updatedEntities);
      setExpenseEntitiesState(updatedEntities.filter(entity => entity.clinicId === id));
    } else {
      // Create new entity
      const newEntity = {
        id: generateUniqueId(),
        clinicId: id,
        ...entityFormData,
        createdAt: new Date().toISOString()
      };
      const updatedEntities = [...allEntities, newEntity];
      setExpenseEntities(updatedEntities);
      setExpenseEntitiesState(updatedEntities.filter(entity => entity.clinicId === id));
    }
    
    // Reset form
    setEntityFormData({
      name: '',
      type: 'Capital Purchases',
      headId: '',
      purchasePrice: 0,
      chargePerUse: 0
    });
    setShowEntityForm(false);
    setEditingEntity(null);
    setErrors({});
  };

  const handleEditHead = (head) => {
    setEditingHead(head);
    setHeadFormData({
      name: head.name,
      description: head.description
    });
    setShowHeadForm(true);
  };

  const handleEditEntity = (entity) => {
    setEditingEntity(entity);
    setEntityFormData({
      name: entity.name,
      type: entity.type,
      headId: entity.headId,
      purchasePrice: entity.purchasePrice,
      chargePerUse: entity.chargePerUse
    });
    setShowEntityForm(true);
  };

  const handleDeleteHead = (headId) => {
    if (window.confirm('Are you sure you want to delete this expense head?')) {
      const allHeads = getExpenseHeads();
      const updatedHeads = allHeads.filter(head => head.id !== headId);
      setExpenseHeads(updatedHeads);
      setExpenseHeadsState(updatedHeads.filter(head => head.clinicId === id));
    }
  };

  const handleDeleteEntity = (entityId) => {
    if (window.confirm('Are you sure you want to delete this expense entity?')) {
      const allEntities = getExpenseEntities();
      const updatedEntities = allEntities.filter(entity => entity.id !== entityId);
      setExpenseEntities(updatedEntities);
      setExpenseEntitiesState(updatedEntities.filter(entity => entity.clinicId === id));
    }
  };

  const cancelForm = () => {
    setShowHeadForm(false);
    setShowEntityForm(false);
    setEditingHead(null);
    setEditingEntity(null);
    setHeadFormData({ name: '', description: '' });
    setEntityFormData({
      name: '',
      type: 'Capital Purchases',
      headId: '',
      purchasePrice: 0,
      chargePerUse: 0
    });
    setErrors({});
  };

  const getHeadName = (headId) => {
    const head = expenseHeads.find(h => h.id === headId);
    return head ? head.name : 'Unknown Head';
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!clinic) {
    return <div>Clinic not found</div>;
  }

  return (
    <div className="expense-head-page">
      <div className="page-header">
        <h1>Expense Categories</h1>
        <p className="text-secondary">
          Manage expense heads and entities for {clinic.practiceName}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          type="button"
          className={`tab-button ${activeTab === 'heads' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('heads');
          }}
        >
          Expense Heads
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'entities' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('entities');
          }}
        >
          Expense Entities
        </button>
      </div>

      {/* Expense Heads Tab */}
      {activeTab === 'heads' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Expense Heads</h2>
              <Button
                variant="primary"
                onClick={() => setShowHeadForm(true)}
              >
                Add New Head
              </Button>
            </div>

            {/* Add/Edit Head Form */}
            {showHeadForm && (
              <div className="form-section">
                <h3>{editingHead ? 'Edit' : 'Add'} Expense Head</h3>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Head Name *"
                      value={headFormData.name}
                      onChange={(e) => handleHeadFormChange('name', e.target.value)}
                      error={errors.name}
                      placeholder="Enter expense head name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Description *"
                      value={headFormData.description}
                      onChange={(e) => handleHeadFormChange('description', e.target.value)}
                      error={errors.description}
                      placeholder="Enter description"
                      multiline
                      rows={3}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <Button variant="outline" onClick={cancelForm}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveHead}>
                    {editingHead ? 'Update' : 'Save'} Head
                  </Button>
                </div>
              </div>
            )}

            {/* Expense Heads List */}
            <div className="data-table">
              {expenseHeads.length === 0 ? (
                <p className="text-secondary">No expense heads created yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseHeads.map(head => (
                      <tr key={head.id}>
                        <td>{head.name}</td>
                        <td>{head.description}</td>
                        <td>{new Date(head.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditHead(head)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteHead(head.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expense Entities Tab */}
      {activeTab === 'entities' && (
        <div className="tab-content">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">Expense Entities</h2>
              <Button
                variant="primary"
                onClick={() => setShowEntityForm(true)}
                disabled={expenseHeads.length === 0}
              >
                Add New Entity
              </Button>
            </div>

            {expenseHeads.length === 0 && (
              <div className="alert alert-info">
                <p>Please create at least one expense head before adding entities.</p>
              </div>
            )}

            {/* Add/Edit Entity Form */}
            {showEntityForm && (
              <div className="form-section">
                <h3>{editingEntity ? 'Edit' : 'Add'} Expense Entity</h3>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Entity Name *"
                      value={entityFormData.name}
                      onChange={(e) => handleEntityFormChange('name', e.target.value)}
                      error={errors.name}
                      placeholder="Enter entity name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Select
                      label="Type *"
                      value={entityFormData.type}
                      onChange={(e) => handleEntityFormChange('type', e.target.value)}
                      options={EXPENSE_TYPES}
                      error={errors.type}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Select
                      label="Expense Head *"
                      value={entityFormData.headId}
                      onChange={(e) => handleEntityFormChange('headId', e.target.value)}
                      options={[
                        { value: '', label: 'Select an expense head' },
                        ...expenseHeads.map(head => ({
                          value: head.id,
                          label: head.name
                        }))
                      ]}
                      error={errors.headId}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Purchase Price *"
                      type="number"
                      min="0"
                      
                      value={entityFormData.purchasePrice}
                      onChange={(e) => handleEntityFormChange('purchasePrice', parseFloat(e.target.value) || 0)}
                      error={errors.purchasePrice}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Charge Per Use *"
                      type="number"
                      min="0"
                      
                      value={entityFormData.chargePerUse}
                      onChange={(e) => handleEntityFormChange('chargePerUse', parseFloat(e.target.value) || 0)}
                      error={errors.chargePerUse}
                      placeholder="0.00"
                      disabled={entityFormData.type === 'Non-Capital Purchases'}
                      helperText={entityFormData.type === 'Non-Capital Purchases' ? 'Auto-calculated as Purchase Price for Non-Capital purchases' : ''}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <Button variant="outline" onClick={cancelForm}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveEntity}>
                    {editingEntity ? 'Update' : 'Save'} Entity
                  </Button>
                </div>
              </div>
            )}

            {/* Expense Entities List */}
            <div className="data-table">
              {expenseEntities.length === 0 ? (
                <p className="text-secondary">No expense entities created yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Head</th>
                      <th>Purchase Price</th>
                      <th>Charge Per Use</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseEntities.map(entity => (
                      <tr key={entity.id}>
                        <td>{entity.name}</td>
                        <td>{entity.type}</td>
                        <td>{getHeadName(entity.headId)}</td>
                        <td>${entity.purchasePrice.toFixed(2)}</td>
                        <td>${entity.chargePerUse.toFixed(2)}</td>
                        <td>{new Date(entity.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEntity(entity)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteEntity(entity.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseHeadPage;