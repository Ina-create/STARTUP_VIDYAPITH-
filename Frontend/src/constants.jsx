// src/config/constants.js

// Determine if we're in production
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Production API URLs
const PRODUCTION_API_BASE = 'https://startup-vidyapith.onrender.com/api';
const PRODUCTION_BACKEND = 'https://startup-vidyapith.onrender.com';

// Development API URLs  
const DEVELOPMENT_API_BASE = 'http://localhost:5000/api';
const DEVELOPMENT_BACKEND = 'http://localhost:5000';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isProduction ? PRODUCTION_API_BASE : DEVELOPMENT_API_BASE);

export const BACKEND_URL = import.meta.env.VITE_API_URL || 
  (isProduction ? PRODUCTION_BACKEND : DEVELOPMENT_BACKEND);

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Startup Vidyapith';
export const ITEMS_PER_PAGE = import.meta.env.VITE_ITEMS_PER_PAGE || 10;

// Log for debugging (remove in production)
console.log('API Configuration:', {
  API_BASE_URL,
  BACKEND_URL,
  isProduction,
  hostname: window.location.hostname,
  env: import.meta.env
});
