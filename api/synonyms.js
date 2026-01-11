const fs = require('fs');
const path = require('path');

let thesaurus = null;
let wordList = null;

function loadThesaurus() {
  if (thesaurus) return;

  thesaurus = {};
  wordList = [];

  // Try multiple paths for Vercel compatibility
  const possiblePaths = [
    path.join(__dirname, '..', 'words.txt'),
    path.join(process.cwd(), 'words.txt'),
    '/var/task/words.txt'
  ];

  let content = null;
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        content = fs.readFileSync(p, 'utf-8');
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!content) {
    throw new Error('Could not find words.txt');
  }

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const key = parts[0].toLowerCase();
      thesaurus[key] = parts.slice(1);
      wordList.push(parts[0]);
    }
  }
}

module.exports = (req, res) => {
  try {
    loadThesaurus();

    const word = (req.query.word || '').toLowerCase().trim();

    if (!word) {
      return res.status(400).json({ error: 'Missing word parameter' });
    }

    const synonyms = thesaurus[word] || [];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      word,
      synonyms,
      count: synonyms.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
