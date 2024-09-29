/**
 * Format a date to a string like 2017-06-01
 * @param date
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
  // return date.toLocaleDateString('en-GB', {
  //   day: 'numeric',
  //   month: 'short',
  //   year: 'numeric',
  // }).toUpperCase().replace(/ /g, '-');
}