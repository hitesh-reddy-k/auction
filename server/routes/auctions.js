const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all active auctions (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.starting_price, 
        a.current_price, 
        a.closing_date,
        a.status,
        a.created_at,
        u.username as owner_username
      FROM auctions a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'active' AND a.closing_date > NOW()
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.starting_price, 
        a.current_price, 
        a.closing_date,
        a.status,
        a.created_at,
        a.user_id,
        u.username as owner_username,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
      FROM auctions a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create auction (authenticated)
router.post(
  '/',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 3, max: 255 }).escape(),
    body('description').trim().isLength({ min: 10 }),
    body('starting_price').isFloat({ min: 0.01 }),
    body('closing_date').isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, starting_price, closing_date } = req.body;

      // Validate closing date is in the future
      if (new Date(closing_date) <= new Date()) {
        return res.status(400).json({ message: 'Closing date must be in the future' });
      }

      const result = await pool.query(
        `INSERT INTO auctions (user_id, title, description, starting_price, current_price, closing_date) 
         VALUES ($1, $2, $3, $4, $4, $5) 
         RETURNING *`,
        [req.user.id, title, description, starting_price, closing_date]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get bid history for auction (owner only)
router.get('/:id/bids', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is auction owner
    const auctionResult = await pool.query(
      'SELECT user_id FROM auctions WHERE id = $1',
      [id]
    );

    if (auctionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auctionResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view bids' });
    }

    // Get bid history
    const bidsResult = await pool.query(`
      SELECT 
        b.id,
        b.amount,
        b.created_at,
        u.username
      FROM bids b
      JOIN users u ON b.user_id = u.id
      WHERE b.auction_id = $1
      ORDER BY b.created_at DESC
    `, [id]);

    res.json(bidsResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
