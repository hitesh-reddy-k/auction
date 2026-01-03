import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, DollarSign, Calendar, FileText, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_price: '',
    closing_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    // Client-side validation for clearer errors before hitting API
    const title = formData.title.trim();
    const description = formData.description.trim();
    const startingPriceNum = parseFloat(formData.starting_price);
    const closingDate = new Date(formData.closing_date);
    const now = new Date();

    if (title.length < 3) {
      setError('Title must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (description.length < 10) {
      setError('Description must be at least 10 characters');
      setLoading(false);
      return;
    }

    if (!Number.isFinite(startingPriceNum) || startingPriceNum < 0.01) {
      setError('Starting price must be at least 0.01');
      setLoading(false);
      return;
    }

    if (!(closingDate instanceof Date) || isNaN(closingDate.getTime())) {
      setError('Please select a valid closing date');
      setLoading(false);
      return;
    }

    if (closingDate <= now) {
      setError('Closing date must be in the future');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auctions', {
        title,
        description,
        starting_price: startingPriceNum,
        closing_date: formData.closing_date,
      });
      setSuccess(true);
      
      // Wait a moment to show success message
      setTimeout(() => {
        navigate(`/${response.data.id}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/30 mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Auction</h1>
          <p className="text-slate-600">List your item and start receiving bids</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Success Banner */}
          {success && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-center gap-3 text-white">
              <CheckCircle className="w-5 h-5" />
              <p className="font-semibold">Auction created successfully! Redirecting...</p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="p-8">
            <div className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Auction Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength="3"
                  maxLength="255"
                  placeholder="e.g., Vintage Watch Collection"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                />
                <p className="mt-1.5 text-xs text-slate-500">Choose a clear, descriptive title (3-255 characters)</p>
              </div>

              {/* Description Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  minLength="10"
                  rows="6"
                  placeholder="Describe your item in detail... Include condition, specifications, history, or any other relevant information."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400 resize-none"
                />
                <p className="mt-1.5 text-xs text-slate-500">Provide detailed information to attract bidders (min. 10 characters)</p>
              </div>

              {/* Two Column Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Starting Price Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Starting Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">$</span>
                    </div>
                    <input
                      type="number"
                      name="starting_price"
                      value={formData.starting_price}
                      onChange={handleChange}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Minimum bid to start the auction</p>
                </div>

                {/* Closing Date Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Closing Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="closing_date"
                    value={formData.closing_date}
                    onChange={handleChange}
                    required
                    min={getMinDate()}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">When bidding will end</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Before you create</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Make sure all information is accurate</li>
                      <li>• Set a realistic starting price</li>
                      <li>• Choose an appropriate closing date</li>
                      <li>• You cannot edit the auction after creation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || success}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </span>
                  ) : success ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Created!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create Auction
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? Check out our{' '}
            <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium underline">
              auction guidelines
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;