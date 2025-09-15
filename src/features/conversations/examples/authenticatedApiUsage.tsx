/**
 * Example Usage Guide for Authenticated Enterprise API Client
 * 
 * This file demonstrates how to use the Enterprise API  const handleFetchConversations = async () => {
    try {
      const conversations = await fetchConversations();
      console.log('Fetched conversations:', conversations);
      // Handle successful response
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      // Handle error
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation();
      console.log('Created conversation:', newConversation);
      // Handle successful response
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Handle error
    }
  };

  const handleSendMessage = async () => {
    try {
      await sendMessageWithAuth('conv-123', 'Hello!', 'parent-msg-123');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      await sendMessageWithAuth('conv-123', 'Hello!', 'parent-msg-123');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }; authentication
 */

import { conversationsService } from '../services/conversationsApi';
import { useAppSelector } from '../../../redux/hook';
import { selectIsAuthenticated, selectUser } from '../../auth/redux/authSelectors';

// Example: React Hook for authenticated API calls
export const useAuthenticatedApiExample = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Example 1: Simple GET request (automatically includes Bearer token)
  const fetchConversations = async () => {
    if (!isAuthenticated) {
      console.warn('User not authenticated');
      return;
    }

    try {
      const response = await conversationsService.listConversations({
        pageNumber: 1,
        pageSize: 20
      });

      console.log('Conversations:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      // Error handling is already done by Enterprise API Client
      throw error;
    }
  };

  // Example 2: POST request with data (automatically includes Bearer token)
  const createConversation = async () => {
    if (!isAuthenticated) {
      console.warn('User not authenticated');
      return;
    }

    try {
      const response = await conversationsService.createConversation();
      console.log('New conversation created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  // Example 3: Server-Sent Events with authentication
  const streamMessagesWithAuth = async (conversationId: string) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated');
      return;
    }

    try {
      // Get the async generator for streaming messages
      const messageStream = await conversationsService.streamMessages(conversationId);

      // Consume the stream
      for await (const messageChunk of messageStream) {
        console.log('Received message chunk:', messageChunk.data);

        // Process the message chunk in your UI
        // messageChunk.data contains the MessageChunk data with content
        if (messageChunk.data.content) {
          // Update your UI with the content
          console.log('Message content:', messageChunk.data.content);
        }

        // Handle end of stream (you may need to implement your own completion logic)
        // This depends on your backend implementation
      }
    } catch (error) {
      console.error('SSE streaming failed:', error);
      throw error;
    }
  };

  // Example 4: Send message with proper request format
  const sendMessageWithAuth = async (conversationId: string, message: string, parentMessageId: string) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated');
      return;
    }

    try {
      const response = await conversationsService.sendMessage({
        conversationId,
        content: message,
        parentMessageId,
        history: [] // Add message history as needed
      });

      console.log('Message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user,
    fetchConversations,
    createConversation,
    streamMessagesWithAuth,
    sendMessageWithAuth,
  };
};

// Example: React Component using authenticated API
export const ExampleConversationComponent: React.FC = () => {
  const {
    isAuthenticated,
    user,
    fetchConversations,
    createConversation,
    sendMessageWithAuth
  } = useAuthenticatedApiExample();

  const handleFetchConversations = async () => {
    try {
      const conversations = await fetchConversations();
      console.log('Fetched conversations:', conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation();
      console.log('Created conversation:', newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      await sendMessageWithAuth('conv-123', 'Hello!', 'parent-msg-123');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to access conversations</div>;
  }

  return (
    <div>
      <h2>Welcome, {user?.displayName}!</h2>
      <button onClick={handleFetchConversations}>
        Fetch Conversations
      </button>
      <button onClick={handleCreateConversation}>
        Create New Conversation
      </button>
      <button onClick={handleSendMessage}>
        Send Message
      </button>
    </div>
  );
};

/**
 * Key Benefits of This Implementation:
 * 
 * 1. **Automatic Authentication**: 
 *    - Every API call automatically includes the Bearer token
 *    - No need to manually handle token attachment
 * 
 * 2. **Token Refresh Handling**:
 *    - Automatically retries failed requests with refreshed tokens
 *    - Handles 401 errors gracefully
 * 
 * 3. **Error Handling**:
 *    - Comprehensive error logging and handling
 *    - Consistent error format across all API calls
 * 
 * 4. **SSE Authentication**:
 *    - Server-Sent Events include authentication tokens
 *    - Automatic reconnection with fresh tokens
 * 
 * 5. **Development Experience**:
 *    - Type-safe API calls with full TypeScript support
 *    - Consistent API across all conversation operations
 *    - Easy to use and integrate with Redux state
 */