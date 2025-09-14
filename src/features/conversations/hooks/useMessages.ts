import { useCallback, useEffect, useState } from "react";
import conversationsService from "../services/conversationsApi";
import type { Message } from "../types";

interface UseMessagesOptions {
  conversationId?: string | null;
  autoFetch?: boolean;
  pageSize?: number;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMessages: () => Promise<void>;
  fetchMoreMessages: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearMessages: () => void;
}

/**
 * Custom hook for managing messages in a conversation
 * Provides pagination, loading states, and error handling
 */
export const useMessages = (
  options: UseMessagesOptions = {}
): UseMessagesReturn => {
  const { conversationId, autoFetch = true, pageSize = 20 } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch messages for the conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await conversationsService.getConversationMessages(
        conversationId
      );

      if (response.success && response.data?.messages) {
        // Convert MessageItem to Message format
        const convertedMessages: Message[] = response.data.messages.map(msg => ({
          ...msg,
          conversationId: conversationId,
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          createdAt: msg.createdAt || new Date().toISOString()
        }));
        setMessages(convertedMessages);
        setHasMore(false); // Simple messages endpoint doesn't support pagination
        setCurrentPage(1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch messages");
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading]);

  // Fetch more messages (for pagination)
  const fetchMoreMessages = useCallback(async () => {
    if (!conversationId || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response =
        await conversationsService.getConversationMessagesPaginated({
          conversationId,
          pageNumber: currentPage + 1,
          pageSize,
        });

      if (response.success && response.data?.messages) {
        const newMessages = response.data.messages.items || [];
        // Convert MessageItem to Message format
        const convertedMessages: Message[] = newMessages.map(msg => ({
          ...msg,
          conversationId: conversationId,
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          createdAt: msg.createdAt || new Date().toISOString()
        }));
        setMessages((prev) => [...prev, ...convertedMessages]);
        setHasMore(response.data.messages.hasNextPage || false);
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch more messages");
      console.error("Failed to fetch more messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading, hasMore, currentPage, pageSize]);

  // Refresh messages (reset pagination)
  const refreshMessages = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(false);
    await fetchMessages();
  }, [fetchMessages]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setHasMore(false);
    setCurrentPage(1);
  }, []);

  // Auto-fetch messages when conversationId changes
  useEffect(() => {
    if (autoFetch && conversationId) {
      fetchMessages();
    } else if (!conversationId) {
      clearMessages();
    }
  }, [conversationId, autoFetch, fetchMessages, clearMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    fetchMessages,
    fetchMoreMessages,
    refreshMessages,
    clearMessages,
  };
};

export default useMessages;
