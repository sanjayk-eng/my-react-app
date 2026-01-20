import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CustomFormManager from '../../components/forms/CustomFormManager.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const CustomFormsPage = () => {
  const { id: clinicId } = useParams();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClinic();
  }, [clinicId]);

  const loadClinic = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load clinic from localStorage (in a real app, this would be an API call)
      const clinicsData = localStorage.getItem('clinics');
      if (clinicsData) {
        const clinics = JSON.parse(clinicsData);
        const foundClinic = clinics.find(c => c.id === clinicId);
        
        if (foundClinic) {
          setClinic(foundClinic);
        } else {
          setError('Clinic not found');
        }
      } else {
        setError('No clinics data found');
      }
    } catch (err) {
      console.error('Error loading clinic:', err);
      setError('Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Clinic Not Found</h2>
          <p>The requested clinic could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <CustomFormManager clinic={clinic} />
    </div>
  );
};

export default CustomFormsPage;