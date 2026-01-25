import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

// Import all styles
import './styles/globals.css';
import './styles/components/buttons.css';
import './styles/components/forms.css';
import './styles/components/financial-settings.css';
import './styles/components/custom-financial-form.css';
import './styles/components/clinic-user-form.css';
import './styles/components/users-table.css';
import './styles/components/toast.css';
import './styles/components/expense-head.css';
import './styles/components/loading.css';
import './styles/components/bas-configuration.css';
import './styles/CustomFormManager.css';
import './styles/layouts/layout.css';
import './styles/layouts/sidebar.css';
import './styles/pages/dashboard.css';
import './styles/pages/profile.css';
import './styles/pages/clinics.css';
import './styles/pages/not-found.css';
import './styles/enhancements.css';
import './styles/modern-effects.css';
import './styles/micro-interactions.css';
// Layout fixes - load last to override conflicts
import './styles/layout-fixes.css';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
