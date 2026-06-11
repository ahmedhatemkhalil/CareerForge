import api from "../api";

export const getCurrentUser = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

export const updateCurrentUser = async ({ name, avatar_url }) => {
  const { data } = await api.put("/users/me", { name, avatar_url });
  return data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put("/users/me/password", {
    currentPassword,
    newPassword,
  });

  return data;
};

export const getUserSettings = async () => {
  const { data } = await api.get("/users/me/settings");
  return data;
};

export const updateUserSettings = async (theme) => {
  const { data } = await api.put("/users/me/settings", { theme });
  return data;
};
