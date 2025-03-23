
import { format } from 'date-fns';

/**
 * Returns a CSS class for a platform color
 */
export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'facebook':
      return 'bg-blue-500';
    case 'google':
      return 'bg-red-500';
    case 'instagram':
      return 'bg-purple-500';
    case 'twitter':
      return 'bg-sky-500';
    case 'linkedin':
      return 'bg-blue-700';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Returns a CSS class for a status color
 */
export const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'active':
    case 'connected':
      return 'text-green-500';
    case 'inactive':
    case 'disconnected':
      return 'text-red-500';
    case 'pending':
      return 'text-amber-500';
    default:
      return 'text-gray-500';
  }
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateString: string | null) => {
  try {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};
