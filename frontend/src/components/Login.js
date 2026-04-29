import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/backend/login_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // This is strictly required to attach the PHP session cookie to the browser
        credentials: 'include', 
        body: JSON.stringify({ username: username })
      });

      const data = await response.json();

      if (data.success) {
        // Pass the user object (id and username) up to your main App state
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to the server. Is XAMPP running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Welcome to Wedding Services</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.inputGroup}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Logging in...' : 'Login / Create Account'}
        </button>
      </form>
    </div>
  );
};

// Simple inline styles for a clean layout
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    backgroundColor: '#ffe6e6',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px'
  }
};

export default Login;