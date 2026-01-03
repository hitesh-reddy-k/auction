import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AuctionDetail = () => {
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bidding, setBidding] = useState(false);

  const { id } = useParams();
  const { user, isAuthenticated, updateUserBalance } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadAuction();
    if (isAuthenticated) {
      loadBidHistory();
    }
  }, [id, isAuthenticated]);

  const loadAuction = async () => {
    try {
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
      setBidAmount((parseFloat(response.data.current_price) + 0.01).toFixed(2));
    } catch (err) {
      setError('Failed to load auction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBidHistory = async () => {
    try {
      const response = await api.get(`/auctions/${id}/bids`);
      setBidHistory(response.data);
    } catch (err) {
      // Only owner can see bid history, so ignore 403 errors
      if (err.response?.status !== 403) {
        console.error('Failed to load bid history:', err);
      }
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBidding(true);

    try {
      await api.post('/bids', {
        auction_id: parseInt(id),
        amount: parseFloat(bidAmount),
      });

      setSuccess('Bid placed successfully!');
      
     
      await loadAuction();
      
      const newBalance = parseFloat(user.balance) - parseFloat(bidAmount);
      updateUserBalance(newBalance);

      if (auction && auction.user_id === user.id) {
        await loadBidHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const isAuctionClosed = () => {
    return new Date(auction?.closing_date) <= new Date();
  };

  if (loading) {
    return <div className="loading">Loading auction...</div>;
  }

  if (!auction) {
    return <div className="error">Auction not found</div>;
  }

  const isOwner = user && auction.user_id === user.id;
  const canBid = isAuthenticated && !isOwner && !isAuctionClosed();

  return (
    <div className="container">
      <div className="auction-detail">
        <h1>{auction.title}</h1>
        
        <div className="auction-info">
          <p><strong>Description:</strong></p>
          <p>{auction.description}</p>
          
          <p><strong>Starting Price:</strong> ${auction.starting_price}</p>
          <p><strong>Current Price:</strong> <span className="auction-price">${auction.current_price}</span></p>
          <p><strong>Owner:</strong> {auction.owner_username}</p>
          <p><strong>Closing Date:</strong> {formatDate(auction.closing_date)}</p>
          <p><strong>Total Bids:</strong> {auction.bid_count}</p>
          <p><strong>Status:</strong> {isAuctionClosed() ? 'Closed' : 'Active'}</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {canBid && (
          <div className="bid-section">
            <h3>Place Your Bid</h3>
            <form onSubmit={handleBid} className="bid-form">
              <div className="form-group">
                <label>Your Bid Amount ($)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={parseFloat(auction.current_price) + 0.01}
                  step="0.01"
                  required
                />
                <small>Your balance: ${user?.balance}</small>
              </div>
              <button type="submit" className="btn-primary" disabled={bidding}>
                {bidding ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </form>
          </div>
        )}

        {!isAuthenticated && !isAuctionClosed() && (
          <div className="bid-section">
            <p>Please <a href="/login">login</a> to place a bid.</p>
          </div>
        )}

        {isOwner && bidHistory.length > 0 && (
          <div className="bid-history">
            <h3>Bid History</h3>
            <div className="bid-list">
              {bidHistory.map((bid) => (
                <div key={bid.id} className="bid-item">
                  <div>
                    <div className="bid-user">{bid.username}</div>
                    <div className="bid-time">{formatDate(bid.created_at)}</div>
                  </div>
                  <div className="bid-amount">${bid.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;
