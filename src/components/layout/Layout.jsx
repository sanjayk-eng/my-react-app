import { useState, useEffect } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      
      // On desktop, sidebar should be open by default
      // On mobile, sidebar should be closed by default
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className={`app-main ${sidebarOpen && !isMobile ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;