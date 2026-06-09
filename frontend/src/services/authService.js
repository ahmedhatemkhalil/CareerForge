import api from "./api";

export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};
export const verifyEmail = async (data) => {
  return await api.post("/auth/verify-email", data);
};
export const loginUser = async (userData) => {
  const { data } = await api.post("/auth/login", userData);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", {
    email,
  });

  return data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const { data } = await api.post("/auth/verify-reset-otp", {
    email,
    otp,
  });

  return data;
};

export const resetPasswordWithOtp = async ({ email, otp, password }) => {
  const { data } = await api.post("/auth/reset-password-otp", {
    email,
    otp,
    password,
  });

  return data;
};
export const resendOtpRequest = async (email) => {
  const { data } = await api.post("/auth/resend-otp", {
    email,
  });

  return data;
};
// export const resetPassword = async (token, password) => {
//   const { data } = await api.put(`/auth/reset-password/${token}`, { password });
//   return data;
// };

// export const validateResetToken = async (token) => {
//   const { data } = await api.get(`/auth/reset-password/${token}`);
//   return data;
// };

// export const verifyEmail = async (token) => {
//   const { data } = await api.get(`/auth/verify/${token}`);
//   return data;
// };

export const updateTheme = async (theme) => {
  const { data } = await api.put(`/auth/update-theme`, { theme });
  return data;
};

// export const getCustomColors = async () => {
//   const { data } = await api.get(`/auth/colors`);
//   return data;
// };

// export const updateCustomColors = async (customColors) => {
//   const { data } = await api.put(`/auth/colors`, { customColors });
//   return data;
// };
