/**
 * @file taskCategories.js
 * @description Task category options for the Supervisor Task Management module.
 */

export const TASK_CATEGORIES = [
  { value: 'Engineering', label: 'Engineering', color: '#4f46e5', bg: '#eef2ff', icon: 'RiCodeSSlashLine' },
  { value: 'Design', label: 'Design', color: '#7c3aed', bg: '#faf5ff', icon: 'RiPenNibLine' },
  { value: 'Research', label: 'Research', color: '#0891b2', bg: '#ecfeff', icon: 'RiSearchEyeLine' },
  { value: 'Documentation', label: 'Documentation', color: '#d97706', bg: '#fffbeb', icon: 'RiFileTextLine' },
  { value: 'QA Testing', label: 'QA Testing', color: '#dc2626', bg: '#fef2f2', icon: 'RiBugLine' },
  { value: 'Product', label: 'Product', color: '#059669', bg: '#ecfdf5', icon: 'RiProductHuntLine' },
  { value: 'Onboarding', label: 'Onboarding', color: '#9333ea', bg: '#fdf4ff', icon: 'RiUserAddLine' },
];

export const getCategoryConfig = (categoryValue) => {
  return TASK_CATEGORIES.find((c) => c.value === categoryValue) || TASK_CATEGORIES[0];
};

export default TASK_CATEGORIES;
