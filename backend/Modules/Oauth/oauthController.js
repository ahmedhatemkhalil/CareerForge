import User from '../../models/User.js';
import OAuthAccount from '../../models/OAuthAccount.js';
import { getOauthUserData } from '../../services/oauthService.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const generateAuthTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' }, 
    process.env.REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken, expiresIn: 900 };
};

// ==========================================
// POST /api/auth/oauth/{provider}
// ==========================================
export const oauthLoginOrRegister = async (req, res) => {
  const { provider } = req.params;
  const { code, redirectUri } = req.body;

  try {
    const oauthData = await getOauthUserData(provider, code, redirectUri);

    let isNewUser = false;
    let currentUser = null;

    let oauthAccount = await OAuthAccount.findOne({ provider, provider_id: oauthData.providerId });

    if (oauthAccount) {
      currentUser = await User.findById(oauthAccount.user_id);
      
      if (!currentUser) {
        await OAuthAccount.deleteOne({ _id: oauthAccount._id });
        oauthAccount = null;
      }
    }

    if (!oauthAccount) {
      let user = await User.findOne({ email: oauthData.email });

      if (!user) {
        isNewUser = true;

        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await User.create({
          name: oauthData.name || 'OAuth User',
          email: oauthData.email,
          password_hash: hashedPassword,
          avatar_url: oauthData.avatarUrl || null,
          is_verified: true,
          status: 'active',
          role: 'user'
        });

        await OAuthAccount.create({ 
          user_id: user._id, 
          provider, 
          provider_id: oauthData.providerId 
        });

        currentUser = user;
      } else {
        const existingLink = await OAuthAccount.findOne({ user_id: user._id, provider });
        if (!existingLink) {
          await OAuthAccount.create({ user_id: user._id, provider, provider_id: oauthData.providerId });
        }
        currentUser = user;
      }
    }

    if (!currentUser || !currentUser._id) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    if (currentUser.status === 'banned') return res.status(403).json({ success: false, error: "Account is banned" });
    if (currentUser.status === 'suspended') return res.status(403).json({ success: false, error: "Account is suspended" });

    if (currentUser.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin accounts must sign in through the admin dashboard, not the user app.",
      });
    }

    currentUser.last_login_at = new Date();
    await currentUser.save();

    const tokens = generateAuthTokens(currentUser);

    return res.status(200).json({
      success: true,
      message: isNewUser ? "OAuth registration successful" : "OAuth login successful",
      data: {
        ...tokens,
        isNewUser,
        user: {
          id: currentUser._id, 
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.avatar_url,
          role: currentUser.role,
          status: currentUser.status,
          isVerified: currentUser.is_verified
        }
      }
    });

  } catch (error) {
    console.error("OAuth Error: ", error); 
    if (error.message === 'INVALID_PROVIDER') return res.status(400).json({ success: false, error: "Provider not supported" });
    if (error.message === 'INVALID_CODE') return res.status(400).json({ success: false, error: "Invalid OAuth code" });
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ==========================================
// POST /api/auth/oauth/{provider}/link
// ==========================================
export const linkOauthAccount = async (req, res) => {
  const { provider } = req.params;
  const { code, redirectUri } = req.body;
  const userId = req.user.id; 

  try {
    const oauthData = await getOauthUserData(provider, code, redirectUri);

    const existingLink = await OAuthAccount.findOne({ provider, provider_id: oauthData.providerId });
    if (existingLink) {
      return res.status(400).json({ success: false, error: "Provider already linked to another account" });
    }

    const alreadyLinked = await OAuthAccount.findOne({ user_id: userId, provider });
    if (alreadyLinked) {
      return res.status(400).json({ success: false, error: "Account already linked to another user" });
    }

    await OAuthAccount.create({ user_id: userId, provider, provider_id: oauthData.providerId });

    return res.status(200).json({ success: true, message: "OAuth account linked successfully" });

  } catch (error) {
    console.error("Link OAuth Error: ", error);
    if (error.message === 'INVALID_PROVIDER') return res.status(400).json({ success: false, error: "Provider not supported" });
    if (error.message === 'INVALID_CODE') return res.status(400).json({ success: false, error: "Invalid OAuth code" });
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ==========================================
// DELETE /api/auth/oauth/{provider}/unlink
// ==========================================
export const unlinkOauthAccount = async (req, res) => {
  const { provider } = req.params;
  const userId = req.user.id;

  try {
    const oauthAccount = await OAuthAccount.findOne({ user_id: userId, provider });
    if (!oauthAccount) {
      return res.status(404).json({ success: false, error: "Linked OAuth account not found" });
    }

    const totalLinkedOauth = await OAuthAccount.countDocuments({ user_id: userId });
    const user = await User.findById(userId);
    
    if (totalLinkedOauth === 1 && !user.password_hash) { 
      return res.status(400).json({ 
        success: false, 
        error: "Cannot unlink the only login method. Set a password first" 
      });
    }

    await OAuthAccount.deleteOne({ _id: oauthAccount._id });

    return res.status(200).json({ success: true, message: "OAuth account unlinked successfully" });

  } catch (error) {
    console.error("Unlink OAuth Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
