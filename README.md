# Health Professional Accounting System

A comprehensive React-based accounting system for health professionals with JWT authentication, localStorage persistence, and advanced financial calculations.

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open http://localhost:5173 in your browser
   - Create an account or use existing credentials

## ✅ Implemented Features

### Authentication System
- ✅ User registration with validation
- ✅ JWT-based login system
- ✅ Route protection with PrivateRoute
- ✅ Automatic logout on token expiration
- ✅ localStorage persistence

### Core Layout & Navigation
- ✅ Responsive header with user menu
- ✅ Collapsible sidebar navigation
- ✅ Mobile-responsive design
- ✅ Toast notification system
- ✅ Clean, professional UI with CSS variables

### Dashboard
- ✅ Summary cards for income, expenses, net position
- ✅ Recent activity feed
- ✅ Quick action buttons
- ✅ Clinic overview statistics

### Profile Management
- ✅ User profile editing
- ✅ Profile photo upload (base64)
- ✅ Phone number and timezone settings
- ✅ Form validation

### Clinic Management
- ✅ Clinic listing with status indicators
- ✅ Add new clinic with validation
- ✅ Clinic information management
- ✅ State and ABN validation

### Placeholder Pages (Ready for Implementation)
- 🔄 Financial Settings (conditional logic system)
- 🔄 User Management & Permissions
- 🔄 Income Calculators (Net & Gross methods)
- 🔄 Expense Management
- 🔄 Expense Categories
- 🔄 BAS Report Generation

## 🛠 Tech Stack

- **Frontend**: React 18+ with Hooks
- **Routing**: React Router v6
- **Styling**: Pure CSS with CSS Variables
- **State**: useState, useEffect (No Redux)
- **Authentication**: Mock JWT with localStorage
- **Validation**: Custom validation utilities
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Header, Sidebar, Layout
│   └── common/         # Reusable UI components
├── pages/
│   ├── auth/           # Login, Signup pages
│   ├── dashboard/      # Dashboard page
│   ├── profile/        # Profile management
│   └── clinics/        # Clinic management pages
├── utils/
│   ├── auth.js         # Authentication utilities
│   ├── localStorage.js # Data persistence
│   ├── validation.js   # Form validation
│   ├── calculations.js # Financial calculations
│   └── constants.js    # App constants
├── context/
│   └── ToastContext.jsx # Toast notifications
├── styles/
│   ├── globals.css     # Global styles
│   ├── variables.css   # CSS custom properties
│   ├── components/     # Component styles
│   ├── layouts/        # Layout styles
│   └── pages/          # Page-specific styles
└── routes/
    └── AppRoutes.jsx   # Route configuration
```

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with email/password
2. **Login**: JWT token generated and stored in localStorage
3. **Route Protection**: PrivateRoute validates token on each navigation
4. **Auto-logout**: Invalid/expired tokens trigger automatic logout

## 💾 Data Storage

All data is stored in localStorage with the following keys:
- `hpUsers` - User accounts
- `jwtToken` - Authentication token
- `healthProfessionalProfile` - User profiles
- `clinics` - Clinic information
- `clinicUsers` - Clinic user permissions
- `incomeEntries` - Income calculations
- `expenseEntries` - Expense records
- `basReports` - BAS report data

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Toast Notifications**: Success/error feedback
- **Loading States**: Button and form loading indicators
- **Form Validation**: Real-time validation with error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Professional Theme**: Clean, modern design with consistent spacing

## 🚧 Next Implementation Steps

1. **Financial Settings**: Implement conditional form logic for commission splitting, GST, and lab fees
2. **Income Calculators**: Build Net and Gross method calculators with real-time calculations
3. **User Permissions**: Implement granular permission system for clinic users
4. **Expense Management**: Create expense entry forms and category management
5. **BAS Reports**: Generate comprehensive BAS reports with export functionality

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📝 Notes

- All financial calculations are implemented in `utils/calculations.js`
- Form validation rules are centralized in `utils/validation.js`
- CSS follows BEM-like naming conventions with CSS custom properties
- Components are functional with React Hooks
- No external UI libraries - pure CSS implementation
- localStorage is used for all data persistence (no backend required)

The foundation is solid and ready for implementing the remaining financial calculation features and advanced functionality as specified in the requirements.