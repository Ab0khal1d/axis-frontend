import axios from 'axios';
import type { AxiosInstance } from 'axios';

const DEFAULT_TIMEOUT_MS = 30_000;

// Prefer Vite env var if present
const API_BASE_URL = (
  import.meta?.env?.VITE_API_BASE_URL as string | undefined
) ?? 'https://localhost:7255';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Accept': 'application/json, text/event-stream, */*',
    'Content-Type': 'application/json',
  },
});

// Request interceptor (auth, tracing, etc.)
httpClient.interceptors.request.use((config) => {
  // Example: attach bearer token if available
  const token = localStorage.getItem('authToken');
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error shape
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize network and CORS-like failures
    if (error.message?.includes('Network Error')) {
      error.normalizedMessage = 'Network error. Is the API running and reachable?';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
