import api from "../api";

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put("/users/me/password", {
    currentPassword,
    newPassword,
  });
  console.log(data);

  return data;
};
