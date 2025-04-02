interface FormatTimeOptions {
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  compact?: boolean;
}

/**
 * Format seconds into a human-readable time string
 * @param seconds - Time in seconds
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  seconds: number, 
  options: FormatTimeOptions = {
    showHours: true,
    showMinutes: true,
    showSeconds: false,
    compact: false
  }
): string {
  const { 
    showHours = true, 
    showMinutes = true, 
    showSeconds = false,
    compact = false 
  } = options;

  if (isNaN(seconds) || seconds < 0) {
    return "0m";
  }

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // Format parts based on options
  const parts = [];

  if (days > 0) {
    parts.push(`${days}${compact ? 'd' : ' day' + (days === 1 ? '' : 's')}`);
  }

  if (showHours && (hours > 0 || days > 0)) {
    parts.push(`${hours}${compact ? 'h' : ' hour' + (hours === 1 ? '' : 's')}`);
  }

  if (showMinutes && (minutes > 0 || parts.length === 0)) {
    parts.push(`${minutes}${compact ? 'm' : ' min' + (minutes === 1 ? '' : 's')}`);
  }

  if (showSeconds && secs > 0) {
    parts.push(`${secs}${compact ? 's' : ' sec' + (secs === 1 ? '' : 's')}`);
  }

  return parts.join(compact ? ' ' : ' ');
}

/**
 * Calculate total seconds from a duration object
 */
export function calculateSeconds({ days = 0, hours = 0, minutes = 0, seconds = 0 }): number {
  return (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. prefix if present
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}

/**
 * Calculate percentage of time spent
 */
export function calculatePercentage(time: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((time / total) * 100);
}

/**
 * Calculate trend percentage change
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
