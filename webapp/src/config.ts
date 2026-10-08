// If VITE_API_URL is explicitly set, use it.
// In production builds without VITE_API_URL, default to '' (same-origin relative path for Vercel unified deployment).
// In local development, default to 'http://localhost:3001'.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.PROD ? '' : 'http://localhost:3001');
