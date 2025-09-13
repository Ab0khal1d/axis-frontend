/**
 * Interfaces for chat components
 */

// Chat message type
export type MessageRole = 'user' | 'ai' | 'system';

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
  actions?: React.ReactNode;
}

// Message props
export interface ChatMessageProps {
  message: Message;
}

// Message list props
export interface ChatMessageListProps {
  messages: Message[];
  loading?: boolean;
}

// Input props
export interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}