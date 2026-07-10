// tests/Oauth/oauth.helper.js
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import OAuthAccount from "../../models/OAuthAccount.js";

export async function createOauthTestData() {
    const mockHash = "$2b$10$MOCKHASHFOROAUTHTESTINGPURPOSES123456";

    const regularUser = await User.create({
        name: "Regular User",
        email: "regular@test.com",
        password_hash: mockHash, 
        status: "active"
    });
    const regularToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET || "testsecret");

    const oauthUser = await User.create({
        name: "OAuth User",
        email: "oauthuser@test.com",
        password_hash: mockHash,
        status: "active"
    });
    const oauthToken = jwt.sign({ id: oauthUser._id }, process.env.JWT_SECRET || "testsecret");

    const oauthAccount = await OAuthAccount.create({
        user_id: oauthUser._id,
        provider: "google",
        provider_id: "google_123456789"
    });

    const bannedUser = await User.create({
        name: "Banned User",
        email: "banned@test.com",
        password_hash: mockHash, 
        status: "banned"
    });

    return { regularUser, regularToken, oauthUser, oauthToken, oauthAccount, bannedUser };
}