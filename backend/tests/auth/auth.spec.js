import request from "supertest";

import app from "../../app.js";
import User from "../../models/User.js";
import UserSettings from "../../models/UserSettings.js";
import Session from "../../models/Session.js";
import EmailVerification from "../../models/EmailVerification.js";
import {
  clearDatabase,
  closeDatabase,
  connectToTestDatabase,
} from "../../config/test-db.js";
import {
  DEFAULT_PASSWORD,
  VALID_SIGNUP,
  createVerifiedUser,
  createAdminUser,
  createVerificationRecord,
} from "./auth.helper.js";

describe("Auth Routes (integration / real DB)", () => {
  const testAgent = request(app);

  beforeAll(async () => {
    await connectToTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // ================= SIGNUP =================
  it("(POST /api/auth/signup) should register a new user", async () => {
    const res = await testAgent.post("/api/auth/signup").send(VALID_SIGNUP);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered successfully/i);
    expect(res.body.userId).toBeDefined();

    const savedUser = await User.findById(res.body.userId);
    expect(savedUser.email).toBe("authuser@test.com");
    expect(savedUser.is_verified).toBe(false);

    const settings = await UserSettings.findOne({ user_id: savedUser._id });
    const verification = await EmailVerification.findOne({
      user_id: savedUser._id,
      is_used: false,
    });

    expect(settings).not.toBeNull();
    expect(verification).not.toBeNull();
  });

  it("(POST /api/auth/signup) should return 400 when fields are missing", async () => {
    const res = await testAgent
      .post("/api/auth/signup")
      .send({ email: "incomplete@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("(POST /api/auth/signup) should return 400 for weak password", async () => {
    const res = await testAgent.post("/api/auth/signup").send({
      ...VALID_SIGNUP,
      email: "weak@test.com",
      password: "weak",
      confirmPassword: "weak",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Weak password");
  });

  it("(POST /api/auth/signup) should return 400 when email already exists", async () => {
    await createVerifiedUser({ email: "duplicate@test.com" });

    const res = await testAgent.post("/api/auth/signup").send({
      name: "Duplicate User",
      email: "duplicate@test.com",
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already exists");
  });

  // ================= LOGIN =================
  it("(POST /api/auth/login) should login a verified user", async () => {
    const user = await createVerifiedUser({ email: "login@test.com" });

    const res = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe("login@test.com");

    const sessions = await Session.find({ user_id: user._id });
    expect(sessions.length).toBe(1);
  });

  it("(POST /api/auth/login) should return 400 for wrong password", async () => {
    const user = await createVerifiedUser({ email: "wrongpass@test.com" });

    const res = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: "WrongPassword1!",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Wrong password");
  });

  it("(POST /api/auth/login) should return 401 for unverified user", async () => {
    const user = await createVerifiedUser({
      email: "unverified@test.com",
      is_verified: false,
    });

    const res = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Please verify your email first.");
  });

  it("(POST /api/auth/login) should return 403 for banned user", async () => {
    const user = await createVerifiedUser({
      email: "banned@test.com",
      status: "banned",
      ban_reason: "Policy violation",
    });

    const res = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("banned");
  });

  it("(POST /api/auth/login) should block admin users from user login", async () => {
    const admin = await createAdminUser();

    const res = await testAgent.post("/api/auth/login").send({
      email: admin.email,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin dashboard/i);
  });

  it("(POST /api/auth/login) should return 400 when user is not found", async () => {
    const res = await testAgent.post("/api/auth/login").send({
      email: "missing@test.com",
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User not found");
  });

  // ================= ADMIN LOGIN =================
  it("(POST /api/auth/admin/login) should login an admin user", async () => {
    const admin = await createAdminUser();

    const res = await testAgent.post("/api/auth/admin/login").send({
      email: admin.email,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe("admin");
  });

  it("(POST /api/auth/admin/login) should return 403 for non-admin user", async () => {
    const user = await createVerifiedUser({ email: "notadmin@test.com" });

    const res = await testAgent.post("/api/auth/admin/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin privileges/i);
  });

  // ================= LOGOUT =================
  it("(POST /api/auth/logout) should delete the current session", async () => {
    const user = await createVerifiedUser({ email: "logout@test.com" });

    const loginRes = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const res = await testAgent
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");

    const sessions = await Session.find({ user_id: user._id });
    expect(sessions.length).toBe(0);
  });

  it("(POST /api/auth/logout) should return 401 without access token", async () => {
    const res = await testAgent
      .post("/api/auth/logout")
      .send({ refreshToken: "some-token" });

    expect(res.status).toBe(401);
  });

  it("(POST /api/auth/logout) should return 400 when refresh token is missing", async () => {
    const user = await createVerifiedUser({ email: "logout-missing@test.com" });
    const loginRes = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const res = await testAgent
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Refresh token is required");
  });

  // ================= REFRESH =================
  it("(POST /api/auth/refresh) should issue new tokens", async () => {
    const user = await createVerifiedUser({ email: "refresh@test.com" });
    const loginRes = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const res = await testAgent.post("/api/auth/refresh").send({
      refreshToken: loginRes.body.refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(loginRes.body.refreshToken);

    const oldSession = await Session.findOne({
      refresh_token: loginRes.body.refreshToken,
    });
    expect(oldSession).toBeNull();
  });

  it("(POST /api/auth/refresh) should return 401 for invalid refresh token", async () => {
    const res = await testAgent.post("/api/auth/refresh").send({
      refreshToken: "invalid-refresh-token",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired refresh token/i);
  });

  // ================= SESSIONS =================
  it("(GET /api/auth/sessions) should return active sessions", async () => {
    const user = await createVerifiedUser({ email: "sessions@test.com" });
    const loginRes = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const res = await testAgent
      .get("/api/auth/sessions")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.sessions.length).toBe(1);
    expect(res.body.sessions[0].refresh_token).toBeUndefined();
  });

  it("(GET /api/auth/sessions) should return 401 without token", async () => {
    const res = await testAgent.get("/api/auth/sessions");

    expect(res.status).toBe(401);
  });

  it("(DELETE /api/auth/sessions/:sessionId) should terminate another session", async () => {
    const user = await createVerifiedUser({ email: "delete-session@test.com" });

    const firstLogin = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const sessionsRes = await testAgent
      .get("/api/auth/sessions")
      .set("Authorization", `Bearer ${firstLogin.body.accessToken}`);

    const sessionToDelete = sessionsRes.body.sessions.find(
      (session) => session.id !== undefined,
    );

    const res = await testAgent
      .delete(`/api/auth/sessions/${sessionToDelete.id}`)
      .set("Authorization", `Bearer ${firstLogin.body.accessToken}`)
      .send({ refreshToken: "different-token" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Session terminated successfully");

    const deletedSession = await Session.findById(sessionToDelete.id);
    expect(deletedSession).toBeNull();
  });

  it("(DELETE /api/auth/sessions/:sessionId) should block deleting the current session", async () => {
    const user = await createVerifiedUser({ email: "current-session@test.com" });
    const loginRes = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const sessionsRes = await testAgent
      .get("/api/auth/sessions")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

    const currentSessionId = sessionsRes.body.sessions[0].id;

    const res = await testAgent
      .delete(`/api/auth/sessions/${currentSessionId}`)
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/logout instead/i);
  });

  it("(DELETE /api/auth/sessions/:sessionId) should return 404 for unknown session", async () => {
    const user = await createVerifiedUser({ email: "missing-session@test.com" });
    const loginRes = await testAgent.post("/api/auth/login").send({
      email: user.email,
      password: DEFAULT_PASSWORD,
    });

    const res = await testAgent
      .delete("/api/auth/sessions/6a4ab2363bea96623b9a0723")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ refreshToken: "other-token" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Session not found");
  });

  // ================= EMAIL VERIFICATION =================
  it("(GET /api/auth/verify-email/:token) should verify a valid token", async () => {
    const user = await createVerifiedUser({
      email: "verify@test.com",
      is_verified: false,
    });
    await createVerificationRecord(user._id, "valid-token-abc");

    const res = await testAgent.get("/api/auth/verify-email/valid-token-abc");

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Email Verified Successfully/i);

    const updatedUser = await User.findById(user._id);
    const verification = await EmailVerification.findOne({
      token: "valid-token-abc",
    });

    expect(updatedUser.is_verified).toBe(true);
    expect(verification.is_used).toBe(true);
  });

  it("(GET /api/auth/verify-email/:token) should reject invalid token", async () => {
    const res = await testAgent.get("/api/auth/verify-email/invalid-token");

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Invalid or Expired Token/i);
  });

  it("(POST /api/auth/resend-verification) should resend verification email", async () => {
    const user = await createVerifiedUser({
      email: "resend@test.com",
      is_verified: false,
    });

    const res = await testAgent
      .post("/api/auth/resend-verification")
      .send({ email: user.email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const verification = await EmailVerification.findOne({
      user_id: user._id,
      is_used: false,
    });
    expect(verification).not.toBeNull();
  });

  it("(POST /api/auth/resend-verification) should return 400 when already verified", async () => {
    const user = await createVerifiedUser({ email: "already-verified@test.com" });

    const res = await testAgent
      .post("/api/auth/resend-verification")
      .send({ email: user.email });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already verified");
  });

  it("(POST /api/auth/resend-verification) should return 404 when user is not found", async () => {
    const res = await testAgent
      .post("/api/auth/resend-verification")
      .send({ email: "missing-user@test.com" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
