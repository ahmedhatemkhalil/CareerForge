import crypto from "crypto";
import bcrypt from "bcrypt";
import esmock from "esmock";

import {
  createMockRes,
  createMockUser,
  createOtpRecord,
  createHashedOtp,
} from "./forgotPassword.helper.js";

// Tests the forgot password controller behavior for OTP creation, verification, and password reset.
describe("Forgot Password Controller", () => {
  let req;
  let res;
  let controller;
  let sendEmailSpy;
  let userFindOneSpy;
  let forgotCreateSpy;
  let forgotFindOneSpy;
  let forgotDeleteOneSpy;
  let forgotDeleteManySpy;

  // Runs before every test and prepares spies and mocked dependencies.
  beforeEach(async () => {
    req = { body: {} };
    res = createMockRes();

    sendEmailSpy = jasmine.createSpy("sendEmail").and.resolveTo(undefined);
    userFindOneSpy = jasmine.createSpy("User.findOne");
    forgotCreateSpy = jasmine.createSpy("ForgotPassword.create");
    forgotFindOneSpy = jasmine.createSpy("ForgotPassword.findOne");
    forgotDeleteOneSpy = jasmine.createSpy("ForgotPassword.deleteOne");
    forgotDeleteManySpy = jasmine.createSpy("ForgotPassword.deleteMany");

    spyOn(Math, "random").and.returnValue((123456 - 100000) / 900000);
    spyOn(bcrypt, "genSalt").and.resolveTo("salt");
    spyOn(bcrypt, "hash").and.resolveTo("hashedPassword");

    controller = await esmock(
      "../../Modules/ForgotPassword/forgotPassword.controller.js",
      {
        "../../Email/email.js": { default: sendEmailSpy },
        "../../models/User.js": { default: { findOne: userFindOneSpy } },
        "../../models/ForgotPassword.js": {
          default: {
            create: forgotCreateSpy,
            findOne: forgotFindOneSpy,
            deleteOne: forgotDeleteOneSpy,
            deleteMany: forgotDeleteManySpy,
          },
        },
        "../../utils/validators.js": {
          isValidEmail: (email) => {
            if (!email || typeof email !== "string") return false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
            if (!emailRegex.test(email)) return false;
            const domain = email.split("@")[1].toLowerCase();
            return ["gmail.com", "yahoo.com", "test.com"].includes(domain);
          },
          isStrongPassword: (password) =>
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/.test(
              password,
            ),
        },
      },
    );
  });

  // Cleans up the controller instance after each test.
  afterEach(() => {
    controller = null;
  });

  // Ensures invalid email input is rejected before any user lookup happens.
  it("returns 400 when email is invalid", async () => {
    req.body.email = "invalid-email";

    await controller.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Valid email is required",
    });
    expect(userFindOneSpy).not.toHaveBeenCalled();
  });

  // Confirms the controller returns a not-found response for unknown email addresses.
  it("returns 404 when user does not exist", async () => {
    req.body.email = "missing@gmail.com";
    userFindOneSpy.and.resolveTo(null);

    await controller.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "There is no user with that email.",
    });
  });

  // Verifies the success path where an OTP is generated, stored, and emailed.
  it("sends OTP and returns success when user exists", async () => {
    const user = createMockUser({ email: "user@gmail.com" });
    req.body.email = user.email;
    userFindOneSpy.and.resolveTo(user);
    forgotCreateSpy.and.resolveTo({ _id: "otp-record-id" });

    await controller.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: "OTP sent to your email. Check your inbox!",
        success: true,
      }),
    );
    expect(forgotCreateSpy).toHaveBeenCalled();
    expect(sendEmailSpy).toHaveBeenCalled();
  });

  // Ensures the OTP record is removed if sending the email fails.
  it("deletes the OTP record when email sending fails", async () => {
    const user = createMockUser({ email: "user@gmail.com" });
    req.body.email = user.email;
    userFindOneSpy.and.resolveTo(user);
    forgotCreateSpy.and.resolveTo({ _id: "otp-record-id" });
    forgotDeleteOneSpy.and.resolveTo({ deletedCount: 1 });
    sendEmailSpy.and.rejectWith(new Error("mail failed"));

    await controller.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(forgotDeleteOneSpy).toHaveBeenCalledWith({ _id: "otp-record-id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Email could not be sent. Please try again.",
    });
  });

  // Confirms a valid OTP is accepted and the response contains the user ID.
  it("verifies OTP successfully", async () => {
    const otp = "123456";
    const hashedOtp = createHashedOtp(otp);
    req.body = { email: "user@gmail.com", otp };

    forgotFindOneSpy.and.resolveTo(createOtpRecord({ otpHash: hashedOtp }));

    await controller.verifyResetOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: "OTP verified successfully",
        success: true,
        userId: "user-id",
      }),
    );
  });

  // Checks that expired OTPs are rejected and deleted.
  it("returns 400 when OTP has expired", async () => {
    const otp = "123456";
    const hashedOtp = createHashedOtp(otp);
    req.body = { email: "user@gmail.com", otp };

    forgotFindOneSpy.and.resolveTo(
      createOtpRecord({
        otpHash: hashedOtp,
        expiresAt: new Date("2024-05-31T23:00:00.000Z"),
      }),
    );
    forgotDeleteOneSpy.and.resolveTo({ deletedCount: 1 });

    await controller.verifyResetOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(forgotDeleteOneSpy).toHaveBeenCalledWith({ _id: "otp-record-id" });
    expect(res.json).toHaveBeenCalledWith({ message: "OTP has expired" });
  });

  // Verifies password reset updates the password and clears reset-related fields.
  it("resets password and clears reset fields", async () => {
    const otp = "123456";
    const hashedOtp = createHashedOtp(otp);
    req.body = { email: "user@gmail.com", otp, password: "StrongPass@123" };

    const user = createMockUser();
    forgotFindOneSpy.and.resolveTo(createOtpRecord({ otpHash: hashedOtp }));
    userFindOneSpy.and.resolveTo(user);
    forgotDeleteOneSpy.and.resolveTo({ deletedCount: 1 });

    await controller.resetPasswordWithOtp(req, res);

    expect(user.password_hash).toBe("hashedPassword");
    expect(user.resetPasswordToken).toBeUndefined();
    expect(user.resetPasswordOTP).toBeUndefined();
    expect(user.resetPasswordExpire).toBeUndefined();
    expect(user.save).toHaveBeenCalled();
    expect(forgotDeleteOneSpy).toHaveBeenCalledWith({ _id: "otp-record-id" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: "Password updated successfully! You can login now.",
        success: true,
      }),
    );
  });
});
