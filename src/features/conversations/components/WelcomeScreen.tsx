import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../../redux/hook';
import { selectUserFirstName } from '../../auth/redux/authSelectors';

/**
 * Welcome screen component that appears when there's no active conversation
 * or when starting a new chat
 */
function WelcomeScreen() {
  const userGivenName = useAppSelector(selectUserFirstName);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 4,
        textAlign: 'center',
        minHeight: '60vh',
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 600,
        }}
      >
        {/* DeepSeek Logo */}
        <motion.img
          src="/deepseek-logo.svg"
          alt="DeepSeek AI Logo"
          style={{
            width: 80,
            height: 80,
            marginBottom: 32,
            opacity: 0.9
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />

        {/* Main Welcome Message */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={600}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          How can I help you today?
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Hello! {userGivenName}, I'm AxIS , an AI assistant based on Link Development polices and here to help.
        </Typography>

        {/* Feature List */}
        {/* <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mt: 2,
            width: '100%',
          }}
        >
          {[
            '💡 Explain to me point based promotion system',
            '✍️ Writing & editing',
            '🧠 Problem solving',
            '🎨 Creative content',
            '📊 Data analysis',
            '💻 Programming help'
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
            >
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  backgroundColor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'left',
                }}
              >
                {feature}
              </Typography>
            </motion.div>
          ))}
        </Box> */}

        {/* Call to Action */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 4,
            fontStyle: 'italic',
          }}
        >
          Start a conversation by typing a message below! 👇
        </Typography>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;