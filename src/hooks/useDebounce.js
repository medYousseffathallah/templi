import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing callbacks
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} - Debounced callback
 */
export const useDebounceCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Custom hook for debounced search with loading state
 * @param {Function} searchFunction - The search function to call
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Object} - Search state and functions
 */
export const useDebouncedSearch = (searchFunction, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef(null);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        setHasSearched(false);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const searchResults = await searchFunction(debouncedQuery, {
          signal: abortControllerRef.current.signal
        });
        
        if (!abortControllerRef.current.signal.aborted) {
          setResults(searchResults || []);
          setLoading(false);
        }
      } catch (err) {
        if (!abortControllerRef.current.signal.aborted) {
          setError(err.message || 'Search failed');
          setResults([]);
          setLoading(false);
        }
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const setSearchQuery = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    debouncedQuery,
    results,
    loading,
    error,
    hasSearched,
    setQuery: setSearchQuery,
    clearSearch
  };
};

/**
 * Custom hook for throttling values
 * @param {any} value - The value to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {any} - Throttled value
 */
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Custom hook for throttling callbacks
 * @param {Function} callback - The callback function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} - Throttled callback
 */
export const useThrottleCallback = (callback, limit, deps = []) => {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback((...args) => {
    if (Date.now() - lastRan.current >= limit) {
      callbackRef.current(...args);
      lastRan.current = Date.now();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        lastRan.current = Date.now();
      }, limit - (Date.now() - lastRan.current));
    }
  }, [limit, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

export default useDebounce;