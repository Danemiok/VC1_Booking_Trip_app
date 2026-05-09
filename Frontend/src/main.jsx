import axios from 'axios';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { applyInitialTheme, ThemeProvider } from './context/ThemeContext';
import { API_BASE_URL } from './services/api';
import './index.css';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
applyInitialTheme();
createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>);
