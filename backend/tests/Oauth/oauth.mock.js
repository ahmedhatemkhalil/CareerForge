// tests/Oauth/oauth.mock.js

export const mockNewOauthUser = {
    providerId: "google_999888777",
    email: "newoauth@test.com",
    name: "New OAuth User",
    avatarUrl: "https://lh3.googleusercontent.com/mock"
};

export const mockExistingOauthUser = (providerId, email, name) => ({
    providerId: providerId || "google_123456789",
    email: email || "googleuser@test.com",
    name: name || "Google User",
    avatarUrl: "http://googleusercontent.com/profile/picture/existing"
});

export const mockLinkOauthResponse = {
    providerId: "new_github_link_999",
    email: "regular@test.com",
    name: "Regular User GitHub",
    avatarUrl: "http://github.com/avatar"
};