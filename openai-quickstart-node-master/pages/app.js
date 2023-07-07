import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubble from './ChatBubble';

const App = ({ showSendButton = true, showUploadButton = true, showClearButton = true }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessageToStorage = (messageObj) => {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    localStorage.setItem('messages', JSON.stringify([...storedMessages, messageObj]));
  };

  const sendMessage = async () => {
    try {
      const newMessage = { text: message, sender: 'user', save: true };

      if (newMessage.save) {
        saveMessageToStorage(newMessage);
      }

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      ////AKKI

      let responseMessage;


      const response = await fetch("http://localhost:5000/getData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ prompt: message }),
      });


      let data = await response.json();

      // const data = await response.json();
      console.log("akki fetched result " + data.toString());
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }



      // akki -> need to remove it
      // let data = {data: 'Unable to understand you'};

      let documentResponse;

      if (data.data.includes('Unable to understand you') || data.data.includes('does not provide')) {
        try {
          documentResponse = await fetch("/api/createEmbeddings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: message }),
          });

          if (documentResponse.status !== 200) {
            throw data.error || new Error(`Request failed with status ${documentResponse.status}`);
          }

          const data2 = await documentResponse.json();
          // setResult(data2.result);
          responseMessage = data2.result;
        }
        catch (error) {
          // Consider implementing your own error handling logic here
          console.error(error);
          alert(error.message);
        }

      }
      else {
        //setResult(data.data);
        responseMessage = data.data;
      }
      ////AKKI


      const apiMessage = { text: responseMessage, sender: 'system', save: true };

      if (apiMessage.save) {
        saveMessageToStorage(apiMessage);
      }

      setMessages((prevMessages) => [...prevMessages, apiMessage]);
      setMessage('');

      /*
      const response = await axios.post('/send_message', { message });

      if (response.data.hasOwnProperty('message')) {
        const apiMessage = { text: response.data.message, sender: 'system', save: true };

        if (apiMessage.save) {
          saveMessageToStorage(apiMessage);
        }

        setMessages((prevMessages) => [...prevMessages, apiMessage]);
      }

      setMessage('');
      */

    } catch (error) {
      console.error(error);
      const errorMessage = { text: `Failed to send message: ${error}`, sender: 'system', save: true };

      if (errorMessage.save) {
        saveMessageToStorage(errorMessage);
      }

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };


  const clearChat = () => {
    localStorage.removeItem('messages');
    setMessages([]);
  };

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(storedMessages);
  }, []);

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f5f5f5"
    >
      <Container maxWidth="sm">
        <Box
          height="calc(100vh - 200px)"
          bgcolor="#ffffff"
          borderRadius="4px"
          css={{ overflow: 'hidden' }}
        >
          <Box
            height="100%"
            overflow="auto"
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
            }}
            ref={chatContainerRef}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              padding="16px"
              borderRadius="4px"
            >
              <Typography variant="h4" align="center" mb={4}>
                Assistant
              </Typography>
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  text={message.text}
                  sender={message.sender}
                  align={message.sender === 'user' ? 'right' : 'left'}
                />
              ))}

            </Box>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" marginTop="16px">
          <TextField
            label="Type your message"
            variant="outlined"
            fullWidth
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            autoComplete="off"
          />
          {showSendButton && (
            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
              disabled={!message}
              sx={{ ml: 1 }}
            >
              <SendIcon />
            </Button>
          )}

          {showClearButton && (
            <Button
              variant="contained"
              color="secondary"
              onClick={clearChat}
              sx={{
                ml: 1,
                color: '#ffffff',
                backgroundColor: '#585859',
                '&:hover': {
                  backgroundColor: '#4d4d4d',
                },
              }}
            >
              <DeleteIcon />
            </Button>
          )}

        </Box>
      </Container>
    </Box>
  );
};

export default App;
