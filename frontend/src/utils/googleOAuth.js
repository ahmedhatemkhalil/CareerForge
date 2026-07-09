const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const startGoogleOAuth = () => {
  const redirectUri = `${window.location.origin}/oauth/callback`;

  localStorage.setItem("oauth_provider", "google");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};
