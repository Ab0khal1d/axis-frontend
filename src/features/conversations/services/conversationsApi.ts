/**
 * Conversations API service using Enterprise API Client
 * Implements OpenAPI 3.1.1 specification from webapi--v1.json
 *
 * Key endpoints:
 * - GET /api/conversations - List conversations with pagination
 * - POST /api/conversations - Create new conversation
 * - GET /api/conversations/{conversationId}/messages - Get conversation messages
 * - POST /api/conversations/{conversationId}/messages - Send message (SSE stream)
 * - PUT /api/conversations/{conversationId}/title - Update conversation title
 * - GET /api/conversations/user/{userId} - Get user's conversations
 */

import { apiClient } from "./enterpriseApiClient";
import type {
  ApiResponse,
  MessageItem,
  PaginatedListOfConversationItem,
  PaginatedListOfConversationItem2,
  PaginatedListOfMessageItem,
  SendMessageRequest,
  UpdateConversationTitleRequest,
} from "../types";

// OpenAPI-compliant response types
interface ListConversationsResponse {
  conversations: PaginatedListOfConversationItem2;
}

interface GetUserConversationsResponse {
  userId: string;
  conversations: PaginatedListOfConversationItem;
}

interface GetConversationMessagesResponse {
  conversationId: string;
  messages: MessageItem[];
}

interface GetConversationMessagesPaginatedResponse {
  conversationId: string;
  messages: PaginatedListOfMessageItem;
}

interface UpdateTitleResponse {
  title: string;
  lastUpdatedAt: string;
}

/**
 * Conversations API service functions using Enterprise API Client
 * Pure axios-based functions to replace RTK Query endpoints
 */
export const conversationsService = {
  /**
   * List all conversations with pagination (OpenAPI: ListConversations)
   */
  async listConversations(
    params: { pageNumber?: number; pageSize?: number } = {}
  ) {
    const { pageNumber = 1, pageSize = 20 } = params;

    try {
      const response = await apiClient.get<ListConversationsResponse>(
        `/api/conversations?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to fetch conversations",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },

  /**
   * Get conversations for current user (OpenAPI: GetUserConversations)
   */
  async getUserConversations(params: {
    userId: string;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const { userId, pageNumber = 1, pageSize = 20 } = params;

    try {
      const response = await apiClient.get<GetUserConversationsResponse>(
        `/api/conversations/user/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to fetch user conversations",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },

  /**
   * Create new conversation (OpenAPI: CreateConversation)
   */
  async createConversation() {
    try {
      // OpenAPI shows Request2 schema is empty object {}
      const response = await apiClient.post<string | null>(
        "/api/conversations",
        {}
      );
      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to create conversation",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },

  /**
   * Get messages for a conversation (OpenAPI: GetConversationMessages)
   */
  async getConversationMessages(conversationId: string) {
    try {
      const response = await apiClient.get<GetConversationMessagesResponse>(
        `/api/conversations/${conversationId}/messages`
      );
      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to fetch conversation messages",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },

  /**
   * Get paginated messages for a conversation (OpenAPI: GetConversationMessagesPaginated)
   */
  async getConversationMessagesPaginated(params: {
    conversationId: string;
    pageNumber?: number;
    pageSize?: number;
  }) {
    const { conversationId, pageNumber = 1, pageSize = 20 } = params;

    try {
      const response =
        await apiClient.get<GetConversationMessagesPaginatedResponse>(
          `/api/conversations/${conversationId}/messages/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to fetch paginated messages",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },

  /**
   * Send message to conversation (OpenAPI: SendMessage)
   */
  async sendMessage(params: SendMessageRequest & { conversationId: string }): Promise<ApiResponse<MessageItem>> {
    const { conversationId, ...messageData } = params;

    try {
      const response = await apiClient.post<MessageItem>(
        `/api/conversations/${conversationId}/messages`,
        messageData
      );

      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to send message",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },

  /**
   * Stream messages from conversation (SSE)
   */
  streamMessages(
    conversationId: string,
    options?: { headers?: Record<string, string> }
  ) {
    return apiClient.streamMessages(
      `/api/conversations/${conversationId}/messages`,
      options
    );
  },

  /**
   * Update conversation title (OpenAPI: UpdateConversationTitle)
   */
  async updateConversationTitle(
    params: UpdateConversationTitleRequest & { conversationId: string }
  ) {
    const { conversationId, ...titleData } = params;

    try {
      const response = await apiClient.put<UpdateTitleResponse>(
        `/api/conversations/${conversationId}/title`,
        titleData
      );
      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Failed to update conversation title",
        status: error.status,
        data: error.validation || error.code,
      };
    }
  },
};

// Enhanced utilities for working with enterprise client
export const conversationsApiUtils = {
  /**
   * Get enterprise client instance for direct usage
   */
  getClient: () => apiClient,

  /**
   * Dispose of resources (close SSE connections, etc.)
   */
  dispose: () => apiClient.dispose(),

  /**
   * Check if API is available
   */
  async healthCheck() {
    try {
      // Simple health check - adjust endpoint as needed
      await apiClient.get("/health");
      return true;
    } catch {
      return false;
    }
  },
};

// Export the service as the main API
export default conversationsService;
