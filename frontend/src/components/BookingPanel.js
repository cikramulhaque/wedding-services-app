import React, { useState, useEffect } from 'react';

const BookingPanel = ({ currentUser, artistId }) => {
  const [booking, setBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if a booking already exists on load
  useEffect(() => {
    fetchStatus();
  }, [currentUser, artistId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost/backend/book_api.php?action=check_status&user_id=${currentUser.id}&artist_id=${artistId}`);
      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (err) {
      console.error("Failed to fetch booking status", err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: User clicks "Book Now"
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate) return alert("Please select a date.");
    
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost/backend/book_api.php?action=create_booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          artist_id: artistId,
          booking_date: bookingDate
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchStatus(); // Refresh to show payment step
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: User clicks "Simulate Payment"
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost/backend/book_api.php?action=process_payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id })
      });
      const data = await response.json();
      if (data.success) {
        alert("Payment successful! Contact details are now unlocked.");
        fetchStatus(); // Refresh to show unlocked contact info
      }
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div>Loading booking status...</div>;

  return (
    <div style={styles.card}>
      <h3 style={{ marginTop: 0 }}>Booking & Contact</h3>
      
      {/* STATE 1: NO BOOKING YET */}
      {!booking && (
        <form onSubmit={handleCreateBooking} style={styles.form}>
          <div style={styles.lockedBox}>
            🔒 <strong>Contact locked.</strong> Book this artist to reveal their phone number and email.
          </div>
          <label>Select Event Date:</label>
          <input 
            type="date" 
            value={bookingDate} 
            onChange={(e) => setBookingDate(e.target.value)} 
            style={styles.input}
            required
          />
          <button type="submit" disabled={isProcessing} style={styles.bookBtn}>
            {isProcessing ? 'Processing...' : 'Reserve Date'}
          </button>
        </form>
      )}

      {/* STATE 2: BOOKING CREATED, PENDING PAYMENT */}
      {booking && booking.payment_status === 'pending' && (
        <div style={styles.pendingBox}>
          <h4>Date Reserved: {booking.booking_date}</h4>
          <p>Your date is held. Please complete payment to finalize and unlock contact details.</p>
          <div style={styles.lockedBox}>
            🔒 <strong>{booking.contact_info}</strong>
          </div>
          <button onClick={handlePayment} disabled={isProcessing} style={styles.payBtn}>
            {isProcessing ? 'Processing...' : 'Simulate Payment'}
          </button>
        </div>
      )}

      {/* STATE 3: PAID AND UNLOCKED */}
      {booking && booking.payment_status === 'completed' && (
        <div style={styles.successBox}>
          <h4 style={{ color: '#28a745' }}>✓ Booking Confirmed</h4>
          <p><strong>Date:</strong> {booking.booking_date}</p>
          <hr style={{ borderColor: '#c3e6cb' }} />
          <div>
            <strong>🔓 Unlocked Contact Info:</strong><br />
            <span style={styles.contactText}>{booking.contact_info}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    fontFamily: 'sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  bookBtn: {
    padding: '12px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  payBtn: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px'
  },
  lockedBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '14px'
  },
  pendingBox: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    padding: '15px',
    borderRadius: '4px'
  },
  successBox: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724',
    padding: '15px',
    borderRadius: '4px'
  },
  contactText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
    display: 'inline-block',
    marginTop: '5px'
  }
};

export default BookingPanel;