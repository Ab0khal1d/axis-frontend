import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Conversation,
  ConversationsState,
  Message,
  LoadingState,
  ErrorState,
} from '../types';
import { conversationsApi } from '../services/conversationsApi';

// Enhanced initial state with enterprise patterns
const initialState: ConversationsState = {
  activeConversationId: null,
  conversations: {},
  conversationSummaries: {},

  // Enhanced loading states
  loading: {
    createConversation: false,
    fetchConversations: false,
    sendMessage: false,
    fetchMessages: false,
    updateTitle: false,
    deleteConversation: false,
  },

  // Enhanced error handling
  errors: {
    validation: [],
  },

  // Stream management and cache
  streamingMessages: {},

  // Cache and offline support
  lastFetch: {
    conversations: undefined,
    messages: {},
  },

  // Optimistic updates
  optimisticMessages: {},
};

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    // Set the active conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },

    // Clear conversation errors
    clearError: (state) => {
      state.errors = {
        validation: [],
      };
    },

    // For optimistic updates or local state changes
    updateConversationTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      if (state.conversations[id]) {
        state.conversations[id].title = title;
      }
    },

    // Add optimistic message (before API response)
    addOptimisticMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;

      if (state.conversations[conversationId]) {
        state.conversations[conversationId].messages.push(message);
        state.conversations[conversationId].lastMessageAt = new Date().toISOString();
      }

      // Add to optimistic messages
      state.optimisticMessages[message.id] = message;
    },

    // Remove optimistic message when confirmed
    removeOptimisticMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      delete state.optimisticMessages[messageId];
    },

    // Remove conversation from local state (useful for cleanup)
    removeConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const { [conversationId]: removed, ...rest } = state.conversations;
      state.conversations = rest;

      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
      }
    },

    // Update streaming message
    updateStreamingMessage: (state, action: PayloadAction<{ conversationId: string; content: string }>) => {
      const { conversationId, content } = action.payload;

      if (!state.streamingMessages[conversationId]) {
        // Create a new streaming message
        const messageId = `temp-${Date.now()}`;
        state.streamingMessages[conversationId] = {
          id: messageId,
          conversationId,
          parentMessageId: undefined,
          author: 'assistant',
          content,
          createdAt: new Date().toISOString(),
          isStreaming: true,
          chunks: [content],
        };
      } else {
        // Update existing streaming message
        state.streamingMessages[conversationId].content += content;
        state.streamingMessages[conversationId].chunks.push(content);
      }
    },

    // Finalize streaming message
    finalizeStreamingMessage: (state, action: PayloadAction<{ conversationId: string; finalMessage: Message }>) => {
      const { conversationId, finalMessage } = action.payload;

      // Remove from streaming
      delete state.streamingMessages[conversationId];

      // Add to conversation
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].messages.push(finalMessage);
        state.conversations[conversationId].lastMessageAt = finalMessage.createdAt;
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<{ key: keyof LoadingState; value: boolean }>) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },

    // Set error state
    setError: (state, action: PayloadAction<{ key: keyof ErrorState; value: string | null }>) => {
      const { key, value } = action.payload;
      if (key === 'validation') {
        // Handle validation errors separately
        return;
      }
      (state.errors as any)[key] = value;
    },
  },
  extraReducers: (builder) => {
    // Handle API interactions with proper error handling
    builder
      // Get user conversations
      .addMatcher(
        conversationsApi.endpoints.getUserConversations.matchPending,
        (state) => {
          state.loading.fetchConversations = true;
          state.errors.fetchConversations = undefined;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.getUserConversations.matchFulfilled,
        (state, { payload }) => {
          state.loading.fetchConversations = false;

          if (payload.success && payload.data) {
            // Transform array to record for efficient lookups
            const conversationsRecord: Record<string, Conversation> = {};
            payload.data.forEach((conversation) => {
              conversationsRecord[conversation.id] = conversation;
            });

            state.conversations = conversationsRecord;
            state.lastFetch.conversations = new Date().toISOString();
          }
        }
      )
      .addMatcher(
        conversationsApi.endpoints.getUserConversations.matchRejected,
        (state, { error }) => {
          state.loading.fetchConversations = false;
          state.errors.fetchConversations = error.message || 'Failed to fetch conversations';
        }
      )

      // Create conversation
      .addMatcher(
        conversationsApi.endpoints.createConversation.matchPending,
        (state) => {
          state.loading.createConversation = true;
          state.errors.createConversation = undefined;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.createConversation.matchFulfilled,
        (state, { payload }) => {
          state.loading.createConversation = false;

          if (payload.success && payload.data) {
            // Set the new conversation as active
            state.activeConversationId = payload.data;
          }
        }
      )
      .addMatcher(
        conversationsApi.endpoints.createConversation.matchRejected,
        (state, { error }) => {
          state.loading.createConversation = false;
          state.errors.createConversation = error.message || 'Failed to create conversation';
        }
      )

      // Send message
      .addMatcher(
        conversationsApi.endpoints.sendMessage.matchPending,
        (state) => {
          state.loading.sendMessage = true;
          state.errors.sendMessage = undefined;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.sendMessage.matchFulfilled,
        (state) => {
          state.loading.sendMessage = false;
          // Message will be handled by streaming or separate fetch
        }
      )
      .addMatcher(
        conversationsApi.endpoints.sendMessage.matchRejected,
        (state, { error }) => {
          state.loading.sendMessage = false;
          state.errors.sendMessage = error.message || 'Failed to send message';
        }
      )

      // Get conversation messages
      .addMatcher(
        conversationsApi.endpoints.getConversationMessages.matchPending,
        (state) => {
          state.loading.fetchMessages = true;
          state.errors.fetchMessages = undefined;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.getConversationMessages.matchFulfilled,
        (state, { payload }) => {
          state.loading.fetchMessages = false;

          if (payload.success && payload.data) {
            const conversation = payload.data.conversation;

            // Update conversation in state with all messages included
            state.conversations[conversation.id] = conversation;

            // Update cache timestamp
            if (!state.lastFetch.messages) {
              state.lastFetch.messages = {};
            }
            state.lastFetch.messages[conversation.id] = new Date().toISOString();
          }
        }
      )
      .addMatcher(
        conversationsApi.endpoints.getConversationMessages.matchRejected,
        (state, { error }) => {
          state.loading.fetchMessages = false;
          state.errors.fetchMessages = error.message || 'Failed to fetch messages';
        }
      )

      // Update conversation title
      .addMatcher(
        conversationsApi.endpoints.updateConversationTitle.matchPending,
        (state) => {
          state.loading.updateTitle = true;
          state.errors.updateTitle = undefined;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.updateConversationTitle.matchFulfilled,
        (state) => {
          state.loading.updateTitle = false;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.updateConversationTitle.matchRejected,
        (state, { error }) => {
          state.loading.updateTitle = false;
          state.errors.updateTitle = error.message || 'Failed to update title';
        }
      )

      // Delete conversation
      .addMatcher(
        conversationsApi.endpoints.deleteConversation.matchPending,
        (state) => {
          state.loading.deleteConversation = true;
          state.errors.deleteConversation = undefined;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.deleteConversation.matchFulfilled,
        (state) => {
          state.loading.deleteConversation = false;
        }
      )
      .addMatcher(
        conversationsApi.endpoints.deleteConversation.matchRejected,
        (state, { error }) => {
          state.loading.deleteConversation = false;
          state.errors.deleteConversation = error.message || 'Failed to delete conversation';
        }
      );
  },
});

export const {
  setActiveConversation,
  clearError,
  updateConversationTitle,
  addOptimisticMessage,
  removeOptimisticMessage,
  removeConversation,
  updateStreamingMessage,
  finalizeStreamingMessage,
  setLoading,
  setError,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;