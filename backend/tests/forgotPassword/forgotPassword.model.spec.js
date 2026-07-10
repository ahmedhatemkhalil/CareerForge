import ForgotPassword from "../../models/ForgotPassword.js";

// Tests the ForgotPassword Mongoose model behavior and field validation.
describe("Forgot Password Model", () => {
  // Confirms the model sets an expiry date automatically when none is provided.
  it("applies a default expiry value when omitted", () => {
    const record = new ForgotPassword({
      user_id: "507f1f77bcf86cd799439011",
      email: "  User@Example.COM  ",
      otpHash: "hash",
      otp: "123456",
    });

    expect(record.expiresAt).toBeDefined();
    expect(record.email).toBe("user@example.com");
  });

  // Verifies that required fields are enforced by the model schema.
  it("requires the main forgot-password fields", () => {
    const record = new ForgotPassword({});
    const error = record.validateSync();

    expect(error).toBeTruthy();
    expect(record.expiresAt).toBeDefined();
    expect(error.errors.user_id).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.otpHash).toBeDefined();
    expect(error.errors.otp).toBeDefined();
  });

  // Ensures email values are normalized to lowercase and trimmed before save.
  it("stores a trimmed and lowercase email", () => {
    const record = new ForgotPassword({
      user_id: "507f1f77bcf86cd799439011",
      email: "  MixedCase@TEST.COM  ",
      otpHash: "hash",
      otp: "123456",
    });

    expect(record.email).toBe("mixedcase@test.com");
  });
});
