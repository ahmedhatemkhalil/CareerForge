import axios from 'axios';

const providersConfig = {
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    normalize: (data) => ({
      providerId: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.picture
    })
  },

  github: {
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    normalize: (data) => ({
      providerId: data.id.toString(),
      name: data.name || data.login,
      email: data.email,
      avatarUrl: data.avatar_url
    })
  }
};

export const getOauthUserData = async (provider, code, redirectUri) => {
  const config = providersConfig[provider];
  if (!config) throw new Error('INVALID_PROVIDER');

  // =========================
  // 1. GET ACCESS TOKEN
  // =========================
 const tokenResponse = await axios.post(
  config.tokenUrl,
  new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: "http://localhost:5173/oauth/callback", // تأكدي أن هذا هو المسار بالضبط
    grant_type: 'authorization_code'
  }).toString(), // تأكدي من تحويلها لـ string
  {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }
);

  const accessToken = tokenResponse.data.access_token;

  if (!accessToken) throw new Error('INVALID_CODE');

  // =========================
  // 2. GET USER DATA
  // =========================
  const userResponse = await axios.get(config.userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  let userData = config.normalize(userResponse.data);

  // =========================
  // GitHub email fallback
  // =========================
  if (provider === 'github' && !userData.email) {
    try {
      const emailsRes = await axios.get(
        'https://api.github.com/user/emails',
        {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            Authorization: `Bearer ${accessToken}`
            
          }
        }
      );

      const primary = emailsRes.data.find(e => e.primary && e.verified);
      userData.email = primary?.email || emailsRes.data[0]?.email;
    } catch (e) {
      userData.email = `${userResponse.data.login}@github.com`;
    }
  }

  return userData;
};