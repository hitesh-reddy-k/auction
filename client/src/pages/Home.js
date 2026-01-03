import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      const response = await api.get('/auctions');
      setAuctions(response.data);
    } catch (err) {
      setError('Failed to load auctions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="loading">Loading auctions...</div>;
  }

  return (
    <div className="container">
      <div className="auctions-header">
        <h1>Active Auctions</h1>
        {isAuthenticated && (
          <Link to="/create" className="btn-create">
            Create Auction
          </Link>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {auctions.length === 0 ? (
        <div className="empty-state">
          <h3>No active auctions</h3>
          <p>Be the first to create an auction!</p>
        </div>
      ) : (
        <div className="auctions-grid">
          {auctions.map((auction) => (
            <Link
              key={auction.id}
              to={`/${auction.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="auction-card">
                <h3>{auction.title}</h3>
                <p>{auction.description.substring(0, 100)}...</p>
                <div className="auction-price">
                  Current Bid: ${auction.current_price}
                </div>
                <div className="auction-meta">
                  <span>By: {auction.owner_username}</span>
                  <span>Closes: {formatDate(auction.closing_date)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
