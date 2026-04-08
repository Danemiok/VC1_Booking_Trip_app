import axios from 'axios';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { applyInitialTheme, ThemeProvider } from './theme';
import './index.css';

const backendOrigin = String(import.meta.env.VITE_BACKEND_ORIGIN ?? '').trim();

if (backendOrigin) {
  axios.defaults.baseURL = backendOrigin;
}

axios.defaults.withCredentials = true;

applyInitialTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
