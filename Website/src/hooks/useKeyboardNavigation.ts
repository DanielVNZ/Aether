import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    let keyboardTimeout: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard-nav class when keyboard is used
      document.body.classList.add('keyboard-nav');
      clearTimeout(keyboardTimeout);
      keyboardTimeout = setTimeout(() => {
        document.body.classList.remove('keyboard-nav');
      }, 3000);

      // Handle Android TV back button and Escape key
      if (e.key === 'Escape' || e.key === 'Backspace') {
        // Prevent default backspace navigation
        if (e.key === 'Backspace' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
          e.preventDefault();
          navigate(-1);
        } else if (e.key === 'Escape') {
          navigate(-1);
        }
      }
    };

    const handleMouseMove = () => {
      document.body.classList.remove('keyboard-nav');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(keyboardTimeout);
    };
  }, [navigate]);
}
