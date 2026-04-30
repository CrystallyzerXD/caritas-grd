import { useState, useEffect } from 'react';

const STORAGE_KEY = 'caritas-glass-mode';
const ATTR        = 'data-glass';

/** Persists glass mode in localStorage and syncs the data-glass attribute on <html>. */
export function useGlassMode() {
  const [enabled, setEnabled] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  // Sync attribute whenever state changes
  useEffect(() => {
    if (enabled) {
      document.documentElement.setAttribute(ATTR, '');
    } else {
      document.documentElement.removeAttribute(ATTR);
    }
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  // Apply on first mount (in case the page reloaded with glass mode on)
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      document.documentElement.setAttribute(ATTR, '');
    }
  }, []);

  return {
    glassMode: enabled,
    toggleGlassMode: () => setEnabled((v) => !v),
  };
}
