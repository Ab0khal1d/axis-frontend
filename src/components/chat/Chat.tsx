import { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import type { Message } from './types';
import type { Conversation } from '../../data/mockData';
import MenuIcon from '@mui/icons-material/Menu';

// Helper function to format date in a readable format
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

interface ChatProps {
  conversation: Conversation | null;
  onConversationUpdate?: (updatedConversation: Conversation) => void;
  onToggleSidebar?: () => void;
}

/**
 * Main Chat component that integrates all chat sub-components
 * Styled to match DeepSeek UI
 */
const Chat = ({
  conversation,
  onConversationUpdate,
  onToggleSidebar
}: ChatProps) => {
  // Local state for messages based on the provided conversation
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update messages when conversation changes
  useEffect(() => {
    setMessages(conversation?.messages || []);
  }, [conversation]);

  // Function to handle sending a new message
  const handleSendMessage = (content: string) => {
    // Create a new user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add the user message to the list
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update conversation if callback provided
    if (onConversationUpdate) {
      // If no active conversation, create a new one
      if (!conversation) {
        onConversationUpdate({
          id: `new-${Date.now()}`,
          title: content.length > 30 ? `${content.substring(0, 30)}...` : content,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: updatedMessages
        });
      } else {
        onConversationUpdate({
          ...conversation,
          messages: updatedMessages,
          updatedAt: new Date()
        });
      }
    }

    // Simulate AI response (this would be replaced with actual API call)
    setLoading(true);

    // Different sample responses based on prompt content
    setTimeout(() => {
      let responseContent = 'I\'m DeepSeek Chat, an AI assistant. I can help you with information, writing, creative tasks, and problem-solving. How else can I assist you today?';

      // Simple response logic based on user's query
      if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
        responseContent = 'Hello! I\'m DeepSeek Chat, your AI assistant. How can I help you today?';
      } else if (content.toLowerCase().includes('help')) {
        responseContent = 'I can help with a wide range of tasks including answering questions, drafting content, solving problems, and providing creative ideas. What specific assistance do you need?';
      } else if (content.toLowerCase().includes('feature') || content.toLowerCase().includes('can you')) {
        responseContent = 'As DeepSeek Chat, I can perform various tasks such as answering questions, writing content, summarizing information, generating creative ideas, coding assistance, and helping with problem-solving. Is there a specific feature you\'d like to explore?';
      } else if (content.toLowerCase().includes('code') || content.toLowerCase().includes('example')) {
        responseContent = 'Here\'s a simple React component example:\n\n```jsx\nimport React, { useState } from \'react\';\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h2>Counter: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n      <button onClick={() => setCount(count - 1)}>Decrement</button>\n    </div>\n  );\n};\n\nexport default Counter;\n```\n\nYou can use this component to create a simple counter in your React application. Is there anything specific you\'d like me to explain about this code?';
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: responseContent,
        timestamp: new Date(),
      };

      const messagesWithAiResponse = [...updatedMessages, aiMessage];
      setMessages(messagesWithAiResponse);
      setLoading(false);

      // Update conversation again with AI response if callback provided
      if (onConversationUpdate) {
        // If no active conversation, create a new one with the AI response
        if (!conversation) {
          onConversationUpdate({
            id: `new-${Date.now()}`,
            title: content.length > 30 ? `${content.substring(0, 30)}...` : content,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: messagesWithAiResponse
          });
        } else {
          onConversationUpdate({
            ...conversation,
            messages: messagesWithAiResponse,
            updatedAt: new Date()
          });
        }
      }
    }, 1500);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: theme.palette.background.default
      }}
    >
      {/* Mobile menu toggle button */}
      {isMobile && (
        <IconButton
          size="small"
          color="inherit"
          aria-label="menu"
          onClick={onToggleSidebar}
          sx={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 1200,
            color: theme.palette.text.secondary
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Only show ChatHeader when there is an active conversation */}
      {conversation && (
        <ChatHeader
          title={conversation.title}
          subtitle={`DeepSeek Chat · ${formatDate(conversation.createdAt)}`}
        />
      )}

      <ChatMessageList
        messages={messages}
        loading={loading}
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={loading}
        placeholder="Send a message..."
      />
    </Box>
  );
};

export default Chat;