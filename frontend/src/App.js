import React, { useState, useEffect } from 'react';
import './App.css'; // Add basic styling here

const API_URL = 'http://localhost/backend/api.php';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, categories, artists, profile, chat
  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // --- Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const res = await fetch(`${API_URL}?action=login`, {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    setUser(data.user);
    loadCategories();
  };

  const loadCategories = async () => {
    const res = await fetch(`${API_URL}?action=categories`);
    setCategories(await res.json());
    setView('categories');
  };

  const loadArtists = async (categoryId) => {
    const res = await fetch(`${API_URL}?action=artists&category_id=${categoryId}`);
    setArtists(await res.json());
    setSelectedCategory(categoryId);
    setView('artists');
  };

  const loadProfile = async (artistId) => {
    const res = await fetch(`${API_URL}?action=artist_profile&artist_id=${artistId}&user_id=${user.id}`);
    setSelectedArtist(await res.json());
    setView('profile');
  };

  const handleBooking = async () => {
    await fetch(`${API_URL}?action=book`, {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, artist_id: selectedArtist.id })
    });
    alert("Payment successful! Contact info unlocked.");
    loadProfile(selectedArtist.id); // Reload to reveal contact
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Wedding Marketplace</h1>
      
      {view === 'login' && (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input name="username" placeholder="Enter username" required />
          <button type="submit">Enter</button>
        </form>
      )}

      {view === 'categories' && (
        <div>
          <h2>Select a Service</h2>
          {categories.map(c => (
            <button key={c.id} onClick={() => loadArtists(c.id)} style={{ margin: '5px' }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {view === 'artists' && (
        <div>
          <button onClick={() => setView('categories')}>Back to Categories</button>
          <h2>Artists</h2>
          {artists.map(a => (
            <div key={a.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{a.name} (Rating: {a.rating})</h3>
              <button onClick={() => loadProfile(a.id)}>View Profile</button>
            </div>
          ))}
        </div>
      )}

      {view === 'profile' && selectedArtist && (
        <div>
          <button onClick={() => setView('artists')}>Back</button>
          <h2>{selectedArtist.name}</h2>
          <p>Rating: {selectedArtist.rating}</p>
          <div style={{ background: '#f0f0f0', padding: '10px' }}>
            <strong>Contact Info: </strong> {selectedArtist.contact_info}
          </div>
          <br/>
          <button onClick={handleBooking} style={{ background: 'green', color: 'white' }}>
            Pay & Book (Unlocks Contact)
          </button>
          <button onClick={() => setView('chat')} style={{ marginLeft: '10px' }}>
            Chat with Artist
          </button>
        </div>
      )}

      {view === 'chat' && (
        <Chat user={user} artist={selectedArtist} goBack={() => setView('profile')} />
      )}
    </div>
  );
}

// --- Chat Component ---
function Chat({ user, artist, goBack }) {
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');

  const loadMessages = async () => {
    const res = await fetch(`${API_URL}?action=get_messages&user_id=${user.id}&artist_id=${artist.id}`);
    setMessages(await res.json());
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Simple polling
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput) return;
    await fetch(`${API_URL}?action=send_message`, {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, artist_id: artist.id, message: msgInput })
    });
    setMsgInput('');
    loadMessages();
  };

  return (
    <div>
      <button onClick={goBack}>Back to Profile</button>
      <h2>Chat with {artist.name}</h2>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', color: m.sender === 'user' ? 'blue' : 'black' }}>
            <p><b>{m.sender}:</b> {m.message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ marginTop: '10px' }}>
        <input 
          value={msgInput} 
          onChange={(e) => setMsgInput(e.target.value)} 
          placeholder="Type a message... (Emails/Phones blocked)" 
          style={{ width: '70%' }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;