import express from "express";
import request from "supertest";

import forgotPasswordRoutes from "../../Modules/ForgotPassword/forgotPassword.routes.js";

// Tests that the forgot password routes map requests to the correct handlers.
describe("Forgot Password Routes", () => {
  let app;

  // Sets up a fresh Express app with the forgot password router before each test.
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/users", forgotPasswordRoutes);
  });

  // Ensures the forgot-password endpoint returns the expected validation response.
  it("routes POST /api/users/forgot-password and validates invalid input", async () => {
    const response = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Valid email is required" });
  });

  // Ensures the OTP verification endpoint rejects missing request data.
  it("routes POST /api/users/verify-reset-otp and validates missing fields", async () => {
    const response = await request(app)
      .post("/api/users/verify-reset-otp")
      .send({ email: "user@gmail.com" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Email and OTP are required" });
  });

  // Ensures the password reset endpoint requires all needed fields.
  it("routes POST /api/users/reset-password-otp and validates missing fields", async () => {
    const response = await request(app)
      .post("/api/users/reset-password-otp")
      .send({ email: "user@gmail.com", otp: "123456" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Email, OTP, and password are required",
    });
  });

  // Ensures the resend-OTP endpoint returns validation errors for invalid email input.
  it("routes POST /api/users/resend-otp and validates invalid input", async () => {
    const response = await request(app)
      .post("/api/users/resend-otp")
      .send({ email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Valid email is required" });
  });
});
