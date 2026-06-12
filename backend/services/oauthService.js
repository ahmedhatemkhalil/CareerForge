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
      email: data.email, // هنسيبه يرجع زي ما هو ونعالجه تحت لو null
      avatarUrl: data.avatar_url
    })
  }
};

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

  let userData = config.normalize(userResponse.data);

  if (provider === 'github' && !userData.email) {
    try {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${providerAccessToken}` }
      });
      const primaryEmailObj = emailsResponse.data.find(email => email.primary && email.verified) || emailsResponse.data[0];
      if (primaryEmailObj) {
        userData.email = primaryEmailObj.email;
      }
    } catch (emailError) {
      console.error("Failed to fetch GitHub private email: ", emailError);
    }
    
    if (!userData.email) {
      userData.email = `${userResponse.data.login}@github.com`;
    }
  }

  return userData;
};
