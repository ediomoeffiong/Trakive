/**
 * @file helpers.js
 * @description General-purpose helper functions for Trakive.
 */

import { ROUTES } from '../constants';

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

/**
 * Get default home route for a given user role.
 * @param {string} role
 * @returns {string}
 */
export function getRoleDefaultRoute(role) {
  if (role === 'Supervisor' || role === 'supervisor') {
    return ROUTES.SUPERVISOR_DASHBOARD || '/supervisor/dashboard';
  }
  if (role === 'HR Administrator' || role === 'hr_admin') {
    return ROUTES.ADMIN_DASHBOARD || '/admin/dashboard';
  }
  if (role === 'Department Head' || role === 'department_head') {
    return ROUTES.DEPARTMENT_HEAD_DASHBOARD || '/department-head';
  }
  return ROUTES.DASHBOARD || '/dashboard';
}


