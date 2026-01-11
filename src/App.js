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
  const [history, setHistory] = useState([]);

  const fetchSynonyms = useCallback(async (searchWord, addToHistory = true) => {
    if (!searchWord.trim()) return;
    setLoading(true);
    const normalizedWord = searchWord.toLowerCase();
    setWord(normalizedWord);

    // Add to history if not already the last item
    if (addToHistory && (history.length === 0 || history[history.length - 1] !== normalizedWord)) {
      setHistory(prev => [...prev, normalizedWord]);
    }

    try {
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(searchWord)}&max=100`);
      const data = await res.json();
      setSynonyms(data.map(item => item.word));
    } catch (err) {
      console.error('Error fetching synonyms:', err);
      setSynonyms([]);
    }
    setLoading(false);
  }, [history]);

  const fetchRandom = useCallback(() => {
    const randomWord = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    setSearchInput(randomWord);
    setHistory([]); // Clear history on random
    fetchSynonyms(randomWord, false);
    setHistory([randomWord]);
  }, [fetchSynonyms]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSynonyms(searchInput);
    setSearchInput('');
  };

  const handleSynonymClick = (syn) => {
    setSearchInput(syn);
    fetchSynonyms(syn);
  };

  const handleHistoryClick = (histWord, index) => {
    // Truncate history to this point
    setHistory(prev => prev.slice(0, index + 1));
    setSearchInput(histWord);
    fetchSynonyms(histWord, false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  useEffect(() => {
    fetchRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        {history.length > 0 && (
          <div className="history-container">
            <div className="history-label">
              History:
              <button className="btn-clear" onClick={clearHistory}>Clear</button>
            </div>
            <div className="history-chain">
              {history.map((histWord, idx) => (
                <span key={idx} className="history-item-wrapper">
                  <span
                    className={`history-item ${histWord === word ? 'active' : ''}`}
                    onClick={() => handleHistoryClick(histWord, idx)}
                  >
                    {histWord}
                  </span>
                  {idx < history.length - 1 && <span className="history-arrow">→</span>}
                </span>
              ))}
            </div>
          </div>
        )}

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
