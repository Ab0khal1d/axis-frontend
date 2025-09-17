import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface SidebarLoadingProps {
  itemCount?: number;
}

const SidebarLoading: React.FC<SidebarLoadingProps> = ({ itemCount = 8 }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          px: 1,
          py: 1,
        }}
      >
        {/* Category skeleton */}
        <Box sx={{ px: 2, mb: 1 }}>
          <Skeleton
            variant="text"
            width={60}
            height={20}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
              borderRadius: '4px',
            }}
          />
        </Box>

        {/* Conversation item skeletons */}
        {Array.from({ length: itemCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: "easeOut"
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                mb: 0.5,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              {/* Conversation title skeleton */}
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton
                  variant="text"
                  width={`${Math.random() * 40 + 60}%`} // Random width between 60-100%
                  height={18}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '6px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': {
                        opacity: 1,
                      },
                      '50%': {
                        opacity: 0.4,
                      },
                      '100%': {
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* More options button skeleton */}
              <Skeleton
                variant="circular"
                width={20}
                height={20}
                sx={{
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.06)',
                }}
              />
            </Box>
          </motion.div>
        ))}

        {/* Additional category skeleton */}
        {itemCount > 4 && (
          <>
            <Box sx={{ px: 2, mb: 1, mt: 2 }}>
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                  borderRadius: '4px',
                }}
              />
            </Box>

            {/* Additional conversation skeletons */}
            {Array.from({ length: Math.min(itemCount - 4, 4) }).map((_, index) => (
              <motion.div
                key={`additional-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: (index + 4) * 0.05,
                  ease: "easeOut"
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    mb: 0.5,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton
                      variant="text"
                      width={`${Math.random() * 40 + 60}%`}
                      height={18}
                      sx={{
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.08)',
                        borderRadius: '6px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${index * 0.1}s`,
                      }}
                    />
                  </Box>
                  <Skeleton
                    variant="circular"
                    width={20}
                    height={20}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </Box>
              </motion.div>
            ))}
          </>
        )}

        {/* Shimmer effect overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(
              90deg,
              transparent 0%,
              ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.6)'
              } 50%,
              transparent 100%
            )`,
            animation: 'shimmer 2s infinite',
            '@keyframes shimmer': {
              '0%': {
                transform: 'translateX(-100%)',
              },
              '100%': {
                transform: 'translateX(100%)',
              },
            },
            pointerEvents: 'none',
            borderRadius: '8px',
          }}
        />
      </Box>
    </motion.div>
  );
};

export default SidebarLoading;