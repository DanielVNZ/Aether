import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SearchOverlay } from './SearchOverlay';
import { embyApi } from '../services/embyApi';
import type { EmbyItem } from '../types/emby.types';

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPageName, setCurrentPageName] = useState<string | null>(null);

  // Determine current page name
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/details/')) {
      // Fetch media name for details page
      const mediaId = path.split('/details/')[1];
      if (mediaId) {
        embyApi.getItem(mediaId)
          .then((item: EmbyItem) => {
            setCurrentPageName(item.Name || null);
          })
          .catch(() => {
            setCurrentPageName(null);
          });
      }
    } else if (path === '/home') {
      setCurrentPageName('Home');
    } else if (path === '/browse') {
      if (location.search.includes('type=Series')) {
        setCurrentPageName('TV Shows');
      } else {
        setCurrentPageName('Movies');
      }
    } else if (path === '/mylist') {
      setCurrentPageName('Favourites');
    } else if (path === '/stats') {
      setCurrentPageName('Stats');
    } else if (path === '/settings') {
      setCurrentPageName('Settings');
    } else {
      setCurrentPageName(null);
    }
  }, [location.pathname, location.search]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className={transparent ? 'bg-gradient-to-b from-black via-black/95 to-transparent' : 'bg-gradient-to-b from-black via-black/95 to-transparent'}>
        <div className="max-w-[1800px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/Logo.svg" 
              alt="Aether" 
              className="h-12 object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200" 
              onClick={() => navigate('/home')}
            />
            
            {/* Page Name Button - to the right of logo */}
            {currentPageName && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden lg:flex items-center gap-2 text-white bg-white/10 hover:bg-white/15 transition-all duration-200 p-2 px-4 rounded-full border border-white/20 hover:border-white/30 whitespace-nowrap"
                title={`${currentPageName} - Click to scroll to top`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <span className="hidden lg:inline text-sm font-medium">{currentPageName}</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
<button
  onClick={() => setIsSearchOpen(true)}
  className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
  aria-label="Search"
  title="Search"
>
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>

  <span className="hidden lg:inline text-sm font-medium">Search</span>
</button>

            {currentPageName !== 'Movies' && (
            <button
              onClick={() => navigate('/browse')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="Movies"
              title="Movies"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Movies</span>
            </button>
            )}
            {currentPageName !== 'TV Shows' && (
            <button
              onClick={() => navigate('/browse?type=Series')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="TV Shows"
              title="TV Shows"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">TV Shows</span>
            </button>
            )}
            {currentPageName !== 'Favourites' && (
            <button
              onClick={() => navigate('/mylist')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="Favourites"
              title="Favourites"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Favourites</span>
            </button>
            )}
            {currentPageName !== 'Stats' && (
            <button
              onClick={() => navigate('/stats')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="Stats"
              title="Stats"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Stats</span>
            </button>
            )}
            {currentPageName !== 'Settings' && (
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="Settings"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Settings</span>
            </button>
            )}
            {currentPageName !== 'Home' && (
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="Home"
              title="Home"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Home</span>
            </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
