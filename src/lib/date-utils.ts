
import { format, parse, isToday, isPast, isFuture, formatDistanceToNow } from 'date-fns';

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy');
}

/**
 * Format a time to a human-readable string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

/**
 * Format a date and time to a human-readable string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Check if a date is today
 */
export function checkIsToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday(dateObj);
}

/**
 * Check if a date is in the past
 */
export function checkIsPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isPast(dateObj);
}

/**
 * Check if a date is in the future
 */
export function checkIsFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isFuture(dateObj);
}

/**
 * Parse a date string in a specific format
 */
export function parseDate(dateString: string, formatString: string): Date {
  return parse(dateString, formatString, new Date());
}

/**
 * Format duration in minutes to a human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}
