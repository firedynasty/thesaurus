import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const AUDIO_URL = "https://www.dropbox.com/scl/fi/ycyxa3oee9kwacgbubc27/Psalms_complete.mp3?rlkey=q9bs72s8630wykdypxlxpzgsw&st=eg1ba594&raw=1";

function App() {
  const [word, setWord] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [history, setHistory] = useState([]);

  // Audio player state
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(30);
  const [loopDuration, setLoopDuration] = useState(30);
  const [repeatCount, setRepeatCount] = useState(50);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

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

  // Audio player functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Check if we need to loop
      if (isLooping && audioRef.current.currentTime >= loopEnd) {
        if (currentRepeat < repeatCount - 1) {
          audioRef.current.currentTime = loopStart;
          setCurrentRepeat(prev => prev + 1);
        } else {
          setIsLooping(false);
          setCurrentRepeat(0);
        }
      }
    }
  };

  const startLoop = (duration) => {
    if (audioRef.current) {
      const start = audioRef.current.currentTime;
      setLoopStart(start);
      setLoopEnd(start + duration);
      setLoopDuration(duration);
      setCurrentRepeat(0);
      setIsLooping(true);
    }
  };

  const stopLoop = () => {
    setIsLooping(false);
    setCurrentRepeat(0);
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

      {/* Sticky Audio Player */}
      <div className="audio-player-sticky">
        <div className="audio-container">
          <audio
            ref={audioRef}
            id="audio1"
            controls
            src={AUDIO_URL}
            onTimeUpdate={handleTimeUpdate}
          >
            Your browser does not support HTML5 Audio!
          </audio>

          <div className="audio-controls">
            <span className="time-label">Current: {formatTime(currentTime)}</span>

            <div className="loop-buttons">
              <button className="loop-timer-btn" onClick={() => startLoop(30)}>30s</button>
              <button className="loop-timer-btn btn-60s" onClick={() => startLoop(60)}>1m</button>
              <button className="loop-timer-btn btn-3min" onClick={() => startLoop(180)}>3m</button>
              {isLooping && <button className="loop-timer-btn btn-stop" onClick={stopLoop}>Stop</button>}
            </div>

            <div className="repeat-options">
              <span className="repeat-label">Repeat:</span>
              {[1, 8, 50].map(count => (
                <label key={count} className="repeat-option">
                  <input
                    type="radio"
                    name="loopRepeat"
                    value={count}
                    checked={repeatCount === count}
                    onChange={() => setRepeatCount(count)}
                  /> {count}x
                </label>
              ))}
            </div>

            {isLooping && (
              <div className="loop-status">
                Loop: {formatTime(loopStart)} → {formatTime(loopEnd)} | Repeat: {currentRepeat + 1}/{repeatCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
