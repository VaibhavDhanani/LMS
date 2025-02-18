import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// <StrictMode>
createRoot(document.getElementById('root')).render(
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer 
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      </AuthProvider>
    </Router>
);
// {/* </StrictMode>, */}
