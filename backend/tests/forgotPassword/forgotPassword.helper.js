import crypto from "crypto";

// Creates a fake Express response object with spies for status and json.
export const createMockRes = () => {
  const res = {};

  res.status = jasmine.createSpy("status").and.callFake((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = jasmine.createSpy("json").and.callFake((payload) => {
    res.body = payload;
    return res;
  });

  return res;
};

// Builds a mock user object used by controller tests.
export const createMockUser = (overrides = {}) => ({
  _id: "user-id",
  email: "user@gmail.com",
  password_hash: "old-hash",
  resetPasswordToken: "token",
  resetPasswordOTP: "otp",
  resetPasswordExpire: new Date(),
  save: jasmine.createSpy("save").and.resolveTo(true),
  ...overrides,
});

// Creates a mock OTP record with a valid future expiry date.
export const createOtpRecord = (overrides = {}) => ({
  _id: "otp-record-id",
  email: "user@gmail.com",
  otpHash: createHashedOtp("123456"),
  expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  user_id: "user-id",
  ...overrides,
});

// Hashes an OTP the same way the controller does before storing it.
export const createHashedOtp = (otp = "123456") =>
  crypto.createHash("sha256").update(otp).digest("hex");
