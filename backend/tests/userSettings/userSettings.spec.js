import request from "supertest";

import app from "../../app.js";
import UserSettings from "../../models/UserSettings.js";
import {
  clearDatabase,
  closeDatabase,
  connectToTestDatabase,
} from "../../config/test-db.js";
import { createUserAndToken } from "./userSettings.helper.js";

describe("UserSettings Routes (integration / real DB)", () => {
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

  async function setupTestData(email = "settings@test.com") {
    ({ user, token } = await createUserAndToken(email));
  }

  it("(GET /api/users/me/settings) without token should return 401", async () => {
    const res = await testAgent.get("/api/users/me/settings");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authenticate/i);
  });

  it("(GET /api/users/me/settings) should create default settings in the database", async () => {
    await setupTestData();

    const res = await testAgent
      .get("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("light");

    const savedSettings = await UserSettings.findOne({ user_id: user._id });
    expect(savedSettings).not.toBeNull();
    expect(savedSettings.theme).toBe("light");
  });

  it("(GET /api/users/me/settings) should return existing settings from the database", async () => {
    await setupTestData("existing-settings@test.com");

    await UserSettings.create({
      user_id: user._id,
      theme: "dark",
    });

    const res = await testAgent
      .get("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("dark");
    expect(res.body.user_id).toBe(user._id.toString());
  });

  it("(PUT /api/users/me/settings) should persist theme update in the database", async () => {
    await setupTestData("update-settings@test.com");

    await UserSettings.create({
      user_id: user._id,
      theme: "light",
    });

    const res = await testAgent
      .put("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ theme: "dark" });

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("dark");

    const savedSettings = await UserSettings.findOne({ user_id: user._id });
    expect(savedSettings.theme).toBe("dark");
  });

  it("(PUT /api/users/me/settings) should return 400 for an invalid theme", async () => {
    await setupTestData("invalid-theme@test.com");

    await UserSettings.create({
      user_id: user._id,
      theme: "light",
    });

    const res = await testAgent
      .put("/api/users/me/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ theme: "purple" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Theme must be dark or light");

    const savedSettings = await UserSettings.findOne({ user_id: user._id });
    expect(savedSettings.theme).toBe("light");
  });

  it("(PUT /api/users/me/settings) should reject invalid theme at database level", async () => {
    await setupTestData("schema-validation@test.com");

    await UserSettings.create({
      user_id: user._id,
      theme: "light",
    });

    const settings = await UserSettings.findOne({ user_id: user._id });
    settings.theme = "purple";
    const validationError = settings.validateSync();

    expect(validationError).toBeTruthy();
    expect(validationError.errors.theme).toBeDefined();
  });
});
