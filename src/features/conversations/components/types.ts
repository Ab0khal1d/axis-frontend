import type { ReactNode } from 'react';

/**
 * Chat component interfaces
 */

// Message role from backend API
export type MessageRole = 'user' | 'assistant' | 'system';

// Message interface
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// Header props
export interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  onlineStatus?: boolean;
  actions?: ReactNode;
  onTitleEdit?: (newTitle: string) => void;
}

// Message props
export interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

// Message list props
export interface ChatMessageListProps {
  messages: Message[];
  loading?: boolean;
  errorMessage?: string | null;
}

// Input props
export interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
  suggestions?: string[];
}

// Main Chat component props
export interface ChatProps {
  conversationId: string | null;
  onConversationCreate?: () => Promise<void>;
  onSendMessage?: (message: string, conversationId?: string) => Promise<void>;
  onTitleEdit?: (title: string, conversationId: string) => Promise<void>;
  onToggleSidebar?: () => void;
}

// Message with streaming interface
export interface StreamingMessage extends Message {
  isStreaming?: boolean;
  progress?: number; // 0-100
}