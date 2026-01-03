const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Place a bid (authenticated)
router.post(
  '/',
  authMiddleware,
  [
    body('auction_id').isInt(),
    body('amount').isFloat({ min: 0.01 }),
  ],
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { auction_id, amount } = req.body;
      const user_id = req.user.id;

      await client.query('BEGIN');

      // Get auction details
      const auctionResult = await client.query(
        'SELECT * FROM auctions WHERE id = $1 FOR UPDATE',
        [auction_id]
      );

      if (auctionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Auction not found' });
      }

      const auction = auctionResult.rows[0];

      // Check if auction is active
      if (auction.status !== 'active') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Auction is not active' });
      }

      // Check if auction has closed
      if (new Date(auction.closing_date) <= new Date()) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Auction has closed' });
      }

      // Check if user is the auction owner
      if (auction.user_id === user_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Cannot bid on your own auction' });
      }

      // Check if bid is higher than current price
      if (amount <= parseFloat(auction.current_price)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Bid must be higher than current price of ${auction.current_price}` 
        });
      }

      // Get user balance
      const userResult = await client.query(
        'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
        [user_id]
      );

      const userBalance = parseFloat(userResult.rows[0].balance);

      // Check if user has enough balance
      if (userBalance < amount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Get previous highest bidder
      const previousBidResult = await client.query(
        `SELECT user_id, amount FROM bids 
         WHERE auction_id = $1 
         ORDER BY amount DESC 
         LIMIT 1`,
        [auction_id]
      );

      // Refund previous highest bidder if exists
      if (previousBidResult.rows.length > 0) {
        const previousBid = previousBidResult.rows[0];
        await client.query(
          'UPDATE users SET balance = balance + $1 WHERE id = $2',
          [previousBid.amount, previousBid.user_id]
        );
      }

      // Deduct amount from user balance
      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [amount, user_id]
      );

      // Update auction current price
      await client.query(
        'UPDATE auctions SET current_price = $1 WHERE id = $2',
        [amount, auction_id]
      );

      // Create bid record
      const bidResult = await client.query(
        'INSERT INTO bids (auction_id, user_id, amount) VALUES ($1, $2, $3) RETURNING *',
        [auction_id, user_id, amount]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Bid placed successfully',
        bid: bidResult.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
