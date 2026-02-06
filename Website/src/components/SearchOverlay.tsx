import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { embyApi } from '../services/embyApi';
import type { EmbyItem } from '../types/emby.types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// SearchResultCard component - matches Home screen card design
const SearchResultCard = memo(({ item, onClick }: { item: EmbyItem; onClick: (item: EmbyItem) => void }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  let imageUrl = '';
  if (item.Type === 'Episode' && item.SeriesId && item.SeriesPrimaryImageTag) {
    imageUrl = embyApi.getImageUrl(item.SeriesId, 'Primary', {
      maxWidth: 300,
      tag: item.SeriesPrimaryImageTag
    });
  } else if (item.ImageTags?.Primary) {
    imageUrl = embyApi.getImageUrl(item.Id, 'Primary', {
      maxWidth: 300,
      tag: item.ImageTags.Primary
    });
  }

  return (
    <div
      onClick={() => onClick(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer group/card text-left transition-all duration-300"
    >
      <div className={`relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3 shadow-2xl transition-all duration-300 ${
        isHovered ? 'scale-105 shadow-black/80 ring-2 ring-white/20' : 'shadow-black/40'
      }`}>
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {imageUrl ? (
            <>
              {/* Loading placeholder */}
              {!isImageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-700 to-gray-800" />
              )}
              <img
                src={imageUrl}
                alt={item.Name}
                loading="lazy"
                onLoad={() => setIsImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
              />

              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`} />

              {/* Hover info overlay */}
              {isHovered && (
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <div className="transform translate-y-0 transition-transform duration-300">
                    <h4 className="font-bold text-sm mb-1 line-clamp-2">
                      {item.Type === 'Episode' ? item.SeriesName || item.Name : item.Name}
                    </h4>
                    {item.Type === 'Episode' && (
                      <p className="text-xs text-blue-300 mb-2">
                        S{item.ParentIndexNumber || 1}E{item.IndexNumber || 1}
                      </p>
                    )}
                    {item.Type === 'Series' && item.ChildCount && (
                      <p className="text-xs text-blue-300 mb-2">
                        {item.ChildCount} {item.ChildCount === 1 ? 'Season' : 'Seasons'}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      {item.ProductionYear && <span className="text-gray-300">{item.ProductionYear}</span>}
                      {item.OfficialRating && (
                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                          {item.OfficialRating}
                        </span>
                      )}
                      {item.CommunityRating && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {item.CommunityRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
            </div>
          )}

          {/* Progress bar */}
          {item.UserData?.PlaybackPositionTicks && item.RunTimeTicks && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{
                  width: `${(item.UserData.PlaybackPositionTicks / item.RunTimeTicks) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Title - always visible */}
      <div className="px-1">
        <h3 className={`text-white font-medium text-sm line-clamp-1 transition-colors duration-200 ${
          isHovered ? 'text-white' : 'text-gray-300'
        }`}>
          {item.Type === 'Episode' ? item.SeriesName || item.Name : item.Name}
        </h3>
      </div>
    </div>
  );
});

SearchResultCard.displayName = 'SearchResultCard';

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<EmbyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['Movie', 'Series']));
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<number | undefined>(undefined);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Toggle type selection
  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        // Don't allow deselecting all types
        if (newSet.size > 1) {
          newSet.delete(type);
        }
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Search function with debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || selectedTypes.size === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await embyApi.getItems({
        searchTerm: query,
        recursive: true,
        includeItemTypes: Array.from(selectedTypes).join(','),
        limit: 50,
        fields: 'Genres,Overview,CommunityRating,OfficialRating,RunTimeTicks,ProductionYear,PremiereDate,UserData,SeriesId,SeriesName,SeriesPrimaryImageTag,ParentIndexNumber,IndexNumber,ChildCount',
      });

      // Sort results by relevance first, then by year (newest first)
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

      const sortedResults = (response.Items || []).sort((a, b) => {
        const nameA = (a.Name || '').toLowerCase();
        const nameB = (b.Name || '').toLowerCase();

        // Calculate relevance scores (higher is better)
        const getRelevanceScore = (name: string) => {
          // Exact match
          if (name === queryLower) return 10000;

          // Title starts with query
          if (name.startsWith(queryLower)) return 5000;

          // Check if all query words exist in the title
          const allWordsMatch = queryWords.every(word => name.includes(word));
          if (!allWordsMatch) return 0; // Filter out if not all words match

          // Title starts with any query word
          const startsWithWord = queryWords.some(word => name.startsWith(word));
          if (startsWithWord) return 3000;

          // Query appears as whole phrase with word boundary
          if (name.includes(` ${queryLower} `) || name.includes(` ${queryLower}:`)) return 2000;

          // Query appears anywhere
          if (name.includes(queryLower)) return 1000;

          // All words appear but not as phrase
          return 500;
        };

        const scoreA = getRelevanceScore(nameA);
        const scoreB = getRelevanceScore(nameB);

        // Filter out items with 0 score
        if (scoreA === 0 && scoreB === 0) return 0;
        if (scoreA === 0) return 1;
        if (scoreB === 0) return -1;

        // First sort by relevance score
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        // If relevance is equal, sort by year (newest first)
        const yearA = a.ProductionYear || 0;
        const yearB = b.ProductionYear || 0;
        return yearB - yearA;
      });

      // Filter out results with 0 relevance score
      const filteredResults = sortedResults.filter(item => {
        const nameA = (item.Name || '').toLowerCase();
        return queryWords.every(word => nameA.includes(word));
      });

      setResults(filteredResults.slice(0, 20));
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTypes]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim()) {
      setIsLoading(true);
      debounceTimer.current = window.setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, selectedTypes, performSearch]);

  const handleItemClick = (item: EmbyItem) => {
    // For episodes, go to the parent series details page
    if (item.Type === 'Episode' && item.SeriesId) {
      navigate(`/details/${item.SeriesId}`);
    } else {
      navigate(`/details/${item.Id}`);
    }
    onClose();
    setSearchQuery('');
    setResults([]);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setSearchQuery('');
      setResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl mx-auto px-4 pt-24 pb-8">
        {/* Search Input */}
        <div className="relative mb-6 animate-slideDown">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies and TV shows..."
            className="w-full px-6 py-4 pr-14 bg-gray-900/80 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 transition-all duration-300"
          />
          {isLoading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Filter Checkboxes */}
        <div className="mb-6 flex items-center gap-4 animate-slideDown">
          <span className="text-gray-400 text-sm font-medium">Filter:</span>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedTypes.has('Movie')}
              onChange={() => toggleType('Movie')}
              className="w-4 h-4 rounded border-2 border-white/30 bg-transparent checked:bg-white checked:border-white transition-all cursor-pointer accent-white"
            />
            <span className="text-white text-sm font-medium group-hover:text-gray-300 transition-colors">🎬 Movies</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedTypes.has('Series')}
              onChange={() => toggleType('Series')}
              className="w-4 h-4 rounded border-2 border-white/30 bg-transparent checked:bg-white checked:border-white transition-all cursor-pointer accent-white"
            />
            <span className="text-white text-sm font-medium group-hover:text-gray-300 transition-colors">📺 Series</span>
          </label>
        </div>

        {/* Results */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-16 animate-fadeIn">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 text-lg">Start typing to search...</p>
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <svg className="w-12 h-12 mx-auto text-white animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400 text-lg">Searching...</p>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="text-center py-16 animate-fadeIn">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fadeIn">
              {results.map((item) => (
                <SearchResultCard
                  key={item.Id}
                  item={item}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Close hint */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Press <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-400">ESC</kbd> or click outside to close
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
