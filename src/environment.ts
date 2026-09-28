export const environment = {
  // Uses the NEXT_PUBLIC_API_BASE_URL variable if it exists, otherwise falls back to the deployed backend
  apiBaseUrl: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || 'https://backend-node-js-360info.onrender.com/api',
  imageBaseUrl: ((typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || 'https://backend-node-js-360info.onrender.com/api').replace(/\/api\/?$/, ''),
};

