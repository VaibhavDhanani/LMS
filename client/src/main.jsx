import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// <StrictMode>
createRoot(document.getElementById('root')).render(
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
);
// {/* </StrictMode>, */}
