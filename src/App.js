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
  ["Psalms 1", "0:00"], ["Psalms 2", "0:56"], ["Psalms 3", "2:21"], ["Psalms 4", "3:25"],
  ["Psalms 5", "4:42"], ["Psalms 6", "6:23"], ["Psalms 7", "7:36"], ["Psalms 8", "9:56"],
  ["Psalms 9", "11:07"], ["Psalms 10", "13:38"], ["Psalms 11", "15:57"], ["Psalms 12", "17:02"],
  ["Psalms 13", "18:13"], ["Psalms 14", "19:07"], ["Psalms 15", "20:20"], ["Psalms 16", "21:10"],
  ["Psalms 17", "22:42"], ["Psalms 18", "24:56"], ["Psalms 19", "31:09"], ["Psalms 20", "33:14"],
  ["Psalms 21", "34:24"], ["Psalms 22", "36:07"], ["Psalms 23", "39:59"], ["Psalms 24", "40:53"],
  ["Psalms 25", "42:11"], ["Psalms 26", "44:36"], ["Psalms 27", "46:02"], ["Psalms 28", "48:20"],
  ["Psalms 29", "49:47"], ["Psalms 30", "51:05"], ["Psalms 31", "52:44"], ["Psalms 32", "56:06"],
  ["Psalms 33", "57:53"], ["Psalms 34", "1:00:09"], ["Psalms 35", "1:02:34"], ["Psalms 36", "1:06:19"],
  ["Psalms 37", "1:08:03"], ["Psalms 38", "1:12:45"], ["Psalms 39", "1:15:15"], ["Psalms 40", "1:17:23"],
  ["Psalms 41", "1:20:11"], ["Psalms 42", "1:21:52"], ["Psalms 43", "1:23:54"], ["Psalms 44", "1:24:55"],
  ["Psalms 45", "1:27:57"], ["Psalms 46", "1:30:19"], ["Psalms 47", "1:31:52"], ["Psalms 48", "1:33:01"],
  ["Psalms 49", "1:34:46"], ["Psalms 50", "1:37:15"], ["Psalms 51", "1:40:17"], ["Psalms 52", "1:42:48"],
  ["Psalms 53", "1:44:16"], ["Psalms 54", "1:45:30"], ["Psalms 55", "1:46:29"], ["Psalms 56", "1:49:33"],
  ["Psalms 57", "1:51:21"], ["Psalms 58", "1:53:09"], ["Psalms 59", "1:54:43"], ["Psalms 60", "1:57:17"],
  ["Psalms 61", "1:59:14"], ["Psalms 62", "2:00:19"], ["Psalms 63", "2:02:12"], ["Psalms 64", "2:03:40"],
  ["Psalms 65", "2:05:00"], ["Psalms 66", "2:07:01"], ["Psalms 67", "2:09:19"], ["Psalms 68", "2:10:15"],
  ["Psalms 69", "2:15:29"], ["Psalms 70", "2:20:06"], ["Psalms 71", "2:21:00"], ["Psalms 72", "2:24:16"],
  ["Psalms 73", "2:26:51"], ["Psalms 74", "2:30:01"], ["Psalms 75", "2:33:03"], ["Psalms 76", "2:34:29"],
  ["Psalms 77", "2:36:05"], ["Psalms 78", "2:38:37"], ["Psalms 79", "2:47:02"], ["Psalms 80", "2:49:05"],
  ["Psalms 81", "2:51:28"], ["Psalms 82", "2:53:25"], ["Psalms 83", "2:54:18"], ["Psalms 84", "2:56:21"],
  ["Psalms 85", "2:58:06"], ["Psalms 86", "2:59:44"], ["Psalms 87", "3:01:58"], ["Psalms 88", "3:02:54"],
  ["Psalms 89", "3:05:10"], ["Psalms 90", "3:11:12"], ["Psalms 91", "3:13:36"], ["Psalms 92", "3:15:40"],
  ["Psalms 93", "3:17:35"], ["Psalms 94", "3:18:25"], ["Psalms 95", "3:20:59"], ["Psalms 96", "3:22:24"],
  ["Psalms 97", "3:24:01"], ["Psalms 98", "3:25:30"], ["Psalms 99", "3:26:44"], ["Psalms 100", "3:28:03"],
  ["Psalms 101", "3:28:49"], ["Psalms 102", "3:30:00"], ["Psalms 103", "3:33:07"], ["Psalms 104", "3:35:33"],
  ["Psalms 105", "3:39:27"], ["Psalms 106", "3:43:38"], ["Psalms 107", "3:48:55"], ["Psalms 108", "3:53:33"],
  ["Psalms 109", "3:55:09"], ["Psalms 110", "3:58:41"], ["Psalms 111", "3:59:42"], ["Psalms 112", "4:01:04"],
  ["Psalms 113", "4:02:23"], ["Psalms 114", "4:03:22"], ["Psalms 115", "4:04:10"], ["Psalms 116", "4:06:04"],
  ["Psalms 117", "4:08:04"], ["Psalms 118", "4:08:25"], ["Psalms 119", "4:11:29"], ["Psalms 120", "4:29:15"],
  ["Psalms 121", "4:29:56"], ["Psalms 122", "4:30:46"], ["Psalms 123", "4:31:43"], ["Psalms 124", "4:32:26"],
  ["Psalms 125", "4:33:20"], ["Psalms 126", "4:34:08"], ["Psalms 127", "4:34:54"], ["Psalms 128", "4:35:40"],
  ["Psalms 129", "4:36:25"], ["Psalms 130", "4:37:17"], ["Psalms 131", "4:38:13"], ["Psalms 132", "4:38:51"],
  ["Psalms 133", "4:40:56"], ["Psalms 134", "4:41:31"], ["Psalms 135", "4:41:57"], ["Psalms 136", "4:44:15"],
  ["Psalms 137", "4:46:55"], ["Psalms 138", "4:48:11"], ["Psalms 139", "4:49:32"], ["Psalms 140", "4:52:35"],
  ["Psalms 141", "4:54:19"], ["Psalms 142", "4:55:45"], ["Psalms 143", "4:56:50"], ["Psalms 144", "4:58:37"],
  ["Psalms 145", "5:00:48"], ["Psalms 146", "5:04:10"], ["Psalms 147", "5:05:32"], ["Psalms 148", "5:07:44"],
  ["Psalms 149", "5:09:15"], ["Psalms 150", "5:10:19"]
];

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
