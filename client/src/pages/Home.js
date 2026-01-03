import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Clock, User, DollarSign, TrendingUp, Gavel, Search, Filter, AlertCircle, Package } from 'lucide-react';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, closing-soon
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (closingDate) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing - now;
    
    if (diff < 0) return 'Closed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  const isClosingSoon = (closingDate) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diff = closing - now;
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 && hours <= 24;
  };

  const isClosed = (closingDate) => {
    return new Date(closingDate) <= new Date();
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'active') {
      return matchesSearch && !isClosed(auction.closing_date);
    } else if (filterStatus === 'closing-soon') {
      return matchesSearch && isClosingSoon(auction.closing_date);
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Live Auctions</h1>
              <p className="text-blue-100 text-lg">Discover amazing items and place your bids</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Gavel className="w-4 h-4" />
                  <span className="font-semibold">{auctions.length} Active Listings</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">Real-time Bidding</span>
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create Auction
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
              >
                <option value="all">All Auctions</option>
                <option value="active">Active Only</option>
                <option value="closing-soon">Closing Soon</option>
              </select>
            </div>
          </div>
          
          {searchTerm && (
            <p className="text-sm text-slate-600 mt-3">
              Found {filteredAuctions.length} result{filteredAuctions.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {searchTerm ? 'No auctions found' : 'No active auctions'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters' 
                : 'Be the first to create an auction!'
              }
            </p>
            {isAuthenticated && !searchTerm && (
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-5 h-5" />
                Create Your First Auction
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => {
              const closed = isClosed(auction.closing_date);
              const closingSoon = isClosingSoon(auction.closing_date);
              
              return (
                <Link
                  key={auction.id}
                  to={`/${auction.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 h-full flex flex-col">
                    {/* Card Header */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-slate-50 p-6 border-b border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                            {auction.title}
                          </h3>
                        </div>
                        {closingSoon && !closed && (
                          <span className="flex-shrink-0 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Hot
                          </span>
                        )}
                        {closed && (
                          <span className="flex-shrink-0 bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-semibold">
                            Closed
                          </span>
                        )}
                      </div>
                      
                      {/* Price Display */}
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Current Bid</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <span className="text-2xl font-bold text-slate-900">
                            {auction.current_price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {auction.description}
                      </p>
                      
                      {/* Card Footer */}
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{auction.owner_username}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className={`font-semibold ${
                              closed ? 'text-slate-500' :
                              closingSoon ? 'text-orange-600' : 'text-slate-700'
                            }`}>
                              {getTimeRemaining(auction.closing_date)}
                            </span>
                          </div>
                          
                          <span className="text-xs text-slate-500">
                            {formatDate(auction.closing_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Bar */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {filteredAuctions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-slate-500 text-sm font-medium mb-1">Total Auctions</p>
              <p className="text-2xl font-bold text-slate-900">{filteredAuctions.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-slate-500 text-sm font-medium mb-1">Active Now</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredAuctions.filter(a => !isClosed(a.closing_date)).length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-slate-500 text-sm font-medium mb-1">Closing Soon</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredAuctions.filter(a => isClosingSoon(a.closing_date)).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;