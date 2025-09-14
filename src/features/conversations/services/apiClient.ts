/**
 * Simplified API client with basic error handling
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  ValidationError,
} from '../types';

/**
 * Enhanced API error class
 */
export class EnhancedApiError extends Error {
  status?: number;
  code?: string;
  traceId?: string;
  validation?: ValidationError[];
  retryable: boolean = false;

  constructor(message: string, options: {
    status?: number;
    code?: string;
    traceId?: string;
    validation?: ValidationError[];
    retryable?: boolean;
  } = {}) {
    super(message);
    this.name = 'EnhancedApiError';
    this.status = options.status;
    this.code = options.code;
    this.traceId = options.traceId;
    this.validation = options.validation;
    this.retryable = options.retryable ?? false;
  }
}

/**
 * Simple API client
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError = new EnhancedApiError(
          error.response?.data?.message || error.message || 'API Error',
          {
            status: error.response?.status,
            retryable: error.response?.status >= 500 || error.response?.status === 429,
          }
        );
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();