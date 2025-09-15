import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  Typography,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RetryIcon from "@mui/icons-material/Refresh";
import type { ChatProps } from "./types";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";
import WelcomeScreen from "./WelcomeScreen";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import {
  createConversation,
  fetchConversationMessages,
  sendMessage,
  updateConversationTitleAsync
} from "../redux/conversationsSlice";
import {
  selectActiveConversationId,
  selectActiveConversation,
  selectDisplayMessages,
  selectIsLoadingMessages,
  selectIsSendingMessage,
  selectMessagesError,
  selectSendMessageError
} from "../redux/conversationsSelectors";
import { emptyGuid } from "../../../common/consts/empty-guid";
import type { MessageHistoryItem } from "../types";

function Chat({ onToggleSidebar }: ChatProps) {
  // Redux setup
  const dispatch = useAppDispatch();

  // Redux state selectors
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const activeConversation = useAppSelector(selectActiveConversation);
  const displayMessages = useAppSelector(selectDisplayMessages);
  const isLoadingMessages = useAppSelector(selectIsLoadingMessages);
  const isSendingMessage = useAppSelector(selectIsSendingMessage);
  const messagesError = useAppSelector(selectMessagesError);
  const sendMessageError = useAppSelector(selectSendMessageError);
  // const canSendMessage = useAppSelector(selectCanSendMessageToChat);

  // Refs for performance optimization
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<number | undefined>(undefined);

  // Local UI state
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Compute last error from Redux state
  const lastError = messagesError || sendMessageError;

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId && !isSendingMessage) {
      dispatch(fetchConversationMessages(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  // Show error snackbar when errors occur
  useEffect(() => {
    if (lastError) {
      setShowErrorSnackbar(true);
    }
  }, [lastError]);  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, scrollToBottom]);

  // // Auto-retry logic for network errors
  // useEffect(() => {
  //   if (
  //     lastError &&
  //     (lastError.toLowerCase().includes("network") ||
  //       lastError.toLowerCase().includes("fetch"))
  //   ) {
  //     setIsRetrying(true);
  //     retryTimeoutRef.current = window.setTimeout(() => {
  //       if (activeConversationId) {
  //         dispatch(fetchConversationMessages(activeConversationId));
  //       }
  //       setIsRetrying(false);
  //     }, 3000);
  //   }
  // }, [lastError, activeConversationId, dispatch]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Simple message sending with normal request-response
  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        let currentConversationId = activeConversationId;
        let isNewlyCreated = false;

        // Check if no active conversation, create a new one
        if (!currentConversationId) {
          isNewlyCreated = true;
          const createResult = await dispatch(createConversation()).unwrap();
          // Use the returned conversationId directly
          currentConversationId = createResult.conversationId;
        }

        // Ensure we have a valid conversation ID before proceeding
        if (!currentConversationId) {
          throw new Error('Failed to get valid conversation ID');
        }

        // Send message and wait for response
        const res = await dispatch(sendMessage({
          conversationId: currentConversationId,
          content,
          parentMessageId: emptyGuid,
          history: displayMessages
        })).unwrap();

        // Update title based on new messages (only for newly created conversations)
        if (isNewlyCreated) {
          const history: MessageHistoryItem[] = [
            {
              author: "User",
              content,
            }, {
              author: "Assistant",
              content: res.response.data?.content || '',
            }];

          await dispatch(updateConversationTitleAsync({
            conversationId: currentConversationId,
            history: history
          })).unwrap();
        }

      } catch (error) {
        console.error("Error sending message:", error);
        setShowErrorSnackbar(true);
      }
    },
    [activeConversationId, displayMessages, dispatch]
  );

  // Enhanced title editing with validation
  const handleTitleEdit = useCallback(async () => {
    if (!activeConversationId) return;

    try {
      await dispatch(updateConversationTitleAsync({
        conversationId: activeConversationId,
        history: displayMessages
      })).unwrap();
    } catch (error) {
      console.error("Error updating title:", error);
      setShowErrorSnackbar(true);
    }
  }, [activeConversationId, displayMessages, dispatch]);

  // Manual retry handler
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setShowErrorSnackbar(false);
    if (activeConversationId && !isSendingMessage) {
      dispatch(fetchConversationMessages(activeConversationId)).finally(() => {
        setIsRetrying(false);
      });
    } else {
      setIsRetrying(false);
    }
  }, [activeConversationId, dispatch]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ height: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            position: "relative",
            bgcolor: theme.palette.background.default,
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
                position: "absolute",
                top: "12px",
                left: "12px",
                zIndex: 1200,
                color: theme.palette.text.secondary,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Sticky ChatHeader - outside scrollable area */}
          <AnimatePresence mode="wait">
            {activeConversation && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ChatHeader
                  title={activeConversation.title || "New Chat"}
                  subtitle={`DeepSeek Chat · ${new Date(
                    activeConversation.createdAt
                  ).toLocaleDateString()}`}
                  onTitleEdit={handleTitleEdit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable content area */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {activeConversationId ? (
              <ChatMessageList
                messages={displayMessages}
                loading={isLoadingMessages}
                errorMessage={lastError}
              />
            ) : (
              <WelcomeScreen />
            )}
            <div ref={messagesEndRef} />
          </Box>

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isSendingMessage}
            placeholder={
              isSendingMessage
                ? "Sending..."
                : "Send a message..."
            }
          />
        </Box>
      </motion.div>

      {/* Error snackbar with retry functionality */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowErrorSnackbar(false)}
          severity="error"
          variant="filled"
          action={
            lastError?.toLowerCase().includes("network") ? (
              <IconButton
                size="small"
                aria-label="retry"
                color="inherit"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <RetryIcon />
                )}
              </IconButton>
            ) : undefined
          }
        >
          {lastError}
        </Alert>
      </Snackbar>

      {/* Network status indicator */}
      {lastError && lastError.toLowerCase().includes("network") && (
        <Backdrop open sx={{ zIndex: theme.zIndex.snackbar + 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              p: 3,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[8],
            }}
          >
            <WifiOffIcon color="error" sx={{ fontSize: 48 }} />
            <Typography variant="h6" color="error">
              Connection Lost
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Please check your internet connection and try again.
            </Typography>
          </Box>
        </Backdrop>
      )}
    </>
  );
};

export default Chat;
