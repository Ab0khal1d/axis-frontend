/**
 * Enterprise-grade types for the conversations feature
 * Strictly matching backend API contracts with enhanced error handling
 */

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

// Backend ChatMessageRole enum from OpenAPI
export type ChatMessageRole = "System" | "User" | "Assistant" | "Tool" | "Function" | "Developer";

// Message entity (matching backend Message domain model)
export interface Message {
  id: MessageId; // ⚠️ CRITICAL: Only backend should generate this!
  conversationId: ConversationId;
  parentMessageId?: MessageId;
  author: ChatMessageRole; // ✅ Using exact backend enum
  content: string;
  sequenceNumber?: number;
  createdAt: string; // ISO 8601 DateTime from backend
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
  updatedAt?: string;
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

// API Request/Response DTOs (matching backend commands/queries)

// CreateConversationCommand
export interface CreateConversationRequest {
  // No body needed - creates with current user
  userId?: string;
}

export type CreateConversationResponse = ConversationId;

// SendMessageCommand - Fixed to match OpenAPI spec exactly
export interface SendMessageRequest {
  content: string;
  parentMessageId: MessageId; // ✅ Required by backend contract
  history: MessageHistoryItem[];
}

export interface MessageHistoryItem {
  id?: MessageId; // Optional since backend generates this
  content: string;
  author: ChatMessageRole;
  createdAt?: string; // Optional since backend sets this
}

// OpenAPI-compliant types from webapi--v1.json
export interface ConversationItem {
  id: string; // UUID
  title: string | null;
  createdAt: string; // DateTime
  updatedAt: string | null; // DateTime
  userId: string | null; // UUID
  messages: MessageItem[];
}


export interface MessageItem {
  id: string | null; // UUID
  content: string;
  author: ChatMessageRole;
  createdAt: string | null; // DateTime
}

export interface PaginatedListOfConversationItem {
  items: ConversationItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedListOfConversationItem2 {
  items: ConversationItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedListOfMessageItem {
  items: MessageItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

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
  history: MessageHistoryItem[];
}
export interface UpdateTitleResponse {
  conversationId: ConversationId;
  title: string;
  lastUpdatedAt: string;
}
// Enhanced UI state with better error handling
export interface LoadingState {
  createConversation: boolean;
  fetchConversations: boolean;
  sendMessage: boolean;
  fetchMessages: boolean;
  updateTitle: boolean;
  getUserConversations: boolean;
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
  conversations: Record<ConversationId, ConversationItem>;
  conversationSummaries: Record<UserId, ConversationSummary[]>;

  // UI state
  loading: LoadingState;
  errors: ErrorState;

  // // Cache management
  // lastFetch: {
  //   conversations?: string;
  //   messages?: Record<ConversationId, string>;
  // };

  // // ✅ Request tracking to prevent race conditions
  // pendingRequests: Set<string>; // Idempotency keys
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
