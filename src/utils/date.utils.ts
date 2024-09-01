/**
 * Format a date to a string like 30-AUG-2024
 * @param date
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase().replace(/ /g, '-');
}