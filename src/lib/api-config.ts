export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  ENDPOINTS: {
    HEALTH: '/health',
    DETECT_STREAM: '/detect/stream',
  },
  HEADERS: {
    DEFAULT: {
      'Accept': 'application/json',
    },
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};