import mongoose from "mongoose";

import User from "../../models/User.js";

describe("User Model", () => {
  it("should apply default role, status, and plan", () => {
    const user = new User({
      name: "Test User",
      email: "defaults@test.com",
      password_hash: "hashed-password",
    });

    expect(user.role).toBe("user");
    expect(user.status).toBe("active");
    expect(user.plan).toBe("free");
  });

  it("should apply default usage counters", () => {
    const user = new User({
      name: "Test User",
      email: "usage@test.com",
      password_hash: "hashed-password",
    });

    expect(user.usage.analysesThisMonth).toBe(0);
    expect(user.usage.interviewsThisMonth).toBe(0);
    expect(user.usage.roadmapsThisMonth).toBe(0);
  });

  it("should require name, email, and password_hash", () => {
    const user = new User({});
    const error = user.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password_hash).toBeDefined();
  });

  it("should reject invalid role", () => {
    const user = new User({
      name: "Test User",
      email: "role@test.com",
      password_hash: "hashed-password",
      role: "superadmin",
    });

    const error = user.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.role).toBeDefined();
  });

  it("should reject invalid status", () => {
    const user = new User({
      name: "Test User",
      email: "status@test.com",
      password_hash: "hashed-password",
      status: "deleted",
    });

    const error = user.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.status).toBeDefined();
  });

  it("should reject invalid plan", () => {
    const user = new User({
      name: "Test User",
      email: "plan@test.com",
      password_hash: "hashed-password",
      plan: "enterprise",
    });

    const error = user.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.plan).toBeDefined();
  });

  it("should accept banned status with ban_reason", () => {
    const user = new User({
      name: "Banned User",
      email: "banned@test.com",
      password_hash: "hashed-password",
      status: "banned",
      ban_reason: "Policy violation",
    });

    const error = user.validateSync();

    expect(error).toBeUndefined();
    expect(user.ban_reason).toBe("Policy violation");
  });
});
