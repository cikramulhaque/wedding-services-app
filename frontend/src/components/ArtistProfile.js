import React, { useState, useEffect } from 'react';

const ArtistProfile = ({ artistId, currentUser, onBack, onChat, onBook }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // We pass BOTH artist_id and user_id so the backend knows whether to unlock contacts
        const response = await fetch(`http://localhost/backend/get_artist_profile.php?artist_id=${artistId}&user_id=${currentUser.id}`);
        const data = await response.json();

        if (data.success) {
          setProfileData(data);
        } else {
          setError(data.error || 'Failed to load profile.');
        }
      } catch (err) {
        setError('Network error. Check your backend connection.');
      } finally {
        setLoading(false);
      }
    };

    if (artistId && currentUser) {
      fetchProfile();
    }
  }, [artistId, currentUser]);

  if (loading) return <div style={styles.message}>Loading artist profile...</div>;
  if (error) return <div style={{...styles.message, color: 'red'}}>{error}</div>;
  if (!profileData) return null;

  const { artist, portfolio, isBooked } = profileData;

  return (
    <div style={styles.container}>
      {/* Header & Navigation */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>&larr; Back to Listings</button>
      </div>

      {/* Profile Info Card */}
      <div style={styles.profileCard}>
        <div style={styles.mainInfo}>
          <h2 style={styles.name}>{artist.name}</h2>
          <p style={styles.rating}>⭐ {artist.rating} / 5.0</p>
          <p style={styles.details}>
            <strong>Location:</strong> {artist.location || 'Not specified'} <br/>
            <strong>Starting Price:</strong> ${artist.price || '0.00'}
          </p>
        </div>

        {/* Action Panel */}
        <div style={styles.actionPanel}>
          <div style={{...styles.contactBox, backgroundColor: isBooked ? '#e8f5e9' : '#ffebee'}}>
            <strong>Contact Info:</strong><br/>
            <span style={{ color: isBooked ? '#2e7d32' : '#c62828' }}>
              {artist.contact_info}
            </span>
          </div>

          <div style={styles.buttonGroup}>
            {!isBooked && (
              <button onClick={() => onBook(artist.id)} style={styles.bookButton}>
                Pay & Book (Unlock Contact)
              </button>
            )}
            <button onClick={() => onChat(artist)} style={styles.chatButton}>
              Chat with Artist
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <h3 style={{ marginTop: '30px' }}>Portfolio</h3>
      {portfolio.length === 0 ? (
        <p style={styles.message}>This artist hasn't uploaded any portfolio images yet.</p>
      ) : (
        <div style={styles.grid}>
          {portfolio.map((img) => (
            <div key={img.id} style={styles.imageBox}>
              <img src={img.image_url} alt="Portfolio item" style={styles.image} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styling
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  header: {
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  profileCard: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '20px',
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  mainInfo: {
    flex: '1 1 300px',
  },
  actionPanel: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    justifyContent: 'center'
  },
  name: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    color: '#333'
  },
  rating: {
    margin: '0 0 15px 0',
    color: '#f39c12',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  details: {
    lineHeight: '1.6',
    color: '#555',
    fontSize: '16px'
  },
  contactBox: {
    padding: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  chatButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  bookButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px'
  },
  imageBox: {
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: '#e9ecef',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  message: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  }
};

export default ArtistProfile;