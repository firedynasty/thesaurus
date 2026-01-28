// Vercel Serverless Function for Word History Storage with Blob
// Environment variables (set in Vercel dashboard):
// - BLOB_READ_WRITE_TOKEN: Vercel Blob token (auto-added when you create a Blob store)
// - ACCESS_CODE: Password to unlock save operations

import { put, list } from '@vercel/blob';

const HISTORY_FILENAME = 'thesaurus-history.json';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET - Load history (requires valid access code)
    if (req.method === 'GET') {
      const accessCode = req.query.accessCode;

      // Validate access code
      const origin = req.headers.origin || req.headers.referer || '';
      const isFromLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const validAccessCode = process.env.ACCESS_CODE;
      const isValidCode = (accessCode && accessCode === validAccessCode) || (accessCode === 'localhost' && isFromLocalhost);

      if (!isValidCode) {
        return res.status(401).json({ error: 'Invalid access code' });
      }

      const { blobs } = await list({ prefix: HISTORY_FILENAME });

      if (blobs.length === 0) {
        return res.status(200).json({ history: [] });
      }

      const response = await fetch(blobs[0].url);
      const content = await response.text();

      try {
        const data = JSON.parse(content);
        return res.status(200).json({ history: data.history || [] });
      } catch {
        return res.status(200).json({ history: [] });
      }
    }

    // POST - Save history (requires access code)
    if (req.method === 'POST') {
      const { history, accessCode } = req.body;

      // Check if request is from localhost
      const origin = req.headers.origin || req.headers.referer || '';
      const isFromLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

      // Validate access code
      const validAccessCode = process.env.ACCESS_CODE;
      const isValidCode = (accessCode && accessCode === validAccessCode) || (accessCode === 'localhost' && isFromLocalhost);

      if (!isValidCode) {
        return res.status(401).json({ error: 'Invalid access code' });
      }

      // Validate input
      if (!Array.isArray(history)) {
        return res.status(400).json({ error: 'History must be an array' });
      }

      // Save to Blob
      const content = JSON.stringify({ history, updatedAt: new Date().toISOString() });
      await put(HISTORY_FILENAME, content, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.log(`History saved: ${history.length} words`);
      return res.status(200).json({ success: true, count: history.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('History API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
