import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Common words for random selection
const RANDOM_WORDS = [
  'happy', 'sad', 'fast', 'slow', 'big', 'small', 'bright', 'dark',
  'strong', 'weak', 'rich', 'poor', 'hot', 'cold', 'new', 'old',
  'good', 'bad', 'love', 'hate', 'begin', 'end', 'create', 'destroy',
  'beautiful', 'ugly', 'smart', 'brave', 'calm', 'angry', 'gentle', 'rough',
  'honest', 'clever', 'kind', 'cruel', 'proud', 'humble', 'simple', 'complex',
  'ancient', 'modern', 'quiet', 'loud', 'empty', 'full', 'hard', 'soft',
  'clean', 'dirty', 'safe', 'dangerous', 'easy', 'difficult', 'free', 'busy',
  'famous', 'unknown', 'healthy', 'sick', 'happy', 'miserable', 'real', 'fake'
];

function App() {
  const [word, setWord] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const fetchSynonyms = useCallback(async (searchWord) => {
    if (!searchWord.trim()) return;
    setLoading(true);
    setWord(searchWord.toLowerCase());

    try {
      // Datamuse API - ml = "means like" (synonyms)
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(searchWord)}&max=100`);
      const data = await res.json();
      setSynonyms(data.map(item => item.word));
    } catch (err) {
      console.error('Error fetching synonyms:', err);
      setSynonyms([]);
    }
    setLoading(false);
  }, []);

  const fetchRandom = useCallback(() => {
    const randomWord = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    setSearchInput(randomWord);
    fetchSynonyms(randomWord);
  }, [fetchSynonyms]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSynonyms(searchInput);
  };

  const handleSynonymClick = (syn) => {
    setSearchInput(syn);
    fetchSynonyms(syn);
  };

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  return (
    <div className="App">
      <div className="container">
        <h1>THESAURUS</h1>
        <div className="subtitle">Powered by Datamuse API</div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a word..."
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
          <button type="button" onClick={fetchRandom} className="btn btn-secondary">Random</button>
        </form>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="word-display">
              <span className="current-word">{word}</span>
              <span className="count">({synonyms.length} results)</span>
            </div>

            <div className="synonyms-container">
              {synonyms.length > 0 ? (
                synonyms.map((syn, idx) => (
                  <span
                    key={idx}
                    className="synonym"
                    onClick={() => handleSynonymClick(syn)}
                  >
                    {syn}
                  </span>
                ))
              ) : (
                <div className="no-results">No synonyms found</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
