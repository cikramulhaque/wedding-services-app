import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ currentUser, artist, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!currentUser || !artist) return;
    try {
      const response = await fetch(`http://localhost/backend/chat_api.php?action=get_messages&user_id=${currentUser.id}&artist_id=${artist.id}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  // Set up polling every 3 seconds
  useEffect(() => {
    fetchMessages(); // Initial fetch
    const pollInterval = setInterval(fetchMessages, 3000);
    
    // Cleanup interval when component unmounts
    return () => clearInterval(pollInterval);
  }, [currentUser, artist]);

  // Scroll to bottom whenever messages array updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSending(true);
    const tempMessage = inputValue;
    setInputValue(''); // Clear input immediately for better UX

    try {
      const response = await fetch('http://localhost/backend/chat_api.php?action=send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          artist_id: artist.id,
          message: tempMessage
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.violation_flagged) {
          alert("WARNING: Your message contained prohibited contact information. This violation has been recorded.");
        }
        fetchMessages(); // Instantly refresh chat after sending
      }
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Error sending message.");
      setInputValue(tempMessage); // Restore input on failure
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>&larr; Back</button>
        <h2 style={{ margin: 0 }}>Chat with {artist.name}</h2>
      </div>

      {/* Strict Warning Banner */}
      <div style={styles.warningBanner}>
        <strong>SECURITY NOTICE:</strong> Direct contact sharing (Phones, Emails, URLs, WhatsApp) is strictly prohibited before booking. Violations are tracked and may result in account suspension.
      </div>

      {/* Message History Area */}
      <div style={styles.chatBox}>
        {messages.length === 0 ? (
          <p style={styles.emptyText}>No messages yet. Say hello to {artist.name}!</p>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === 'user';
            return (
              <div key={index} style={{
                ...styles.messageWrapper,
                justifyContent: isMe ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  ...styles.bubble,
                  backgroundColor: isMe ? '#007BFF' : '#E9ECEF',
                  color: isMe ? '#FFF' : '#000'
                }}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          style={styles.input}
          disabled={isSending}
          maxLength="500"
        />
        <button type="submit" style={styles.sendButton} disabled={isSending || !inputValue.trim()}>
          {isSending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

// Clean styling for the chat interface
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '70vh', // Takes up 70% of viewport height
    fontFamily: 'sans-serif',
    backgroundColor: '#fff'
  },
  header: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
  },
  backButton: {
    padding: '6px 12px',
    cursor: 'pointer',
    backgroundColor: '#e2e6ea',
    border: '1px solid #dae0e5',
    borderRadius: '4px'
  },
  warningBanner: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '10px',
    fontSize: '12px',
    textAlign: 'center',
    borderBottom: '1px solid #ffeeba'
  },
  chatBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fbfbfb'
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: '20px'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    padding: '10px 15px',
    borderRadius: '18px',
    maxWidth: '75%',
    wordWrap: 'break-word',
    fontSize: '15px',
    lineHeight: '1.4'
  },
  inputArea: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px'
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    marginRight: '10px',
    fontSize: '15px',
    outline: 'none'
  },
  sendButton: {
    padding: '0 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Chat;