// Central place for the backend URL.
// Locally it falls back to localhost:5000.
// In production (Vercel), set REACT_APP_API_URL to your Render backend URL.

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";