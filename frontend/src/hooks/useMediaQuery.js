/**
 * @file useMediaQuery.js
 * @description Hook that returns true when a CSS media query matches.
 */

import { useState, useEffect } from 'react';

/**
 * @param {string} query  A CSS media query string, e.g. "(max-width: 1023px)"
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Convenience: returns true on mobile / tablet (< 1024px) */
export function useIsMobile() {
  return useMediaQuery('(max-width: 1023px)');
}
