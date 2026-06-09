import UserSettings from "../../models/UserSettings.js";

export const getOrCreateSettings = async (userId) => {
  let settings = await UserSettings.findOne({ user_id: userId });
  if (!settings) {
    settings = await UserSettings.create({ user_id: userId });
  }
  return settings;
};

// GET /api/users/me/settings
export const getUserSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings(req.user.id);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me/settings
export const updateUserSettings = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!["dark", "light"].includes(theme)) {
      return res.status(400).json({ message: "Theme must be dark or light" });
    }

    const settings = await UserSettings.findOneAndUpdate(
      { user_id: req.user.id },
      { theme },
      { new: true, runValidators: true }
    );

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
