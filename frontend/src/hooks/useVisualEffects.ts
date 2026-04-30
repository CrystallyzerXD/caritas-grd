import { useState, useEffect } from 'react';

const STORAGE_KEY = 'caritas-visual-effects';
const ATTR        = 'data-effects';

export function useVisualEffects() {
  const [enabled, setEnabled] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  useEffect(() => {
    if (enabled) {
      document.documentElement.setAttribute(ATTR, '');
    } else {
      document.documentElement.removeAttribute(ATTR);
    }
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      document.documentElement.setAttribute(ATTR, '');
    }
  }, []);

  return {
    visualEffects: enabled,
    toggleVisualEffects: () => setEnabled((v) => !v),
  };
}
