import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../redux/store';
import type {
  ConversationId,
  ConversationSummary,
  Conversation,
  ConversationItem,
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
  (errors) => errors?.validation || []
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


// Conversation list selectors with sorting and filtering
export const selectSortedConversations = createSelector(
  selectAllConversations,
  (conversations) =>
    [...conversations].sort((a, b) => {
      const aTime = new Date((a as Conversation).lastMessageAt || (a as Conversation).createdAt).getTime();
      const bTime = new Date((b as Conversation).lastMessageAt || (b as Conversation).createdAt).getTime();
      return bTime - aTime; // Most recent first
    }) as Conversation[]
);

export const selectConversationSummaries = createSelector(
  selectSortedConversations,
  (conversations) =>
    conversations.map((conversation: Conversation): ConversationSummary => ({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.lastMessageAt || conversation.createdAt,
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

// Categorized conversations selector for Sidebar
export interface CategorizedConversations {
  today: ConversationItem[];
  yesterday: ConversationItem[];
  last7Days: ConversationItem[];
  last30Days: ConversationItem[];
  older: ConversationItem[];
}

export const selectCategorizedConversations = createSelector(
  selectAllConversations,
  (conversations): CategorizedConversations => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);

    const last30DaysStart = new Date(today);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);

    const sortedConversations = [...conversations].sort((a: any, b: any) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime; // Most recent first
    });

    return {
      today: sortedConversations.filter((conv: any) => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= today;
      }),
      yesterday: sortedConversations.filter((conv: any) => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= yesterday && date < today;
      }),
      last7Days: sortedConversations.filter((conv: any) => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= last7DaysStart && date < yesterday;
      }),
      last30Days: sortedConversations.filter((conv: any) => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date >= last30DaysStart && date < last7DaysStart;
      }),
      older: sortedConversations.filter((conv: any) => {
        const date = new Date(conv.updatedAt || conv.createdAt);
        return date < last30DaysStart;
      })
    };
  }
);

// Filtered categorized conversations selector with search
export const selectFilteredCategorizedConversations = (searchTerm: string) =>
  createSelector(
    selectCategorizedConversations,
    (categorized): CategorizedConversations => {
      if (!searchTerm) return categorized;

      const filter = (conversations: ConversationItem[]) =>
        conversations.filter(conv =>
          conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return {
        today: filter(categorized.today),
        yesterday: filter(categorized.yesterday),
        last7Days: filter(categorized.last7Days),
        last30Days: filter(categorized.last30Days),
        older: filter(categorized.older)
      };
    }
  );

// Selector for getting getUserConversations loading state
export const selectIsLoadingUserConversations = createSelector(
  selectLoadingStates,
  (loading) => loading.getUserConversations
);

// Selectors for Chat component
export const selectIsLoadingMessages = createSelector(
  selectLoadingStates,
  (loading) => loading.fetchMessages
);

export const selectMessagesError = createSelector(
  selectErrors,
  (errors) => errors?.fetchMessages
);

export const selectSendMessageError = createSelector(
  selectErrors,
  (errors) => errors?.sendMessage
);

// Updated selector to avoid conflicts with existing selectCanSendMessage
export const selectCanSendMessageToChat = createSelector(
  selectActiveConversationId,
  selectIsSendingMessage,
  (activeId, isSending) => activeId !== null && !isSending
);




// Simplified display messages selector for normal request-response pattern
export const selectDisplayMessages = createSelector(
  selectActiveConversationMessages,
  selectActiveConversationId,
  (messages, conversationId) => {
    return messages.map((msg: any) => ({
      id: msg.id || '',
      conversationId: conversationId || '',
      author: msg.author,
      content: msg.content,
      createdAt: msg.createdAt || new Date().toISOString(),
      timestamp: new Date(msg.createdAt || Date.now()),
    }))
  }
);
// export const selectDisplayMessages = createSelector(
//   selectActiveConversationMessages,
//   selectActiveConversationId,
//   (messages, conversationId) => {
//     return messages.map((msg: any) => ({
//       id: msg.id || '',
//       conversationId: conversationId || '',
//       author: msg.author,
//       content: msg.content,
//       createdAt: msg.createdAt || new Date().toISOString(),
//       timestamp: new Date(msg.createdAt || Date.now()),
//     })).sort((a: any, b: any) =>
//       new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//     );
//   }
// );
