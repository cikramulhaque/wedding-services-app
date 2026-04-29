import React, { useState, useEffect } from 'react';

const ArtistList = ({ categoryId, categoryName, onArtistSelect, onBack }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`http://localhost/backend/get_artists.php?category_id=${categoryId}`);
        const data = await response.json();

        if (data.success) {
          setArtists(data.artists);
        } else {
          setError(data.error || 'Failed to load artists.');
        }
      } catch (err) {
        setError('Network error. Check your backend connection.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchArtists();
    }
  }, [categoryId]);

  if (loading) return <div style={styles.message}>Loading top artists...</div>;
  if (error) return <div style={{...styles.message, color: 'red'}}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>&larr; Back to Categories</button>
        <h2>{categoryName} Artists</h2>
      </div>
      
      {artists.length === 0 ? (
        <p style={styles.message}>No artists found for this category yet.</p>
      ) : (
        <div style={styles.grid}>
          {artists.map((artist) => (
            <div 
              key={artist.id} 
              style={styles.card}
              onClick={() => onArtistSelect(artist.id)}
            >
              {/* Image Box - shows gray placeholder if no image URL exists in DB yet */}
              <div style={styles.imageBox}>
                {artist.thumbnail ? (
                  <img src={artist.thumbnail} alt={artist.name} style={styles.image} />
                ) : (
                  <span style={styles.noImageText}>No Image Available</span>
                )}
              </div>
              
              <div style={styles.info}>
                <h3 style={styles.name}>{artist.name}</h3>
                <p style={styles.rating}>⭐ {artist.rating} / 5.0</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple styles keeping the grid layout clean
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '20px'
  },
  backButton: {
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  card: {
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  imageBox: {
    width: '100%',
    height: '180px',
    backgroundColor: '#e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImageText: {
    color: '#888',
    fontSize: '14px'
  },
  info: {
    padding: '15px',
    textAlign: 'center'
  },
  name: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    color: '#333'
  },
  rating: {
    margin: '0',
    color: '#f39c12',
    fontWeight: 'bold'
  },
  message: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  }
};

export default ArtistList;