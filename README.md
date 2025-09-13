# Enterprise AI Chatbot UI

A production-ready, enterprise-level AI chatbot UI/UX with a design inspired by Claude and other modern AI assistants. This project is built using React, TypeScript, and Material-UI.

## Features

- **Claude-like Interface**: Modern, clean design with sidebar for conversation history
- **Responsive Design**: Works across mobile and desktop devices
- **Conversation History**: View and manage previous conversations
- **Dark/Light Mode**: Toggle between dark and light themes
- **Profile Settings**: User profile and settings menu
- **Production-Ready Code Structure**: Well-organized component architecture
- **TypeScript**: Full type safety throughout the application
- **Material-UI**: Enterprise-grade UI component library

## Project Structure

```
src/
├── assets/               # Static assets like images
├── components/
│   ├── chat/            # Chat components (messages, input, etc.)
│   │   ├── Chat.tsx     # Main chat component
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatMessageList.tsx
│   │   ├── index.ts
│   │   └── types.ts     # Type definitions for chat components
│   ├── layout/          # Layout components
│   │   ├── Header.tsx   # Top header with user profile
│   │   ├── MainLayout.tsx # Main layout structure
│   │   └── index.ts
│   └── sidebar/         # Sidebar components
│       ├── Sidebar.tsx  # Conversation history sidebar
│       └── index.ts
├── data/
│   └── mockData.ts      # Mock conversation data
├── theme/
│   └── theme.ts         # MUI theme configuration
├── App.css
├── App.tsx              # Main application component
├── index.css
├── main.tsx             # Entry point
└── vite-env.d.ts
```
```
