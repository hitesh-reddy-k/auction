import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Clock, DollarSign, User, Calendar, TrendingUp, Gavel, AlertCircle, CheckCircle } from 'lucide-react';

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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAuctionClosed = () => {
    return new Date(auction?.closing_date) <= new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Auction Not Found</h2>
          <p className="text-slate-600">The auction you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwner = user && auction.user_id === user.id;
  const canBid = isAuthenticated && !isOwner && !isAuctionClosed();
  const isClosed = isAuctionClosed();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 mb-4 transition-colors"
          >
            ← Back to Auctions
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{auction.title}</h1>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        isClosed 
                          ? 'bg-red-500/20 text-red-100' 
                          : 'bg-green-500/20 text-green-100'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isClosed ? 'bg-red-300' : 'bg-green-300 animate-pulse'}`}></div>
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
                      Your Auction
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-slate-700 leading-relaxed">{auction.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Starting Price</p>
                      <p className="text-lg font-bold text-slate-900">${auction.starting_price}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Owner</p>
                      <p className="text-lg font-semibold text-slate-900">{auction.owner_username}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Closing Date</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(auction.closing_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Total Bids</p>
                      <p className="text-lg font-bold text-slate-900">{auction.bid_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            )}

            {/* Bid History for Owner */}
            {isOwner && bidHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Bid History
                </h3>
                <div className="space-y-3">
                  {bidHistory.map((bid, index) => (
                    <div 
                      key={bid.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{bid.username}</p>
                          <p className="text-xs text-slate-500">{formatDate(bid.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">${bid.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Current Price Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Current Price</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <p className="text-4xl font-bold text-slate-900">{auction.current_price}</p>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full"></div>
                </div>
              </div>

              {/* Bidding Section */}
              {canBid && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-blue-600" />
                    Place Your Bid
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bid Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500">$</span>
                        </div>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={parseFloat(auction.current_price) + 0.01}
                          step="0.01"
                          required
                          className="block w-full pl-7 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Your balance:</span>
                        <span className="font-semibold text-slate-900">${user?.balance}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleBid}
                      disabled={bidding}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30"
                    >
                      {bidding ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Placing Bid...
                        </span>
                      ) : (
                        'Place Bid'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!isAuthenticated && !isClosed && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 text-center">
                  <Gavel className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Bid?</h3>
                  <p className="text-slate-700 mb-4">Login to participate in this auction</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login to Bid
                  </button>
                </div>
              )}

              {isClosed && (
                <div className="bg-slate-100 rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Auction Ended</h3>
                  <p className="text-slate-600">This auction has closed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;