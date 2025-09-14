/**
 * Enterprise-grade API client with comprehensive error handling, 
 * retry logic, and SSE support
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  ApiError,
  RetryConfig,
  ApiClientConfig,
  ValidationError,
  SseItem,
  MessageChunk,
} from '../types';

/**
 * Default configuration for the API client
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '/api',
  timeout: 30000,
  retryConfig: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBase: 2,
  },
  enableCaching: false, // Simplified for now
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

/**
 * Enhanced API error class with comprehensive error details
 */
export class EnhancedApiError extends Error implements ApiError {
  status?: number;
  code?: string;
  traceId?: string;
  validation?: ValidationError[];
  retryable: boolean = false;

  constructor(message: string, options: Partial<Omit<ApiError, 'message' | 'name'>> = {}) {
    super(message);
    this.name = 'EnhancedApiError';
    Object.assign(this, options);
  }

  static fromResponse(response: AxiosResponse<ApiResponse<any>>): EnhancedApiError {
    const apiResponse = response.data;
    const message = apiResponse.message || apiResponse.errors?.[0] || 'An API error occurred';

    return new EnhancedApiError(message, {
      status: response.status,
      code: apiResponse.errors?.[0],
      traceId: apiResponse.traceId,
      validation: apiResponse.validationErrors,
      retryable: response.status >= 500 || response.status === 429,
    });
  }

  static fromAxiosError(error: any): EnhancedApiError {
    if (error.response) {
      return this.fromResponse(error.response);
    }

    return new EnhancedApiError(error.message || 'Network error occurred', {
      retryable: true,
    });
  }
}

/**
 * Retry mechanism with exponential backoff and jitter
 */
class RetryHandler {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async execute<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const apiError = error instanceof EnhancedApiError
        ? error
        : EnhancedApiError.fromAxiosError(error);

      if (attempt >= this.config.maxAttempts || !apiError.retryable) {
        throw apiError;
      }

      const delay = this.calculateDelay(attempt);
      await this.sleep(delay);

      return this.execute(operation, attempt + 1);
    }
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.config.baseDelay * Math.pow(this.config.exponentialBase, attempt - 1),
      this.config.maxDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = exponentialDelay * 0.1 * Math.random();
    return exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Server-Sent Events handler with automatic reconnection
 */
export class SSEHandler {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  async *streamMessages(
    url: string,
    options: { headers?: Record<string, string> } = {}
  ): AsyncGenerator<SseItem<MessageChunk>, void, unknown> {
    const fullUrl = new URL(url, window.location.origin);

    // Add headers as query parameters since EventSource doesn't support custom headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        fullUrl.searchParams.append(`header_${key}`, value);
      });
    }

    while (this.reconnectAttempts < this.maxReconnectAttempts) {
      try {
        for await (const message of this.createEventStream(fullUrl.toString())) {
          yield message;
        }
        break; // Success - exit retry loop
      } catch (error) {
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          throw new EnhancedApiError('Max reconnection attempts exceeded', {
            retryable: false,
          });
        }

        await new Promise(resolve =>
          setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts)
        );
      }
    }
  }

  private async *createEventStream(url: string): AsyncGenerator<SseItem<MessageChunk>, void, unknown> {
    this.eventSource = new EventSource(url);

    const messageQueue: SseItem<MessageChunk>[] = [];
    let resolveNext: ((value: SseItem<MessageChunk>) => void) | null = null;

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MessageChunk;
        const sseItem: SseItem<MessageChunk> = {
          data,
          eventType: event.type,
        };

        if (resolveNext) {
          resolveNext(sseItem);
          resolveNext = null;
        } else {
          messageQueue.push(sseItem);
        }
      } catch (error) {
        throw new EnhancedApiError('Failed to parse SSE message');
      }
    };

    this.eventSource.onerror = () => {
      throw new EnhancedApiError('SSE connection error', {
        retryable: true,
      });
    };

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0; // Reset on successful connection
    };

    while (true) {
      if (messageQueue.length > 0) {
        yield messageQueue.shift()!;
      } else {
        yield new Promise<SseItem<MessageChunk>>((resolve) => {
          resolveNext = resolve;
        });
      }
    }
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

/**
 * Enterprise API client with comprehensive features
 */
class EnterpriseApiClient {
  private axiosInstance: AxiosInstance;
  private retryHandler: RetryHandler;
  private sseHandler: SSEHandler;

  constructor(config: Partial<ApiClientConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL: finalConfig.baseUrl,
      timeout: finalConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Setup interceptors
    this.setupInterceptors();

    // Initialize handlers
    this.retryHandler = new RetryHandler(finalConfig.retryConfig);
    this.sseHandler = new SSEHandler();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication and logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers!.Authorization = `Bearer ${token}`;
        }

        // Add correlation ID for tracing
        config.headers!['X-Correlation-ID'] = this.generateCorrelationId();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
          console.debug('API Response:', response);
        }
        return response;
      },
      (error) => {
        const apiError = EnhancedApiError.fromAxiosError(error);

        // Log errors
        console.error('API Error:', apiError);

        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    // Implementation depends on your authentication strategy
    return localStorage.getItem('auth_token');
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generic GET request with retry logic
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.retryHandler.execute(async () => {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data;
    });
  }

  /**
   * Generic POST request with retry logic
   */
  async post<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.retryHandler.execute(async () => {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    });
  }

  /**
   * Generic PUT request with retry logic
   */
  async put<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.retryHandler.execute(async () => {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    });
  }

  /**
   * Generic DELETE request with retry logic
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.retryHandler.execute(async () => {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return response.data;
    });
  }

  /**
   * Server-Sent Events streaming
   */
  streamMessages(
    url: string,
    options?: { headers?: Record<string, string> }
  ): AsyncGenerator<SseItem<MessageChunk>, void, unknown> {
    return this.sseHandler.streamMessages(url, options);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.sseHandler.close();
  }
}

// Export singleton instance
export const apiClient = new EnterpriseApiClient();