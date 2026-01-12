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

// Psalms timestamps [name, "m:ss" or "h:mm:ss"] - shifted so each psalm starts at the correct time
const PSALMS_TIMESTAMPS = [
  ["Psalms 1", "0:00"], ["Psalms 2", "0:56"], ["Psalms 3", "2:21"], ["Psalms 4", "3:26"],
  ["Psalms 5", "4:43"], ["Psalms 6", "6:24"], ["Psalms 7", "7:37"], ["Psalms 8", "9:58"],
  ["Psalms 9", "11:09"], ["Psalms 10", "13:41"], ["Psalms 11", "16:00"], ["Psalms 12", "17:05"],
  ["Psalms 13", "18:17"], ["Psalms 14", "19:12"], ["Psalms 15", "20:25"], ["Psalms 16", "21:16"],
  ["Psalms 17", "22:49"], ["Psalms 18", "25:03"], ["Psalms 19", "31:17"], ["Psalms 20", "33:22"],
  ["Psalms 21", "34:33"], ["Psalms 22", "36:16"], ["Psalms 23", "40:09"], ["Psalms 24", "41:03"],
  ["Psalms 25", "42:22"], ["Psalms 26", "44:47"], ["Psalms 27", "46:14"], ["Psalms 28", "48:32"],
  ["Psalms 29", "50:00"], ["Psalms 30", "51:18"], ["Psalms 31", "52:57"], ["Psalms 32", "56:20"],
  ["Psalms 33", "58:08"], ["Psalms 34", "1:00:24"], ["Psalms 35", "1:02:50"], ["Psalms 36", "1:06:36"],
  ["Psalms 37", "1:08:20"], ["Psalms 38", "1:13:02"], ["Psalms 39", "1:15:33"], ["Psalms 40", "1:17:41"],
  ["Psalms 41", "1:20:30"], ["Psalms 42", "1:22:11"], ["Psalms 43", "1:24:14"], ["Psalms 44", "1:25:15"],
  ["Psalms 45", "1:28:18"], ["Psalms 46", "1:30:40"], ["Psalms 47", "1:32:14"], ["Psalms 48", "1:33:24"],
  ["Psalms 49", "1:35:09"], ["Psalms 50", "1:37:38"], ["Psalms 51", "1:40:41"], ["Psalms 52", "1:43:13"],
  ["Psalms 53", "1:44:42"], ["Psalms 54", "1:45:57"], ["Psalms 55", "1:46:56"], ["Psalms 56", "1:50:01"],
  ["Psalms 57", "1:51:49"], ["Psalms 58", "1:53:38"], ["Psalms 59", "1:55:13"], ["Psalms 60", "1:57:48"],
  ["Psalms 61", "1:59:45"], ["Psalms 62", "2:00:50"], ["Psalms 63", "2:02:44"], ["Psalms 64", "2:04:13"],
  ["Psalms 65", "2:05:33"], ["Psalms 66", "2:07:35"], ["Psalms 67", "2:09:54"], ["Psalms 68", "2:10:50"],
  ["Psalms 69", "2:16:05"], ["Psalms 70", "2:20:43"], ["Psalms 71", "2:21:38"], ["Psalms 72", "2:24:54"],
  ["Psalms 73", "2:27:29"], ["Psalms 74", "2:30:40"], ["Psalms 75", "2:33:42"], ["Psalms 76", "2:35:08"],
  ["Psalms 77", "2:36:45"], ["Psalms 78", "2:39:18"], ["Psalms 79", "2:47:43"], ["Psalms 80", "2:49:46"],
  ["Psalms 81", "2:52:10"], ["Psalms 82", "2:54:07"], ["Psalms 83", "2:55:01"], ["Psalms 84", "2:57:04"],
  ["Psalms 85", "2:58:49"], ["Psalms 86", "3:00:28"], ["Psalms 87", "3:02:42"], ["Psalms 88", "3:03:39"],
  ["Psalms 89", "3:05:55"], ["Psalms 90", "3:11:57"], ["Psalms 91", "3:14:21"], ["Psalms 92", "3:16:26"],
  ["Psalms 93", "3:18:22"], ["Psalms 94", "3:19:12"], ["Psalms 95", "3:21:46"], ["Psalms 96", "3:23:12"],
  ["Psalms 97", "3:24:49"], ["Psalms 98", "3:26:19"], ["Psalms 99", "3:27:33"], ["Psalms 100", "3:28:52"],
  ["Psalms 101", "3:29:39"], ["Psalms 102", "3:30:51"], ["Psalms 103", "3:33:59"], ["Psalms 104", "3:36:26"],
  ["Psalms 105", "3:40:20"], ["Psalms 106", "3:44:31"], ["Psalms 107", "3:49:48"], ["Psalms 108", "3:54:27"],
  ["Psalms 109", "3:56:03"], ["Psalms 110", "3:59:35"], ["Psalms 111", "4:00:37"], ["Psalms 112", "4:02:00"],
  ["Psalms 113", "4:03:19"], ["Psalms 114", "4:04:18"], ["Psalms 115", "4:05:07"], ["Psalms 116", "4:07:01"],
  ["Psalms 117", "4:09:02"], ["Psalms 118", "4:09:23"], ["Psalms 119", "4:12:28"], ["Psalms 120", "4:30:14"],
  ["Psalms 121", "4:30:56"], ["Psalms 122", "4:31:47"], ["Psalms 123", "4:32:44"], ["Psalms 124", "4:33:28"],
  ["Psalms 125", "4:34:23"], ["Psalms 126", "4:35:12"], ["Psalms 127", "4:35:58"], ["Psalms 128", "4:36:45"],
  ["Psalms 129", "4:37:30"], ["Psalms 130", "4:38:23"], ["Psalms 131", "4:39:19"], ["Psalms 132", "4:39:57"],
  ["Psalms 133", "4:42:03"], ["Psalms 134", "4:42:38"], ["Psalms 135", "4:43:04"], ["Psalms 136", "4:45:23"],
  ["Psalms 137", "4:48:04"], ["Psalms 138", "4:49:20"], ["Psalms 139", "4:50:42"], ["Psalms 140", "4:53:46"],
  ["Psalms 141", "4:55:30"], ["Psalms 142", "4:56:57"], ["Psalms 143", "4:58:03"], ["Psalms 144", "4:59:50"],
  ["Psalms 145", "5:02:01"], ["Psalms 146", "5:05:24"], ["Psalms 147", "5:06:46"], ["Psalms 148", "5:08:59"],
  ["Psalms 149", "5:10:30"], ["Psalms 150", "5:11:34"]
];

function App() {
  const [word, setWord] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [history, setHistory] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);

  // Audio player state
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(30);
  const [repeatCount, setRepeatCount] = useState(50);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [psalmIndex, setPsalmIndex] = useState(0);

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
    if (deleteMode) {
      // Delete mode: remove this item from history
      setHistory(prev => prev.filter((_, i) => i !== index));
    } else {
      // Navigate mode: load synonyms without modifying history
      setSearchInput(histWord);
      fetchSynonyms(histWord, false);
    }
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
      setCurrentRepeat(0);
      setIsLooping(true);
    }
  };

  const stopLoop = () => {
    setIsLooping(false);
    setCurrentRepeat(0);
  };

  // Parse timestamp string to seconds
  const parseTimestamp = (timestamp) => {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const goToPsalm = () => {
    if (audioRef.current) {
      const seconds = parseTimestamp(PSALMS_TIMESTAMPS[psalmIndex][1]);
      audioRef.current.currentTime = seconds;
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  const prevPsalm = () => {
    setPsalmIndex(prev => (prev > 0 ? prev - 1 : PSALMS_TIMESTAMPS.length - 1));
  };

  const nextPsalm = () => {
    setPsalmIndex(prev => (prev < PSALMS_TIMESTAMPS.length - 1 ? prev + 1 : 0));
  };

  const skipPsalm = (amount) => {
    setPsalmIndex(prev => {
      const newIndex = prev + amount;
      if (newIndex < 0) return 0;
      if (newIndex >= PSALMS_TIMESTAMPS.length) return PSALMS_TIMESTAMPS.length - 1;
      return newIndex;
    });
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
          <div className={`history-container ${deleteMode ? 'delete-mode' : ''}`}>
            <div className="history-label">
              History:
              <div className="history-controls">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={deleteMode}
                    onChange={(e) => setDeleteMode(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">{deleteMode ? 'Delete (or Navigate)' : 'Navigate (or Delete)'}</span>
                <button className="btn-clear" onClick={clearHistory}>Clear</button>
              </div>
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

          <div className="psalm-navigation">
            <button className="psalm-skip-btn" onClick={() => skipPsalm(-20)}>-20</button>
            <button className="psalm-skip-btn" onClick={() => skipPsalm(-10)}>-10</button>
            <button className="psalm-arrow" onClick={prevPsalm}>◀</button>
            <div className="psalm-display">
              <span className="psalm-name">{PSALMS_TIMESTAMPS[psalmIndex][0]}</span>
              <span className="psalm-time">{PSALMS_TIMESTAMPS[psalmIndex][1]}</span>
            </div>
            <button className="psalm-arrow" onClick={nextPsalm}>▶</button>
            <button className="psalm-skip-btn" onClick={() => skipPsalm(10)}>+10</button>
            <button className="psalm-skip-btn" onClick={() => skipPsalm(20)}>+20</button>
            <button className="psalm-go-btn" onClick={goToPsalm}>Go</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
