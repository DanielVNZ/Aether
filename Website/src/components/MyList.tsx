import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { embyApi } from '../services/embyApi';
import type { EmbyItem } from '../types/emby.types';
import { Header } from './Header';
import { Footer } from './Footer';

// MediaCard component for favorites
const MediaCard = memo(({ item, onItemClick, onToggleFavorite, isFavChanging }: { item: EmbyItem; onItemClick: (item: EmbyItem) => void; onToggleFavorite: (item: EmbyItem) => void; isFavChanging: boolean }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isFavorite = !!item.UserData?.IsFavorite;

  // For episodes, use the series cover art if available
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
      onClick={() => onItemClick(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer group/card text-left transition-all duration-300"
    >
      <div className={`relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden mb-3 shadow-2xl transition-all duration-300 ${
        isHovered ? 'scale-105 shadow-black/80 ring-2 ring-white/20' : 'shadow-black/40'
      }`}>
        {imageUrl ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={item.Name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="transform transition-all duration-300" style={{ transform: isHovered ? 'scale(1)' : 'scale(0.8)' }}>
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
              <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {item.UserData?.PlaybackPositionTicks && item.RunTimeTicks && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80">
            <div
              className="h-full bg-gradient-to-r from-white to-gray-400"
              style={{
                width: `${(item.UserData.PlaybackPositionTicks / item.RunTimeTicks) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
          disabled={isFavChanging}
          aria-label={isFavorite ? `Unfavorite ${item.Name}` : `Favorite ${item.Name}`}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isFavChanging ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          } ${isFavorite ? 'bg-pink-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
        >
          <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? 0 : 2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base text-white truncate mb-1 group-hover/card:text-gray-200 transition-colors">
        {item.Name}
      </h3>

      {/* Metadata */}
      <p className="text-sm text-gray-400 truncate">
        {item.Type === 'Episode' && item.SeriesName ? (
          <>{item.SeriesName}{item.ParentIndexNumber && item.IndexNumber ? ` • S${item.ParentIndexNumber}E${item.IndexNumber}` : ''}</>
        ) : (
          <>{item.ProductionYear || ''}{item.Type ? ` • ${item.Type}` : ''}</>
        )}
      </p>
    </div>
  );
});

MediaCard.displayName = 'MediaCard';

export function MyList() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<EmbyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favChanging, setFavChanging] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await embyApi.getItems({
        recursive: true,
        includeItemTypes: 'Movie,Series,Episode',
        filters: 'IsFavorite',
        sortBy: 'DateCreated',
        sortOrder: 'Descending',
        fields: 'Genres,Overview,CommunityRating,OfficialRating,RunTimeTicks,ProductionYear,PremiereDate,UserData,SeriesId,SeriesName,SeriesPrimaryImageTag,ParentIndexNumber,IndexNumber,ChildCount,ProviderIds'
      });

      // Reverse to show oldest favorites first (most recently added last)
      setFavorites(response.Items.slice().reverse());
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (item: EmbyItem) => {
    if (!item || !item.Id) return;
    const isFav = !!item.UserData?.IsFavorite;
    const nextFav = !isFav;
    const prevUD = item.UserData || { PlaybackPositionTicks: 0, PlayCount: 0, IsFavorite: false, Played: false };

    // Optimistically update UI
    setFavorites(prev => prev.map(i => 
      i.Id === item.Id 
        ? { ...i, UserData: { ...prevUD, IsFavorite: nextFav } }
        : i
    ));
    
    setFavChanging(prev => ({ ...prev, [item.Id]: true }));

    try {
      if (nextFav) {
        await embyApi.markFavorite(item.Id);
      } else {
        await embyApi.unmarkFavorite(item.Id);
        // Remove from list after unfavoriting
        setFavorites(prev => prev.filter(i => i.Id !== item.Id));
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
      // Rollback on error
      setFavorites(prev => prev.map(i => 
        i.Id === item.Id 
          ? { ...i, UserData: { ...prevUD, IsFavorite: isFav } }
          : i
      ));
      alert('Failed to update favorite.');
    } finally {
      setFavChanging(prev => {
        const copy = { ...prev };
        delete copy[item.Id];
        return copy;
      });
    }
  };

  const handleItemClick = (item: EmbyItem) => {
    // For episodes, go to the parent series details page
    if (item.Type === 'Episode' && item.SeriesId) {
      navigate(`/details/${item.SeriesId}`);
    } else {
      // For movies/series, go to their details page
      navigate(`/details/${item.Id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header transparent={false} />
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My List</h1>
            <p className="text-gray-400">Your favorite movies and shows</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] rounded-lg bg-gray-800 animate-pulse mb-3" />
                <div className="h-4 bg-white/10 rounded w-10/12 mb-2 animate-pulse" />
                <div className="h-3 bg-white/10 rounded w-8/12 animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header transparent={false} />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My List</h1>
          <p className="text-gray-400">
            {favorites.length === 0 
              ? "You haven't added any favorites yet" 
              : `${favorites.length} ${favorites.length === 1 ? 'item' : 'items'} in your list`}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-400 mb-4">Your list is empty</p>
            <p className="text-gray-500 mb-8">Add movies and shows to your list to watch them later</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Browse Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {favorites.map((item) => (
              <MediaCard
                key={item.Id}
                item={item}
                onItemClick={handleItemClick}
                onToggleFavorite={toggleFavorite}
                isFavChanging={favChanging[item.Id] || false}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
