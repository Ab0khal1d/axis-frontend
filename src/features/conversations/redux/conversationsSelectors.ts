/**
 * Enterprise-grade selectors for the conversations feature
 * Optimized with memoization and computed properties
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../redux/store';
import type {
  ConversationId,
  ConversationSummary,
  Conversation,
  Message,
} from '../types';

// Base selectors
const selectConversationsState = (state: RootState) => state.conversations;

export const selectActiveConversationId = createSelector(
  selectConversationsState,
  (conversationsState) => conversationsState.activeConversationId
);

export const selectAllConversations = createSelector(
  selectConversationsState,
  (conversationsState) => Object.values(conversationsState.conversations)
);

export const selectConversationsRecord = createSelector(
  selectConversationsState,
  (conversationsState) => conversationsState.conversations
);

export const selectConversationById = (conversationId: ConversationId) =>
  createSelector(
    selectConversationsRecord,
    (conversations) => conversations[conversationId]
  );

export const selectActiveConversation = createSelector(
  selectConversationsRecord,
  selectActiveConversationId,
  (conversations, activeId) =>
    activeId ? conversations[activeId] : null
);

// Loading selectors
export const selectLoadingStates = createSelector(
  selectConversationsState,
  (conversationsState) => conversationsState.loading
);

export const selectIsLoading = createSelector(
  selectLoadingStates,
  (loading) => Object.values(loading).some(Boolean)
);

export const selectIsCreatingConversation = createSelector(
  selectLoadingStates,
  (loading) => loading.createConversation
);

export const selectIsFetchingConversations = createSelector(
  selectLoadingStates,
  (loading) => loading.fetchConversations
);

export const selectIsSendingMessage = createSelector(
  selectLoadingStates,
  (loading) => loading.sendMessage
);

export const selectIsFetchingMessages = createSelector(
  selectLoadingStates,
  (loading) => loading.fetchMessages
);

// Error selectors
export const selectErrors = createSelector(
  selectConversationsState,
  (conversationsState) => conversationsState.errors
);

export const selectHasErrors = createSelector(
  selectErrors,
  (errors) => {
    return Object.values(errors).some(error => {
      if (Array.isArray(error)) {
        return error.length > 0;
      }
      return error !== null && error !== undefined;
    });
  }
);

export const selectValidationErrors = createSelector(
  selectErrors,
  (errors) => errors.validation || []
);

// Message selectors
export const selectActiveConversationMessages = createSelector(
  selectActiveConversation,
  (activeConversation) => activeConversation?.messages || []
);

export const selectMessagesByConversationId = (conversationId: ConversationId) =>
  createSelector(
    selectConversationById(conversationId),
    (conversation) => conversation?.messages || []
  );

// Streaming selectors
export const selectStreamingMessages = createSelector(
  selectConversationsState,
  (conversationsState) => conversationsState.streamingMessages
);

// Optimistic updates selectors
export const selectOptimisticMessages = createSelector(
  selectConversationsState,
  (conversationsState) => conversationsState.optimisticMessages
);

export const selectOptimisticMessagesByConversationId = (conversationId: ConversationId) =>
  createSelector(
    selectOptimisticMessages,
    (optimisticMessages) =>
      Object.values(optimisticMessages).filter((msg: Message) => msg.conversationId === conversationId)
  );

// Conversation list selectors with sorting and filtering
export const selectSortedConversations = createSelector(
  selectAllConversations,
  (conversations) =>
    [...conversations].sort((a: Conversation, b: Conversation) => {
      const aTime = new Date(a.lastMessageAt || a.createdAt).getTime();
      const bTime = new Date(b.lastMessageAt || b.createdAt).getTime();
      return bTime - aTime; // Most recent first
    })
);

export const selectConversationSummaries = createSelector(
  selectSortedConversations,
  (conversations) =>
    conversations.map((conversation: Conversation): ConversationSummary => ({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      createdAtUtc: conversation.createdAt,
      lastActivityAtUtc: conversation.lastMessageAt || conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
      messageCount: conversation.messages.length,
    }))
);

// Utility selectors
export const selectConversationCount = createSelector(
  selectAllConversations,
  (conversations) => conversations.length
);

export const selectHasActiveConversation = createSelector(
  selectActiveConversationId,
  (activeId) => activeId !== null
);

export const selectCanSendMessage = createSelector(
  selectHasActiveConversation,
  selectIsSendingMessage,
  (hasActive, isSending) => hasActive && !isSending
);