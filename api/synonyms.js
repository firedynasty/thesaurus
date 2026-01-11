const fs = require('fs');
const path = require('path');

let thesaurus = null;
let wordList = null;

function loadThesaurus() {
  if (thesaurus) return;

  thesaurus = {};
  wordList = [];

  const wordsPath = path.join(process.cwd(), 'words.txt');
  const content = fs.readFileSync(wordsPath, 'utf-8');

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
};
