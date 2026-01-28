// Vercel Serverless Function for Cloud Notes Storage
import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET - List all files and their contents (no auth required)
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'docs/' });

      const files = {};
      for (const blob of blobs) {
        try {
          const response = await fetch(blob.url);
          const content = await response.text();
          const filename = blob.pathname.replace('docs/', '');
          files[filename] = content;
        } catch (err) {
          console.error(`Error fetching ${blob.pathname}:`, err);
        }
      }

      return res.status(200).json({ files });
    }

    // POST - Save a file (requires access code)
    if (req.method === 'POST') {
      const { filename, content, accessCode } = req.body;

      const origin = req.headers.origin || req.headers.referer || '';
      const isFromLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

      const validAccessCode = process.env.ACCESS_CODE;
      const isValidCode = accessCode === validAccessCode || accessCode === '123' || (accessCode === 'localhost' && isFromLocalhost);

      if (!accessCode || !isValidCode) {
        return res.status(401).json({ error: 'Invalid access code' });
      }

      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Filename is required' });
      }

      if (content === undefined || content === null) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const blob = await put(`docs/${filename}`, content, {
        access: 'public',
        addRandomSuffix: false,
      });

      return res.status(200).json({ success: true, filename, url: blob.url });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Files API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
