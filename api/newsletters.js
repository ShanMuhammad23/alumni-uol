// API endpoint to fetch newsletters from PostgreSQL database
// This can be used as a serverless function or Express route

const { Pool } = require('pg');

// Database connection configuration
// Update these with your actual database credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Main handler function
async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).set(corsHeaders).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).set(corsHeaders).json({ error: 'Method not allowed' });
  }

  try {
    // Query newsletters from database, ordered by date (newest first)
    const query = `
      SELECT 
        id,
        title,
        date,
        image,
        link,
        created_at
      FROM public.newsletters
      ORDER BY date DESC NULLS LAST, created_at DESC
    `;

    const result = await pool.query(query);
    
    // Transform database rows to match the expected frontend format
    const newsletters = result.rows.map(row => {
      const date = row.date ? new Date(row.date) : new Date(row.created_at);
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'long' });
      
      return {
        id: row.id.toString(),
        title: row.title || 'Alumni Newsletter',
        issue: `${month} ${year}`,
        releaseDate: row.date ? row.date.toISOString().split('T')[0] : row.created_at.toISOString().split('T')[0],
        summary: 'Stay connected with the latest updates, stories, and news from the UOL alumni community.',
        cover: row.image || '/assets/img/banner/newsletter.jpg',
        pdf: row.link || '#',
        year: year,
        categories: ['Alumni', 'News']
      };
    });

    return res.status(200).set(corsHeaders).json(newsletters);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).set(corsHeaders).json({ 
      error: 'Failed to fetch newsletters',
      message: error.message 
    });
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // For Node.js/Express
  module.exports = handler;
  
  // If running as standalone Express server
  if (require.main === module) {
    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 3001;
    
    app.get('/api/newsletters', handler);
    
    app.listen(PORT, () => {
      console.log(`Newsletters API server running on port ${PORT}`);
    });
  }
}

// For Vercel serverless functions
if (typeof exports !== 'undefined') {
  exports.handler = handler;
}

