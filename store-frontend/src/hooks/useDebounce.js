import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param {any} value The value to debounce
 * @param {number} delay The delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value or delay changes
    // This is how we "reset" the timer on every keystroke
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}