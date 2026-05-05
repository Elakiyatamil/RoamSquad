import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, X } from 'lucide-react';

const OmniSearch = ({ destinations, onFilter, onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const dropdownRef = useRef(null);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = destinations.filter(dest => {
        // Multi-Key Search Logic (Name, State, Country)
        const name = (dest.name || '').toLowerCase();
        const state = (dest.stateName || '').toLowerCase();
        const country = (dest.countryName || '').toLowerCase();
        const search = query.toLowerCase().trim();

        const matchesQuery = !search || 
          name.includes(search) ||
          state.includes(search) ||
          country.includes(search);
        
        return matchesQuery;
      });

      onFilter(filtered);
      setResultCount(filtered.length);

      // Update suggestions
      if (query.length > 1) {
        const uniqueSuggestions = new Set();
        destinations.forEach(dest => {
          if (dest.name.toLowerCase().includes(query.toLowerCase())) uniqueSuggestions.add(`${dest.name} (City)`);
          if (dest.stateName && dest.stateName.toLowerCase().includes(query.toLowerCase())) uniqueSuggestions.add(`${dest.stateName} (Region)`);
          if (dest.countryName && dest.countryName.toLowerCase().includes(query.toLowerCase())) uniqueSuggestions.add(`${dest.countryName} (Country)`);
        });
        setSuggestions(Array.from(uniqueSuggestions).slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, destinations, onFilter]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    const nameOnly = suggestion.split(' (')[0];
    setQuery(nameOnly);
    setShowSuggestions(false);
    
    // Find the actual destination if it's a city match
    const found = destinations.find(d => d.name === nameOnly);
    if (found) {
      onSelect(found);
    }
  };

  return (
    <div className="omni-search-wrapper">
      <div className="omni-search-container">
        {/* Glass Compass Search Bar */}
        <div className="omni-search-bar-wrap">
          <div className={`omni-search-bar ${query ? 'has-query' : ''}`}>
            <Search size={18} className="omni-search-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, state, or country..."
              className="omni-search-input"
            />
            {query && (
              <button onClick={() => setQuery('')} className="omni-clear-btn">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Predictive Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="omni-suggestions-dropdown"
              >
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="omni-suggestion-item"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instant Result Count Feedback */}
        <AnimatePresence>
          {query && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="omni-result-count"
            >
              Showing {resultCount} {resultCount === 1 ? 'destination' : 'destinations'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .omni-search-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 32px 0 60px; /* Increased bottom margin for gap */
          z-index: 50;
          position: relative;
        }

        .omni-search-container {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .omni-search-bar-wrap {
          width: 50%;
          position: relative;
        }

        .omni-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 100px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .omni-search-bar:focus-within {
          border-color: rgba(255, 255, 255, 1);
          box-shadow: 0 0 0 4px rgba(128, 0, 32, 0.05), 0 8px 32px rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.6);
          width: 105%;
          margin-left: -2.5%;
        }

        .omni-search-icon {
          color: #888;
          flex-shrink: 0;
        }

        .omni-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: #1A1A1A;
          width: 100%;
        }

        .omni-search-input::placeholder {
          color: #999;
        }

        .omni-clear-btn {
          background: rgba(0,0,0,0.05);
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          cursor: pointer;
        }

        .omni-suggestions-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          z-index: 100;
        }

        .omni-suggestion-item {
          width: 100%;
          text-align: left;
          padding: 14px 24px;
          background: transparent;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #1A1A1A;
          cursor: pointer;
          transition: background 0.2s;
        }

        .omni-suggestion-item:hover {
          background: rgba(128, 0, 32, 0.05);
          color: #800020;
        }

        .omni-result-count {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #800020;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .omni-search-bar-wrap {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="omni-empty-state"
  >
    <div className="wanderlust-plane-wrap">
      <Send size={40} className="wanderlust-plane-icon" />
    </div>
    <h3 className="empty-title">No destinations match your search</h3>
    <p className="empty-desc">Explore our other journeys below or try a different escape.</p>
    
    <style jsx>{`
      .omni-empty-state {
        width: 100%;
        padding: 80px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: #9CA3AF;
      }

      .wanderlust-plane-wrap {
        margin-bottom: 24px;
        color: #800020;
        opacity: 0.3;
        animation: float 4s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(10deg); }
      }

      .empty-title {
        font-family: 'DM Serif Display', serif;
        font-size: 24px;
        color: #1A1A1A;
        margin-bottom: 8px;
      }

      .empty-desc {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        max-width: 300px;
      }
    `}</style>
  </motion.div>
);

export default OmniSearch;
