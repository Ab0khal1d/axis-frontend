import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import type { RootState } from '../../../redux/store';
import {
  addOptimisticMessage,
  removeConversation,
  setActiveConversation,
  updateConversationTitle
} from '../redux/conversationsSlice';
import {
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useGetConversationMessagesQuery,
  useGetUserConversationsQuery,
  useSendMessageMutation,
  useUpdateConversationTitleMutation
} from '../services/conversationsApi';
import type { Message, MessageRole } from '../types';

/**
 * Custom hook for managing conversations
 * Combines Redux state and RTK Query for a complete API
 */
export const useConversations = () => {
  const dispatch = useDispatch();
  const activeConversationId = useSelector((state: RootState) => state.conversations.activeConversationId);
  const conversations = useSelector((state: RootState) => state.conversations.conversations);
  const loading = useSelector((state: RootState) => state.conversations.loading);
  const error = useSelector((state: RootState) => state.conversations.errors);

  // RTK Query hooks
  const { refetch: refetchConversations } = useGetUserConversationsQuery();
  const { refetch: refetchActiveConversation } = useGetConversationMessagesQuery(
    activeConversationId ?? '',
    { skip: !activeConversationId }
  );

  const [createConversationTrigger] = useCreateConversationMutation();
  const [sendMessageTrigger] = useSendMessageMutation();
  const [updateTitleTrigger] = useUpdateConversationTitleMutation();
  const [deleteConversationTrigger] = useDeleteConversationMutation();

  // Active conversation data
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations[activeConversationId] || null;
  }, [activeConversationId, conversations]);

  // Sorted conversation list for UI
  const conversationList = useMemo(() => {
    return Object.values(conversations).sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [conversations]);

  // Select a conversation
  const selectConversation = useCallback((id: string | null) => {
    dispatch(setActiveConversation(id));
    if (id) {
      refetchActiveConversation();
    }
  }, [dispatch, refetchActiveConversation]);

  // Create a new conversation
  const createConversation = useCallback(async () => {
    try {
      const result = await createConversationTrigger().unwrap();
      if (result.success && result.data) {
        selectConversation(result.data);
        await refetchConversations();
        return result.data;
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
    return null;
  }, [createConversationTrigger, selectConversation, refetchConversations]);

  // Send a message and get AI response
  const sendMessage = useCallback(async (
    content: string,
    parentMessageId?: string
  ) => {
    if (!activeConversationId) {
      // Create a new conversation if needed
      const newConversationId = await createConversation();
      if (!newConversationId) return;

      // Add optimistic message
      const optimisticMessage: Message = {
        id: uuidv7(),
        conversationId: newConversationId,
        author: 'user' as MessageRole,
        content,
        createdAt: new Date().toISOString(),
      };

      dispatch(addOptimisticMessage({
        conversationId: newConversationId,
        message: optimisticMessage
      }));

      // Send actual message to API
      await sendMessageTrigger({
        conversationId: newConversationId,
        content,
        parentMessageId,
        history: [],
      });
      return;
    }

    // Add optimistic message to existing conversation
    const optimisticMessage: Message = {
      id: uuidv4(),
      conversationId: activeConversationId,
      parentMessageId,
      author: 'user' as MessageRole,
      content,
      createdAt: new Date().toISOString(),
    };

    dispatch(addOptimisticMessage({
      conversationId: activeConversationId,
      message: optimisticMessage
    }));

    // Send actual message to API
    await sendMessageTrigger({
      conversationId: activeConversationId,
      content,
      parentMessageId,
      history: [],
    });
  }, [
    activeConversationId,
    createConversation,
    dispatch,
    sendMessageTrigger,
    refetchActiveConversation
  ]);

  // Update conversation title
  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    // Optimistic update
    dispatch(updateConversationTitle({ id: conversationId, title }));

    try {
      await updateTitleTrigger({ conversationId, title });
      await refetchConversations();
    } catch (err) {
      console.error('Failed to update title:', err);
      await refetchConversations(); // Revert if failed
    }
  }, [dispatch, updateTitleTrigger, refetchConversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Optimistic update
      dispatch(removeConversation(conversationId));

      await deleteConversationTrigger(conversationId);
      await refetchConversations();

      // Clear active conversation if deleted
      if (activeConversationId === conversationId) {
        dispatch(setActiveConversation(null));
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      await refetchConversations(); // Revert if failed
    }
  }, [
    dispatch,
    deleteConversationTrigger,
    refetchConversations,
    activeConversationId
  ]);

  return {
    // State
    conversations: conversationList,
    activeConversationId,
    activeConversation,
    loading,
    error,

    // Actions
    selectConversation,
    createConversation,
    sendMessage,
    updateTitle,
    deleteConversation,
    refetchConversations,
  };
};

export default useConversations;