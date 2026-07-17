/**
 * @file helpers.js
 * @description General-purpose helper functions for Trakive.
 */

/**
 * Create a class-name string from a list of values (filters out falsy values).
 * Equivalent to the popular `clsx` library — avoids an extra dependency.
 * @param  {...(string|boolean|null|undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Deeply clone a plain object / array (no functions or circular refs).
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sleep for `ms` milliseconds. Use with `await` in async functions.
 * @param {number} ms
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number}   delay  Milliseconds
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a simple random ID string (NOT cryptographically secure).
 * @param {number} [length=8]
 */
export function generateId(length = 8) {
  return Math.random().toString(36).slice(2, 2 + length);
}

/**
 * Pick specific keys from an object.
 * @template T, K
 * @param {T}     obj
 * @param {K[]}   keys
 * @returns {Pick<T, K>}
 */
export function pick(obj, keys) {
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}

/**
 * Omit specific keys from an object.
 * @template T
 * @param {T}       obj
 * @param {string[]} keys
 */
export function omit(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k)),
  );
}
