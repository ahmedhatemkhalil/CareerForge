import request from "supertest";
import app from "../../app.js";
import User from "../../models/User.js";
import OAuthAccount from "../../models/OAuthAccount.js";
import axios from "axios";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createOauthTestData } from "./oauth.helper.js";
import { mockNewOauthUser, mockExistingOauthUser, mockLinkOauthResponse } from "./oauth.mock.js";

describe("OAuth Routes Integration Tests", () => {
    const testAgent = request(app);
    let regularUser, regularToken, oauthUser, oauthToken, oauthAccount, bannedUser;

    beforeAll(async () => {
        await connectToTestDatabase();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    async function setupData() {
        ({ regularUser, regularToken, oauthUser, oauthToken, oauthAccount, bannedUser } = await createOauthTestData());
    }

    // ==========================================
    // 1. POST /api/oauth/:provider (تسجيل أو دخول)
    // ==========================================
    describe("POST /api/oauth/:provider", () => {
        it("should register a completely new user via OAuth", async () => {
            spyOn(axios, "post").and.resolveTo({
                data: { access_token: "mock_access_token" }
            });

            spyOn(axios, "get").and.resolveTo({
                data: {
                    id: mockNewOauthUser.providerId,
                    name: mockNewOauthUser.name,
                    email: mockNewOauthUser.email,
                    picture: mockNewOauthUser.avatarUrl
                }
            });

            const res = await testAgent
                .post("/api/oauth/google")
                .send({ code: "mock_code", redirectUri: "http://localhost:5173/oauth/callback" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.isNewUser).toBe(true);
            expect(res.body.data.user.email).toBe(mockNewOauthUser.email);
        });

        it("should login an existing OAuth user successfully", async () => {
            await setupData();
            const existingMock = mockExistingOauthUser(oauthAccount.provider_id, oauthUser.email, oauthUser.name);
            
            spyOn(axios, "post").and.resolveTo({
                data: { access_token: "existing_access_token" }
            });

            spyOn(axios, "get").and.resolveTo({
                data: {
                    id: existingMock.providerId,
                    name: existingMock.name,
                    email: existingMock.email,
                    picture: existingMock.avatarUrl
                }
            });

            const res = await testAgent
                .post("/api/oauth/google")
                .send({ code: "existing_code" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.isNewUser).toBe(false);
            expect(res.body.data.user.id.toString()).toBe(oauthUser._id.toString());
        });

        it("should return 403 if the user is banned", async () => {
            await setupData();
            
            spyOn(axios, "post").and.resolveTo({
                data: { access_token: "banned_access_token" }
            });

            spyOn(axios, "get").and.resolveTo({
                data: {
                    id: "banned_123",
                    name: bannedUser.name,
                    email: bannedUser.email,
                    picture: "http://banned-image.com"
                }
            });

            await OAuthAccount.create({ user_id: bannedUser._id, provider: "google", provider_id: "banned_123" });

            const res = await testAgent.post("/api/oauth/google").send({ code: "banned_code" });
            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Account is banned");
        });
    });

    // ==========================================
    // 2. POST /api/oauth/:provider/link (ربط الحساب)
    // ==========================================
    describe("POST /api/oauth/:provider/link", () => {
        it("should link a new provider account to currently logged in regular user", async () => {
            await setupData();
            
            spyOn(axios, "post").and.resolveTo({
                data: { access_token: "link_access_token" }
            });

            spyOn(axios, "get").and.resolveTo({
                data: {
                    id: mockLinkOauthResponse.providerId,
                    name: mockLinkOauthResponse.name,
                    email: mockLinkOauthResponse.email,
                    avatar_url: mockLinkOauthResponse.avatarUrl
                }
            });

            const res = await testAgent
                .post("/api/oauth/github/link")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({ code: "github_code" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const linked = await OAuthAccount.findOne({ user_id: regularUser._id, provider: "github" });
            expect(linked).not.toBeNull();
            expect(linked.provider_id).toBe(mockLinkOauthResponse.providerId);
        });

        it("should return 400 if provider is already linked to another user", async () => {
            await setupData();
            
            spyOn(axios, "post").and.resolveTo({
                data: { access_token: "already_linked_token" }
            });

            spyOn(axios, "get").and.resolveTo({
                data: {
                    id: oauthAccount.provider_id,
                    email: "any@email.com"
                }
            });

            const res = await testAgent
                .post("/api/oauth/google/link")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({ code: "code" });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Provider already linked to another account");
        });
    });

    

    // ==========================================
    // 3. DELETE /api/oauth/:provider/unlink 
    // ==========================================
    describe("DELETE /api/oauth/:provider/unlink", () => {
        it("should return 400 if user tries to unlink their only login method without a password", async () => {
            await setupData();
            
            await User.findByIdAndUpdate(oauthUser._id, { $unset: { password_hash: "" } });

            const res = await testAgent
                .delete("/api/oauth/google/unlink")
                .set("Authorization", `Bearer ${oauthToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error).toContain("Cannot unlink the only login method");
        });

        it("should successfully unlink if user has multiple login options or a password", async () => {
            await setupData();
            await OAuthAccount.create({ user_id: oauthUser._id, provider: "github", provider_id: "git_123" });

            const res = await testAgent
                .delete("/api/oauth/google/unlink")
                .set("Authorization", `Bearer ${oauthToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("OAuth account unlinked successfully");
        });
    });
});