export const getURL = () => {
  let url = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';

  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  if (!url.endsWith('/')) {
    url = `${url}/`;
  }

  return url;
};

// Note: Current frontend does not call Supabase directly.
// This utility is included for future auth flows requiring redirectTo/emailRedirectTo.
