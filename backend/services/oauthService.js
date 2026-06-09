import axios from 'axios';

const providersConfig = {
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    extraParams: () => ({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'authorization_code'
    }),
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
    extraParams: () => ({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET
    }),
    normalize: (data) => ({
      providerId: data.id.toString(),
      name: data.name || data.login,
      email: data.email || `${data.login}@github.com`,
      avatarUrl: data.avatar_url
    })
  }
};

// التأكد من وجود كلمة export const هنا بالظبط عشان الكنترولر يشوفها
export const getOauthUserData = async (provider, code, redirectUri) => {
  const config = providersConfig[provider];
  if (!config) throw new Error('INVALID_PROVIDER');

  const tokenResponse = await axios.post(config.tokenUrl, {
    code,
    redirect_uri: redirectUri,
    ...config.extraParams()
  }, { headers: { Accept: 'application/json' } });

  const providerAccessToken = tokenResponse.data.access_token;
  if (!providerAccessToken) throw new Error('INVALID_CODE');

  const userResponse = await axios.get(config.userUrl, {
    headers: { Authorization: `Bearer ${providerAccessToken}` }
  });

  return config.normalize(userResponse.data);
};