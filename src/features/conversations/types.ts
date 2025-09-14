/**
 * Enterprise-grade types for the conversations feature
 * Strictly matching backend API contracts with enhanced error handling
 */

// Message roles from backend OpenAI ChatMessageRole
export type MessageRole = 'user' | 'assistant' | 'system';

// Base domain value object types (matching backend Vogen value objects)
export type ConversationId = string; // Guid as string
export type MessageId = string; // Guid as string
export type UserId = string; // Guid as string

// Validation error from backend
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Enhanced API response matching backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  validationErrors?: ValidationError[];
  errors?: string[];
  traceId?: string;
  timestamp?: string;
}

// Pagination types matching backend
export interface PaginationParameters {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Message entity (matching backend Message domain model)
export interface Message {
  id: MessageId;
  conversationId: ConversationId;
  parentMessageId?: MessageId;
  author: MessageRole; // Using role from backend
  content: string;
  sequenceNumber?: number;
  createdAt: string; // ISO 8601 DateTime
  updatedAt?: string;
}

// Conversation entity (matching backend Conversation domain model)
export interface Conversation {
  id: ConversationId;
  userId: UserId;
  title?: string;
  isDeleted: boolean;
  lastMessageAt?: string;
  messages: Message[];
  createdAt: string;
  updatedAt?: string;
}

// Conversation summary for lists (matching GetUserConversationsQuery.ConversationItem)
export interface ConversationSummary {
  id: ConversationId;
  title?: string;
  createdAt: string;
  createdAtUtc: string;
  lastActivityAtUtc?: string;
  lastMessageAt?: string;
  messageCount: number;
}

// Server-Sent Events types (matching SendMessageCommand)
export interface MessageChunk {
  content: string;
}

export interface SseItem<T> {
  data: T;
  eventType?: string;
  reconnectionInterval?: number;
}

export interface StreamingMessage extends Message {
  isStreaming: boolean;
  chunks: string[];
}

// API Request/Response DTOs (matching backend commands/queries)

// CreateConversationCommand
export interface CreateConversationRequest {
  // No body needed - creates with current user
  userId?: string;
}

export type CreateConversationResponse = ConversationId;

// SendMessageCommand
export interface SendMessageRequest {
  content: string;
  parentMessageId?: MessageId;
  history: MessageHistoryItem[];
}

export interface MessageHistoryItem {
  id?: MessageId;
  content: string;
  author: MessageRole;
  createdAt?: string;
}

export type SendMessageResponse = AsyncIterable<SseItem<MessageChunk>>;

// GetUserConversationsQuery
export interface GetUserConversationsRequest {
  userId: UserId;
  pagination: PaginationParameters;
}

export interface GetUserConversationsResponse {
  userId: UserId;
  conversations: PaginatedList<ConversationSummary>;
}

// GetConversationMessagesQuery
export interface GetConversationMessagesRequest {
  conversationId: ConversationId;
}

export interface GetConversationMessagesResponse {
  conversation: Conversation;
}

// UpdateConversationTitleCommand
export interface UpdateConversationTitleRequest {
  conversationId: ConversationId;
  title: string;
}

// Enhanced UI state with better error handling
export interface LoadingState {
  createConversation: boolean;
  fetchConversations: boolean;
  sendMessage: boolean;
  fetchMessages: boolean;
  updateTitle: boolean;
  deleteConversation: boolean;
}

export interface ErrorState {
  global?: string;
  createConversation?: string;
  fetchConversations?: string;
  sendMessage?: string;
  fetchMessages?: string;
  updateTitle?: string;
  deleteConversation?: string;
  validation?: ValidationError[];
}

export interface ConversationsState {
  // Core state
  activeConversationId: ConversationId | null;
  conversations: Record<ConversationId, Conversation>;
  conversationSummaries: Record<UserId, ConversationSummary[]>;

  // UI state
  loading: LoadingState;
  errors: ErrorState;

  // Streaming state
  streamingMessages: Record<ConversationId, StreamingMessage>;

  // Cache management
  lastFetch: {
    conversations?: string;
    messages?: Record<ConversationId, string>;
  };

  // Optimistic updates tracking
  optimisticMessages: Record<MessageId, Message>;
}

// Error handling types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  traceId?: string;
  validation?: ValidationError[];
  retryable?: boolean;
}

// Configuration types
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryConfig: RetryConfig;
  enableCaching: boolean;
  cacheTimeout: number;
}