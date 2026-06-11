import api from "../api";

export const getCurrentUser = async () => {
  const { data } = await api.get("/users/me");
  console.log(data);
  return data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put("/users/me/password", {
    currentPassword,
    newPassword,
  });

  return data;
};
