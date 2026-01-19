import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <div className="error-code">404</div>
          <div className="error-icon">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9,9h6v6H9z"></path>
              <path d="M9,9L15,15"></path>
              <path d="M15,9L9,15"></path>
            </svg>
          </div>
        </div>
        
        <div className="not-found-text">
          <h1>Page Not Found</h1>
          <p>
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="not-found-actions">
          <Link to="/dashboard">
            <Button variant="primary" size="lg">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Button>
          </Link>
          
          <Button 
            variant="outline-secondary" 
            size="lg"
            onClick={() => window.history.back()}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;