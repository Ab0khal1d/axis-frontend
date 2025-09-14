import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApiResponse,
  Conversation,
  CreateConversationResponse,
  GetConversationMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  UpdateConversationTitleRequest
} from '../types';

// Base API configuration
export const conversationsApi = createApi({
  reducerPath: 'conversationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/Conversations',
    credentials: 'include',
  }),
  tagTypes: ['Conversation', 'Message'],
  endpoints: (builder) => ({
    // Get all conversations for the current user
    getUserConversations: builder.query<ApiResponse<Conversation[]>, void>({
      query: () => ``,
      providesTags: (result) =>
        result?.success && result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: 'Conversation' as const, id })),
            { type: 'Conversation', id: 'LIST' },
          ]
          : [{ type: 'Conversation', id: 'LIST' }],
    }),

    // Create a new conversation
    createConversation: builder.mutation<ApiResponse<CreateConversationResponse>, void>({
      query: () => ({
        url: ``,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),

    // Get messages for a specific conversation
    getConversationMessages: builder.query<ApiResponse<GetConversationMessagesResponse>, string>({
      query: (conversationId) => `/${conversationId}/messages`,
      providesTags: (_, __, id) => [
        { type: 'Message', id },
        { type: 'Conversation', id },
      ],
    }),

    // Send a new message
    sendMessage: builder.mutation<ApiResponse<SendMessageResponse>, SendMessageRequest & { conversationId: string }>({
      query: (payload) => ({
        url: `/${payload.conversationId}/messages`,
        method: 'POST',
        body: {
          content: payload.content,
          parentMessageId: payload.parentMessageId,
          history: payload.history,
        },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Message', id: arg.conversationId },
        { type: 'Conversation', id: arg.conversationId },
      ],
    }),

    // Update conversation title
    updateConversationTitle: builder.mutation<void, UpdateConversationTitleRequest>({
      query: (payload) => ({
        url: `/${payload.conversationId}/title`,
        method: 'PUT',
        body: {
          title: payload.title,
        },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: 'Conversation', id: arg.conversationId },
      ],
    }),

    // Delete conversation (soft delete)
    deleteConversation: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Conversation', id },
        { type: 'Conversation', id: 'LIST' },
      ],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetUserConversationsQuery,
  useCreateConversationMutation,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useUpdateConversationTitleMutation,
  useDeleteConversationMutation,
} = conversationsApi;