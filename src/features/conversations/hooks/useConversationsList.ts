import { useCallback, useEffect, useState } from "react";
import conversationsService from "../services/conversationsApi";
import type { ConversationItem } from "../types";

interface UseConversationsListOptions {
  userId?: string;
  autoFetch?: boolean;
  pageSize?: number;
}

interface UseConversationsListReturn {
  conversations: ConversationItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchConversations: () => Promise<void>;
  fetchMoreConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  clearConversations: () => void;
}

/**
 * Custom hook for managing conversations list
 * Provides pagination, loading states, and error handling
 */
export const useConversationsList = (
  options: UseConversationsListOptions = {}
): UseConversationsListReturn => {
  const { userId, autoFetch = true, pageSize = 20 } = options;

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      if (userId) {
        // Fetch user-specific conversations
        response = await conversationsService.getUserConversations({
          userId,
          pageNumber: 1,
          pageSize,
        });
      } else {
        // Fetch all conversations
        response = await conversationsService.listConversations({
          pageNumber: 1,
          pageSize,
        });
      }

      if (response.success && response.data?.conversations) {
        const items = response.data.conversations.items || [];
        setConversations(items);
        setHasMore(response.data.conversations.hasNextPage || false);
        setCurrentPage(1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch conversations");
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, loading, pageSize]);

  // Fetch more conversations (for pagination)
  const fetchMoreConversations = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      if (userId) {
        response = await conversationsService.getUserConversations({
          userId,
          pageNumber: currentPage + 1,
          pageSize,
        });
      } else {
        response = await conversationsService.listConversations({
          pageNumber: currentPage + 1,
          pageSize,
        });
      }

      if (response.success && response.data?.conversations) {
        const newItems = response.data.conversations.items || [];
        setConversations((prev) => [...prev, ...newItems]);
        setHasMore(response.data.conversations.hasNextPage || false);
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch more conversations");
      console.error("Failed to fetch more conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, loading, hasMore, currentPage, pageSize]);

  // Refresh conversations (reset pagination)
  const refreshConversations = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(false);
    await fetchConversations();
  }, [fetchConversations]);

  // Clear conversations
  const clearConversations = useCallback(() => {
    setConversations([]);
    setError(null);
    setHasMore(false);
    setCurrentPage(1);
  }, []);

  // Auto-fetch conversations on mount
  useEffect(() => {
    if (autoFetch) {
      fetchConversations();
    }
  }, [autoFetch, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    hasMore,
    fetchConversations,
    fetchMoreConversations,
    refreshConversations,
    clearConversations,
  };
};

export default useConversationsList;
