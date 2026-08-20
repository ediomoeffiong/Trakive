/**
 * @file NotificationSearch.jsx
 * @description Debounced search input that syncs its value to the notification store.
 */

import { useState, useEffect, useRef } from 'react';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import { useNotificationStore } from '../../store';

/**
 * @param {object}  props
 * @param {string}  [props.placeholder]
 * @param {number}  [props.debounceMs=300]
 */
const NotificationSearch = ({
  placeholder = 'Search notifications...',
  debounceMs = 300,
}) => {
  const setSearchQuery = useNotificationStore((s) => s.setSearchQuery);
  const storeQuery = useNotificationStore((s) => s.searchQuery);

  const [localValue, setLocalValue] = useState(storeQuery);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce sync to store
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearchQuery(localValue);
    }, debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [localValue, setSearchQuery, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <RiSearchLine
        aria-hidden
        style={{
          position: 'absolute',
          left: '0.875rem',
          color: focused ? 'var(--color-primary-500)' : 'var(--color-neutral-400)',
          fontSize: '1rem',
          transition: 'color 0.15s',
          pointerEvents: 'none',
        }}
      />
      <input
        ref={inputRef}
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Search notifications"
        id="notification-search"
        className="input-field"
        style={{
          paddingLeft: '2.375rem',
          paddingRight: localValue ? '2.5rem' : '0.875rem',
          height: '40px',
          width: '100%',
          transition: 'box-shadow 0.15s',
        }}
      />
      {localValue && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="btn btn-ghost btn-icon"
          style={{
            position: 'absolute',
            right: '0.25rem',
            fontSize: '1rem',
            color: 'var(--color-neutral-400)',
            padding: '4px',
          }}
        >
          <RiCloseLine />
        </button>
      )}
    </div>
  );
};

export default NotificationSearch;
