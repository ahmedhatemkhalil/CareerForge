import bcrypt from "bcrypt";
import request from "supertest";

import app from "../../app.js";
import User from "../../models/User.js";
import UserSettings from "../../models/UserSettings.js";
import {
  clearDatabase,
  closeDatabase,
  connectToTestDatabase,
} from "../../config/test-db.js";
import {
  createUserAndToken,
  DEFAULT_PASSWORD,
  NEW_PASSWORD,
} from "./user.helper.js";

describe("User Routes (integration / real DB)", () => {
  const testAgent = request(app);
  let token;
  let user;

  beforeAll(async () => {
    await connectToTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  async function setupTestData(options = {}) {
    ({ user, token } = await createUserAndToken(options));
  }

  it("(GET /api/users/me) without token should return 401", async () => {
    const res = await testAgent.get("/api/users/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authenticate/i);
  });

  it("(GET /api/users/me) should return current user without password_hash", async () => {
    await setupTestData({ email: "me@test.com", name: "Profile User" });

    const res = await testAgent
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Profile User");
    expect(res.body.email).toBe("me@test.com");
    expect(res.body.password_hash).toBeUndefined();
  });

  it("(PUT /api/users/me) should update name in the database", async () => {
    await setupTestData({ email: "update-name@test.com" });

    const res = await testAgent
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");

    const savedUser = await User.findById(user._id);
    expect(savedUser.name).toBe("Updated Name");
  });

  it("(PUT /api/users/me) should reject email updates", async () => {
    await setupTestData({ email: "no-email-update@test.com" });

    const res = await testAgent
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "hacked@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("You can't update email");

    const savedUser = await User.findById(user._id);
    expect(savedUser.email).toBe("no-email-update@test.com");
  });

  it("(PUT /api/users/me) should return 400 when nothing to update", async () => {
    await setupTestData({ email: "empty-update@test.com" });

    const res = await testAgent
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Nothing to update");
  });

  it("(PUT /api/users/me/password) should update password in the database", async () => {
    await setupTestData({ email: "password-change@test.com" });

    const res = await testAgent
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: DEFAULT_PASSWORD,
        newPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");

    const savedUser = await User.findById(user._id);
    const matchesNewPassword = await bcrypt.compare(
      NEW_PASSWORD,
      savedUser.password_hash,
    );
    expect(matchesNewPassword).toBe(true);
  });

  it("(PUT /api/users/me/password) should reject wrong current password", async () => {
    await setupTestData({ email: "wrong-password@test.com" });

    const res = await testAgent
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "WrongPassword1!",
        newPassword: NEW_PASSWORD,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Current password is wrong");
  });

  it("(PUT /api/users/me/password) should reject weak new password", async () => {
    await setupTestData({ email: "weak-password@test.com" });

    const res = await testAgent
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: DEFAULT_PASSWORD,
        newPassword: "weak",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Weak password");
  });

  it("(POST /api/users/me/avatar) should return 401 without token", async () => {
    const res = await testAgent.post("/api/users/me/avatar");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authenticate/i);
  });

  it("(POST /api/users/me/avatar) should return 400 when no file is uploaded", async () => {
    await setupTestData({ email: "avatar-missing@test.com" });

    const res = await testAgent
      .post("/api/users/me/avatar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please upload an image");
  });

  it("(POST /api/users/me/avatar) should upload avatar and update user", async () => {
    await setupTestData({ email: "avatar-upload@test.com" });

    const res = await testAgent
      .post("/api/users/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", Buffer.from("fake-image-content"), {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.avatar_url).toMatch(/\/uploads\/avatars\//);

    const savedUser = await User.findById(user._id);
    expect(savedUser.avatar_url).toBe(res.body.avatar_url);
  });

  it("(DELETE /api/users/me) should delete user from the database", async () => {
    await setupTestData({ email: "delete-user@test.com" });

    await UserSettings.create({ user_id: user._id, theme: "light" });

    const res = await testAgent
      .delete("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Your account has been deleted successfully");

    const deletedUser = await User.findById(user._id);
    const deletedSettings = await UserSettings.findOne({ user_id: user._id });

    expect(deletedUser).toBeNull();
    expect(deletedSettings).toBeNull();
  });

  it("should enforce unique email in the database", async () => {
    await setupTestData({ email: "unique@test.com" });

    await expectAsync(
      User.create({
        name: "Duplicate User",
        email: "unique@test.com",
        password_hash: "hashed-password",
      }),
    ).toBeRejected();
  });

  it("should lowercase and trim email when saving to the database", async () => {
    const created = await User.create({
      name: "Email User",
      email: "  MixedCase@Test.COM  ",
      password_hash: "hashed-password",
    });

    expect(created.email).toBe("mixedcase@test.com");
  });
});
