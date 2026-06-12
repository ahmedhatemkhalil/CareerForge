import api from "./api";

export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/signup", userData);
  return data;
};
export const verifyEmail = async (token) => {
  const { data } = await api.get(`/auth/verify-email/${token}`);
  return data;
};
export const resendVerification = async (email) => {
  return await api.post("/auth/resend-verification", email);
};
export const loginUser = async (userData) => {
  const { data } = await api.post("/auth/login", userData);
  return data;
};

export const logoutUser = async (refreshToken) => {
  const { data } = await api.post("/auth/logout", { refreshToken });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/users/forgot-password", {
    email,
  });

  return data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const { data } = await api.post("/users/verify-reset-otp", {
    email,
    otp,
  });

  return data;
};

export const resetPasswordWithOtp = async ({ email, otp, password }) => {
  const { data } = await api.post("/users/reset-password-otp", {
    email,
    otp,
    password,
  });

  return data;
};
export const resendOtpRequest = async (email) => {
  const { data } = await api.post("/users/resend-otp", {
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

export const githubLogin = async (code) => {
  const { data } = await api.post("/auth/oauth/github", {
    code,
    redirectUri: "http://localhost:5173/oauth/github/callback",
  });

  return data;
};
export const googleLogin = async (code) => {
  const { data } = await api.post("/auth/oauth/google", {
    code,
    redirectUri: "http://localhost:3000/auth/callback",
  });

  return data;
};