const getImageUrl = (path) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  if (!path) return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
  
  // If path is already a full URL
  if (path.startsWith('http')) {
    // Standardize localhost to the current API base (handles case where DB has 5005 but server is 5000)
    return path.replace(/http:\/\/localhost:\d+/, apiBase);
  }
  
  // Handle relative paths from server
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${cleanPath}`;
};

export default getImageUrl;
