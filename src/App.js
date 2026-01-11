import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [word, setWord] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [totalWords, setTotalWords] = useState(0);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/random');
      const data = await res.json();
      setWord(data.word);
      setSynonyms(data.synonyms);
      setTotalWords(data.totalWords);
    } catch (err) {
      console.error('Error fetching random word:', err);
    }
    setLoading(false);
  }, []);

  const fetchSynonyms = async (searchWord) => {
    if (!searchWord.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/synonyms?word=${encodeURIComponent(searchWord)}`);
      const data = await res.json();
      setWord(data.word);
      setSynonyms(data.synonyms);
    } catch (err) {
      console.error('Error fetching synonyms:', err);
    }
    setLoading(false);
  };

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
        <div className="subtitle">Moby Thesaurus - {totalWords.toLocaleString()} words</div>

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
              <span className="count">({synonyms.length} synonyms)</span>
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
