import React, { useState, useEffect } from 'react';

const Categories = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories from the PHP API when the component mounts
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost/backend/get_categories.php');
        const data = await response.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          setError(data.error || 'Failed to load categories.');
        }
      } catch (err) {
        setError('Network error. Make sure XAMPP and your backend are running.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div style={styles.message}>Loading categories...</div>;
  if (error) return <div style={{...styles.message, color: 'red'}}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Select a Service</h2>
      
      <div style={styles.grid}>
        {categories.map((category) => (
          <div 
            key={category.id} 
            style={styles.card}
            onClick={() => onCategorySelect(category.id, category.name)}
          >
            {/* Visual placeholder for category icons/images */}
            <div style={styles.iconPlaceholder}>
              {category.name.charAt(0)}
            </div>
            <h3 style={styles.cardTitle}>{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styling for a clean, grid-based UI
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '25px'
  },
  card: {
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    padding: '30px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  cardTitle: {
    margin: '0',
    color: '#444',
    fontSize: '18px'
  },
  iconPlaceholder: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#007BFF',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    fontWeight: 'bold',
    margin: '0 auto 20px auto'
  },
  message: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  }
};

export default Categories;