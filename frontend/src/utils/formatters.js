export const formatCurrency = (value) => {
  if (!value) return '0';
  
  // Convert to number if string
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  // Format with Indian numbering system (lakhs and crores)
  const formatter = Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  
  return formatter.format(number);
};

export const formatArea = (value) => {
  if (!value) return '0';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-IN').format(number);
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30.44); // Average days in month
  const years = Math.round(days / 365.25); // Account for leap years

  if (seconds < 45) return "Just now";
  if (seconds < 90) return "A minute ago";
  if (minutes < 45) return `${minutes} minutes ago`;
  if (minutes < 90) return "An hour ago";
  if (hours < 22) return `${hours} hours ago`;
  if (hours < 36) return "A day ago";
  if (days < 25) return `${days} days ago`;
  if (days < 45) return "A month ago";
  if (months < 11) return `${months} months ago`;
  if (months < 18) return "A year ago";
  if (years > 0) return `${years} years ago`;
  
  // Fallback to a simple date format if very old or in the future
  return `On ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};