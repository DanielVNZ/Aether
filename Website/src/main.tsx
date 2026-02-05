import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './tv-navigation.css'
import App from './App.tsx'

// Detect keyboard/remote usage and show focus indicators
let keyboardUsed = false;
let mouseMovedRecently = false;
let lastNavWasDpad = false;
const isAndroid = /Android/i.test(navigator.userAgent);

// On Android TV, start in keyboard/remote mode by default so focus is visible
if (isAndroid) {
  document.body.classList.add('using-keyboard');
  document.body.classList.add('keyboard-nav');
  keyboardUsed = true;
}

// Mark TV-like environment early (Android builds)
if (isAndroid) {
  document.body.classList.add('tv-device');
}

const enableKeyboardMode = () => {
  if (!keyboardUsed) {
    keyboardUsed = true;
    document.body.classList.add('using-keyboard');
    // On Android TV, also hide the cursor while navigating with the remote
    if (isAndroid) {
      document.body.classList.add('keyboard-nav');
      document.body.classList.add('tv-device');
    }
    console.log('Keyboard mode enabled');
  }
};

const disableKeyboardMode = () => {
  if (keyboardUsed) {
    keyboardUsed = false;
    document.body.classList.remove('using-keyboard');
    if (isAndroid) {
      document.body.classList.remove('keyboard-nav');
    }
    console.log('Keyboard mode disabled');
  }
};

// Listen for keyboard events (arrow keys, Tab, Enter, etc.)
document.addEventListener('keydown', (e) => {
  // Arrow keys, Tab, Enter, Space - these indicate keyboard navigation
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', ' '].includes(e.key)) {
    enableKeyboardMode();
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    lastNavWasDpad = true;
  }

  if (e.key === 'Enter') {
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && activeElement instanceof HTMLInputElement) {
      const type = activeElement.type ? activeElement.type.toLowerCase() : 'text';
      const isTextInput = ['text', 'password', 'email', 'search', 'url', 'tel', 'number'].includes(type);
      if (!isTextInput) return;
      if (activeElement.dataset.tvReadonly === 'true') {
        e.preventDefault();
        activeElement.readOnly = false;
        delete activeElement.dataset.tvReadonly;
        setTimeout(() => activeElement.focus(), 0);
      }
    }

    if (activeElement && activeElement instanceof HTMLTextAreaElement) {
      if (activeElement.dataset.tvReadonly === 'true') {
        e.preventDefault();
        activeElement.readOnly = false;
        delete activeElement.dataset.tvReadonly;
        setTimeout(() => activeElement.focus(), 0);
      }
    }
  }
});

// Only disable on actual mouse movement, not just clicks
// This prevents programmatic focus changes from disabling keyboard mode
document.addEventListener('mousemove', () => {
  if (!mouseMovedRecently) {
    mouseMovedRecently = true;
    disableKeyboardMode();
    lastNavWasDpad = false;
    
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
    lastNavWasDpad = false;
  }
});

// On Android TV, prevent soft keyboard on d-pad focus for text inputs
document.addEventListener(
  'focusin',
  (e) => {
    if (!isAndroid || !lastNavWasDpad) return;
    const target = e.target as HTMLElement;
    if (target instanceof HTMLInputElement) {
      const type = target.type ? target.type.toLowerCase() : 'text';
      const isTextInput = ['text', 'password', 'email', 'search', 'url', 'tel', 'number'].includes(type);
      if (!isTextInput) return;
      if (!target.readOnly) {
        target.readOnly = true;
        target.dataset.tvReadonly = 'true';
      }
      return;
    }
    if (target instanceof HTMLTextAreaElement) {
      if (!target.readOnly) {
        target.readOnly = true;
        target.dataset.tvReadonly = 'true';
      }
    }
  },
  true
);

document.addEventListener('pointerdown', (e) => {
  const target = e.target as HTMLElement;
  if (target instanceof HTMLInputElement) {
    const type = target.type ? target.type.toLowerCase() : 'text';
    const isTextInput = ['text', 'password', 'email', 'search', 'url', 'tel', 'number'].includes(type);
    if (!isTextInput) return;
    if (target.dataset.tvReadonly === 'true') {
      target.readOnly = false;
      delete target.dataset.tvReadonly;
      setTimeout(() => target.focus(), 0);
    }
  }
  if (target instanceof HTMLTextAreaElement) {
    if (target.dataset.tvReadonly === 'true') {
      target.readOnly = false;
      delete target.dataset.tvReadonly;
      setTimeout(() => target.focus(), 0);
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
