import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth.js';
import { getClinics, getIncomeEntries, getExpenseEntries } from '../../utils/localStorage.js';
import { formatCurrency } from '../../utils/calculations.js';

const SummaryCard = ({ title, value, subtitle, trend, color = 'primary', icon, linkTo }) => {
  const cardContent = (
    <div className={`summary-card summary-card-${color}`}>
      <div className="summary-card-header">
        <div className="summary-card-icon">
          {icon}
        </div>
        <div className="summary-card-info">
          <h3 className="summary-card-title">{title}</h3>
          <div className="summary-card-value">{value}</div>
          {subtitle && <div className="summary-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      {trend && (
        <div className={`summary-card-trend trend-${trend.type}`}>
          <span className="trend-icon">
            {trend.type === 'up' ? '↗' : trend.type === 'down' ? '↘' : '→'}
          </span>
          <span className="trend-text">{trend.text}</span>
        </div>
      )}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{cardContent}</Link> : cardContent;
};

const RecentActivityItem = ({ type, title, amount, date, clinic }) => (
  <div className="activity-item">
    <div className="activity-icon">
      {type === 'income' ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
    </div>
    <div className="activity-content">
      <div className="activity-title">{title}</div>
      <div className="activity-meta">
        <span className="activity-clinic">{clinic}</span>
        <span className="activity-date">{date}</span>
      </div>
    </div>
    <div className={`activity-amount ${type === 'income' ? 'positive' : 'negative'}`}>
      {type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(amount))}
    </div>
  </div>
);

const DashboardPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    clinics: [],
    incomeEntries: [],
    expenseEntries: [],
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netPosition: 0,
      activeClinicCount: 0
    }
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user) {
      loadDashboardData(user.id);
    }
  }, []);

  const loadDashboardData = (userId) => {
    const clinics = getClinics().filter(clinic => 
      clinic.ownerId === userId && clinic.isActive
    );
    
    const clinicIds = clinics.map(clinic => clinic.id);
    
    const incomeEntries = getIncomeEntries().filter(entry => 
      clinicIds.includes(entry.clinicId)
    );
    
    const expenseEntries = getExpenseEntries().filter(entry => 
      clinicIds.includes(entry.clinicId)
    );

    // Calculate current month totals
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthIncome = incomeEntries
      .filter(entry => {
        const entryDate = new Date(entry.entryDate);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + (entry.dentistPayable || 0), 0);
    
    const currentMonthExpenses = expenseEntries
      .filter(entry => {
        const entryDate = new Date(entry.entryDate);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);

    const summary = {
      totalIncome: currentMonthIncome,
      totalExpenses: currentMonthExpenses,
      netPosition: currentMonthIncome - currentMonthExpenses,
      activeClinicCount: clinics.length
    };

    setDashboardData({
      clinics,
      incomeEntries: incomeEntries.slice(0, 10), // Recent 10
      expenseEntries: expenseEntries.slice(0, 10), // Recent 10
      summary
    });
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent income entries
    dashboardData.incomeEntries.forEach(entry => {
      const clinic = dashboardData.clinics.find(c => c.id === entry.clinicId);
      activities.push({
        type: 'income',
        title: `Income Entry - ${entry.calculationType}`,
        amount: entry.dentistPayable || 0,
        date: new Date(entry.entryDate).toLocaleDateString(),
        clinic: clinic?.practiceName || 'Unknown Clinic',
        timestamp: new Date(entry.createdAt).getTime()
      });
    });

    // Add recent expense entries
    dashboardData.expenseEntries.forEach(entry => {
      const clinic = dashboardData.clinics.find(c => c.id === entry.clinicId);
      activities.push({
        type: 'expense',
        title: `Expense - ${entry.description}`,
        amount: entry.amount || 0,
        date: new Date(entry.entryDate).toLocaleDateString(),
        clinic: clinic?.practiceName || 'Unknown Clinic',
        timestamp: new Date(entry.createdAt).getTime()
      });
    });

    // Sort by timestamp and return recent 10
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-secondary">
          Welcome back, {currentUser.firstName}! Here's your business overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(dashboardData.summary.totalIncome)}
          subtitle={`${dashboardData.incomeEntries.length} entries this month`}
          color="success"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />

        <SummaryCard
          title="Monthly Expenses"
          value={formatCurrency(dashboardData.summary.totalExpenses)}
          subtitle={`${dashboardData.expenseEntries.length} entries this month`}
          color="error"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <SummaryCard
          title="Net Position"
          value={formatCurrency(dashboardData.summary.netPosition)}
          subtitle="This month"
          color={dashboardData.summary.netPosition >= 0 ? 'success' : 'error'}
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <SummaryCard
          title="Active Clinics"
          value={dashboardData.summary.activeClinicCount}
          subtitle="Clinics managed"
          color="info"
          linkTo="/clinics"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/reports" className="btn btn-outline-primary btn-sm">
            View All Reports
          </Link>
        </div>

        <div className="activity-list">
          {getRecentActivity().length > 0 ? (
            getRecentActivity().map((activity, index) => (
              <RecentActivityItem key={index} {...activity} />
            ))
          ) : (
            <div className="empty-state">
              <p className="text-secondary">No recent activity found.</p>
              <Link to="/clinics/add" className="btn btn-primary">
                Add Your First Clinic
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="quick-actions">
          <Link to="/clinics/add" className="quick-action-card">
            <div className="quick-action-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="quick-action-content">
              <h3>Add New Clinic</h3>
              <p>Set up a new clinic with financial settings</p>
            </div>
          </Link>

          {dashboardData.clinics.length > 0 && (
            <Link to={`/clinics/${dashboardData.clinics[0].id}/settings`} className="quick-action-card">
              <div className="quick-action-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="quick-action-content">
                <h3>Financial Settings</h3>
                <p>Configure commission and calculation methods</p>
              </div>
            </Link>
          )}

          {dashboardData.clinics.length > 0 && (
            <Link to={`/clinics/${dashboardData.clinics[0].id}/income`} className="quick-action-card">
              <div className="quick-action-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="quick-action-content">
                <h3>Add Income Entry</h3>
                <p>Record new income with calculations</p>
              </div>
            </Link>
          )}

          {dashboardData.clinics.length > 0 && (
            <Link to={`/clinics/${dashboardData.clinics[0].id}/expenses`} className="quick-action-card">
              <div className="quick-action-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="quick-action-content">
                <h3>Add Expense Entry</h3>
                <p>Record business expenses</p>
              </div>
            </Link>
          )}

          {dashboardData.clinics.length > 0 && (
            <Link to="/test-users" className="quick-action-card">
              <div className="quick-action-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="quick-action-content">
                <h3>Test User Management</h3>
                <p>Test adding users and setting permissions</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;