export const getMediaUrl = (url) => {
  if (!url) return '/placeholder.svg';
  
  // If the URL is already absolute (starts with http:// or https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If the URL is a relative media URL
  if (url.startsWith('/media/')) {
    return `${import.meta.env.VITE_API_URL}${url}`;
  }

  // For other relative URLs, prepend the API URL
  return `${import.meta.env.VITE_API_URL}/media/${url}`;
};