// Central API base URL — set VITE_API_URL in Netlify environment variables
// to point to your Render backend (e.g. https://your-app.onrender.com)
const API_BASE = import.meta.env.VITE_API_URL || __API_BASE__;

export default API_BASE;




