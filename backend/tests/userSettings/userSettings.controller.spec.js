import * as userSettingsController from "../../Modules/UserSettings/userSettings.controller.js";
import UserSettings from "../../models/UserSettings.js";
import { mockSettings, mockUser } from "./userSettings.mock.js";

describe("UserSettings Controller Unit Tests", () => {
  let req, res;

  // beforeEach runs before every test — fresh req/res objects each time.
  beforeEach(() => {
    jasmine.getEnv().allowRespy(true);

    req = {
      user: { id: mockUser._id },
      body: {},
    };

    res = {
      status: jasmine.createSpy("status").and.callFake(function () {
        return this;
      }),
      json: jasmine.createSpy("json").and.callFake(function () {
        return this;
      }),
    };
  });

  describe("getUserSettings()", () => {
    it("should return existing settings", async () => {
      spyOn(UserSettings, "findOne").and.resolveTo(mockSettings);

      await userSettingsController.getUserSettings(req, res);

      expect(UserSettings.findOne).toHaveBeenCalledWith({ user_id: mockUser._id });
      expect(res.json).toHaveBeenCalledWith(mockSettings);
    });

    it("should create settings when none exist", async () => {
      spyOn(UserSettings, "findOne").and.resolveTo(null);
      spyOn(UserSettings, "create").and.resolveTo(mockSettings);

      await userSettingsController.getUserSettings(req, res);

      expect(UserSettings.create).toHaveBeenCalledWith({ user_id: mockUser._id });
      expect(res.json).toHaveBeenCalledWith(mockSettings);
    });
  });

  describe("updateUserSettings()", () => {
    it("should update theme successfully", async () => {
      req.body = { theme: "dark" };

      const updatedSettings = { ...mockSettings, theme: "dark" };
      spyOn(UserSettings, "findOneAndUpdate").and.resolveTo(updatedSettings);

      await userSettingsController.updateUserSettings(req, res);

      expect(UserSettings.findOneAndUpdate).toHaveBeenCalledWith(
        { user_id: mockUser._id },
        { theme: "dark" },
        { new: true, runValidators: true },
      );
      expect(res.json).toHaveBeenCalledWith(updatedSettings);
    });

    it("should return 400 for an invalid theme", async () => {
      req.body = { theme: "purple" };

      await userSettingsController.updateUserSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Theme must be dark or light",
      });
    });
  });
});
