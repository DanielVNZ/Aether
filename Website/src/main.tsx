import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Detect keyboard usage and show focus indicators
let keyboardUsed = false;
let mouseMovedRecently = false;

const enableKeyboardMode = () => {
  if (!keyboardUsed) {
    keyboardUsed = true;
    document.body.classList.add('using-keyboard');
    console.log('Keyboard mode enabled');
  }
};

const disableKeyboardMode = () => {
  if (keyboardUsed) {
    keyboardUsed = false;
    document.body.classList.remove('using-keyboard');
    console.log('Keyboard mode disabled');
  }
};

// Listen for keyboard events (arrow keys, Tab, Enter, etc.)
document.addEventListener('keydown', (e) => {
  // Arrow keys, Tab, Enter, Space - these indicate keyboard navigation
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', ' '].includes(e.key)) {
    enableKeyboardMode();
  }
});

// Only disable on actual mouse movement, not just clicks
// This prevents programmatic focus changes from disabling keyboard mode
document.addEventListener('mousemove', () => {
  if (!mouseMovedRecently) {
    mouseMovedRecently = true;
    disableKeyboardMode();

    // Reset after a delay
    setTimeout(() => {
      mouseMovedRecently = false;
    }, 100);
  }
});

// Also disable on actual mouse clicks with movement
document.addEventListener('click', (e) => {
  // Only if it's a real user click (has coordinates)
  if (e.clientX > 0 || e.clientY > 0) {
    disableKeyboardMode();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
