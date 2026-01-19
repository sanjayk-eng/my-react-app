const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.07 2.38" />
            </svg>
          </div>
          <h2 className="logo-text">HP Accounting</h2>
        </div>
        
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;