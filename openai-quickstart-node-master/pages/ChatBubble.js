import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AccountCircle, AndroidOutlined } from '@mui/icons-material';

const ChatBubble = ({ text, sender, align }) => {
  const bubbleStyle = {
    backgroundColor: sender === 'user' ? '#f3f3f3' : '#e1f5fe',
    color: sender === 'user' ? '#000' : '#000',
    borderRadius: '8px',
    padding: '8px 16px',
    marginBottom: '8px',
    display: 'inline-block',
    maxWidth: '80%',
    boxShadow: 'none',
  };

  const userIcon = <AccountCircle sx={{ fontSize: 24 }} />;
  const systemIcon = <AndroidOutlined sx={{ fontSize: 24 }} />;

  const bubbleIcon = sender === 'user' ? userIcon : sender === 'system' ? systemIcon : null;

  return (
    <Box display="flex" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}>
      <Paper elevation={2} sx={bubbleStyle}>
        {sender === 'system' && (
          <Box display="flex" alignItems="center" mb={1}>
            {bubbleIcon && align === 'left' && <Box mr={1}>{bubbleIcon}</Box>}
            <Typography variant="caption">{sender}</Typography>
            {bubbleIcon && align !== 'left' && <Box ml={1}>{bubbleIcon}</Box>}
          </Box>
        )}
        {sender === 'user' && (
          <Box display="flex" alignItems="center" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'} mb={1}>
            {bubbleIcon && align === 'left' && <Box mr={1}>{bubbleIcon}</Box>}
            <Typography variant="caption">User</Typography>
            {bubbleIcon && align !== 'left' && <Box ml={1}>{bubbleIcon}</Box>}
          </Box>
        )}
        <Box display="flex" alignItems="center">
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {text}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatBubble;