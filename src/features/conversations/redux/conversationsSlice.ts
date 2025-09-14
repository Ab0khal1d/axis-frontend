import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  ConversationsState,
  Message,
  LoadingState,
  ErrorState,
  ConversationItem,
  MessageHistoryItem,
} from "../types";
import conversationsService from "../services/conversationsApi";

// Async thunk for fetching user conversations
export const fetchUserConversations = createAsyncThunk(
  'conversations/fetchUserConversations',
  async (params: { userId: string; pageNumber?: number; pageSize?: number }) => {
    const response = await conversationsService.getUserConversations(params);
    return response.data?.conversations?.items || [];
  }
);

// Async thunk for fetching conversation messages
export const fetchConversationMessages = createAsyncThunk(
  'conversations/fetchConversationMessages',
  async (conversationId: string) => {
    const response = await conversationsService.getConversationMessages(conversationId);
    return {
      conversationId,
      messages: response.data?.messages || []
    };
  }
);

// Async thunk for sending a message (normal request-response)
export const sendMessage = createAsyncThunk(
  'conversations/sendMessage',
  async (
    params: {
      conversationId: string;
      content: string;
      parentMessageId: string;
      history: any[];
    },
    { dispatch, rejectWithValue }
  ) => {
    const { conversationId } = params;

    try {
      // Send message to backend
      const response = await conversationsService.sendMessage(params);

      // Fetch updated messages for the conversation
      await dispatch(fetchConversationMessages(conversationId));

      return {
        conversationId,
        response
      };
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to send message';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for creating a new conversation and setting it as active
export const createConversation = createAsyncThunk(
  'conversations/createConversation',
  async (_, { rejectWithValue }) => {
    try {
      // Create new conversation via API
      const response = await conversationsService.createConversation();

      // Extract conversation ID from response
      const conversationId = typeof response === 'string' ? response : response.data;

      if (!conversationId || typeof conversationId !== 'string') {
        throw new Error('No valid conversation ID returned from server');
      }

      // Create a new conversation object with default values
      const newConversation: ConversationItem = {
        id: conversationId,
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: null, // Will be set by backend
        messages: []
      };

      return {
        conversationId,
        conversation: newConversation
      };
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to create conversation';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for updating conversation title
export const updateConversationTitleAsync = createAsyncThunk(
  'conversations/updateConversationTitleAsync',
  async (params: {
    conversationId: string;
    history: MessageHistoryItem[];
  }, { rejectWithValue }) => {
    try {
      const response = await conversationsService.updateConversationTitle(params);
      return {
        conversationId: params.conversationId,
        title: response.data?.title
      };
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || 'Failed to update conversation title';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state - simplified without optimistic messaging or streaming
const initialState: ConversationsState = {
  activeConversationId: null,
  conversations: {},
  conversationSummaries: {},

  // Loading states
  loading: {
    createConversation: false,
    fetchConversations: false,
    sendMessage: false,
    fetchMessages: false,
    updateTitle: false,
    getUserConversations: false,
  },

  // Error handling
  errors: {
    global: undefined,
    createConversation: undefined,
    fetchConversations: undefined,
    sendMessage: undefined,
    fetchMessages: undefined,
    updateTitle: undefined,
    deleteConversation: undefined,
    validation: [],
  },

};

export const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    // Set the active conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },

    // Clear conversation errors
    clearError: (
      state,
      action: PayloadAction<{ key?: keyof ErrorState } | void>
    ) => {
      if (action.payload?.key) {
        // Clear specific error
        const { key } = action.payload;
        if (key === "validation") {
          state.errors.validation = [];
        } else {
          (state.errors as any)[key] = undefined;
        }
      } else {
        // Clear all errors
        state.errors = {
          validation: [],
        };
      }
    },

    // For local state changes
    updateConversationTitle: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const { id, title } = action.payload;
      if (state.conversations[id]) {
        state.conversations[id].title = title;
      }
    },

    // Remove conversation from local state
    removeConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const { [conversationId]: removed, ...rest } = state.conversations;
      state.conversations = rest;

      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
      }
    },

    // Set loading state
    setLoading: (
      state,
      action: PayloadAction<{ key: keyof LoadingState; value: boolean }>
    ) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },

    // Set error state
    setError: (
      state,
      action: PayloadAction<{ key: keyof ErrorState; value: string | null }>
    ) => {
      const { key, value } = action.payload;
      if (key === "validation") {
        // Handle validation errors separately
        return;
      }
      (state.errors as any)[key] = value;
    },

    // Set conversations from API response
    setConversations: (state, action: PayloadAction<ConversationItem[]>) => {
      const conversations = action.payload;
      const conversationsRecord: Record<string, ConversationItem> = {};

      conversations.forEach((conversation) => {
        conversationsRecord[conversation.id] = conversation;
      });

      state.conversations = conversationsRecord;
    },

    // Set messages for a specific conversation
    setConversationMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) => {
      const { conversationId, messages } = action.payload;

      if (state.conversations[conversationId]) {
        state.conversations[conversationId].messages = messages;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user conversations
      .addCase(fetchUserConversations.pending, (state) => {
        state.loading.getUserConversations = true;
        state.errors.fetchConversations = undefined;
      })
      .addCase(fetchUserConversations.fulfilled, (state, action) => {
        state.loading.getUserConversations = false;
        const conversations = action.payload;
        const conversationsRecord: Record<string, ConversationItem> = {};

        conversations.forEach((conversation) => {
          conversationsRecord[conversation.id] = conversation;
        });

        state.conversations = conversationsRecord;
        // state.lastFetch.conversations = new Date().toISOString();
      })
      .addCase(fetchUserConversations.rejected, (state, action) => {
        state.loading.getUserConversations = false;
        state.errors.fetchConversations = action.error.message || 'Failed to fetch conversations';
      })
      // Fetch conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading.fetchMessages = true;
        state.errors.fetchMessages = undefined;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading.fetchMessages = false;
        const { conversationId, messages } = action.payload;

        if (state.conversations[conversationId]) {
          state.conversations[conversationId].messages = messages;
        }
        // if (state.lastFetch.messages) {
        //   state.lastFetch.messages[conversationId] = new Date().toISOString();
        // }
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading.fetchMessages = false;
        state.errors.fetchMessages = action.error.message || 'Failed to fetch messages';
      })
      // Send message
      .addCase(sendMessage.pending, (state, action) => {
        state.loading.sendMessage = true;
        // temporatly add message to state for optimistic UI
        const msg = action.meta.arg.content;
        const conversationId = action.meta.arg.conversationId;
        const conversation = state.conversations[conversationId];
        if (conversation) {
          const newMessage: Message = {
            id: `temp-${Date.now()}`, // Temporary ID
            conversationId,
            author: "User",
            content: msg,
            createdAt: new Date().toISOString(),
          };
          conversation.messages = [...(conversation.messages || []), newMessage];
        }
        state.errors.sendMessage = undefined;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading.sendMessage = false;
        // Messages are refreshed automatically by the thunk
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sendMessage = false;
        state.errors.sendMessage = action.payload as string || 'Failed to send message';
      })
      // Update conversation title
      .addCase(updateConversationTitleAsync.pending, (state) => {
        state.loading.updateTitle = true;
        state.errors.updateTitle = undefined;
      })
      .addCase(updateConversationTitleAsync.fulfilled, (state, action) => {
        state.loading.updateTitle = false;
        const { conversationId, title } = action.payload;
        if (state.conversations[conversationId] && title) {
          state.conversations[conversationId].title = title;
        }
      })
      .addCase(updateConversationTitleAsync.rejected, (state, action) => {
        state.loading.updateTitle = false;
        state.errors.updateTitle = action.payload as string || action.error.message || 'Failed to update title';
      })
      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.loading.createConversation = true;
        state.errors.createConversation = undefined;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading.createConversation = false;
        const { conversationId, conversation } = action.payload;

        // Add the new conversation to the state
        state.conversations[conversationId] = conversation;

        // Set as active conversation
        state.activeConversationId = conversationId;

        // state.lastFetch.conversations = new Date().toISOString();
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading.createConversation = false;
        state.errors.createConversation = action.payload as string || 'Failed to create conversation';
      });
  },
});

export const {
  setActiveConversation,
  clearError,
  updateConversationTitle,
  removeConversation,
  setLoading,
  setError,
  setConversations,
  setConversationMessages,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;
