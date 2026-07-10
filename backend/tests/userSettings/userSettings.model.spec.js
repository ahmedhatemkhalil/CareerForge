import mongoose from "mongoose";

import UserSettings from "../../models/UserSettings.js";

describe("UserSettings Model", () => {
  // Step 1: test the default value from the schema
  it("should default theme to light", () => {
    const settings = new UserSettings({
      user_id: new mongoose.Types.ObjectId(),
    });

    expect(settings.theme).toBe("light");
  });

  // Step 2: test that only allowed theme values pass validation
  it("should accept dark theme", () => {
    const settings = new UserSettings({
      user_id: new mongoose.Types.ObjectId(),
      theme: "dark",
    });

    const error = settings.validateSync();

    expect(error).toBeUndefined();
  });

  it("should reject an invalid theme", () => {
    const settings = new UserSettings({
      user_id: new mongoose.Types.ObjectId(),
      theme: "purple",
    });

    const error = settings.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.theme).toBeDefined();
  });

  // Step 3: test required fields
  it("should require user_id", () => {
    const settings = new UserSettings({});

    const error = settings.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.user_id).toBeDefined();
  });
});
