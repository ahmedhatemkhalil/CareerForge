import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { githubLogin } from "../../services/authService";
import { loadUserTheme } from "../../utils/theme";
import { loadCurrentUser } from "../../utils/userProfile";

export default function GithubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    const login = async () => {
      try {
        const result = await githubLogin(code);

        localStorage.setItem(
          "token",
          result.data.accessToken
        );

        if (result.data.refreshToken) {
          localStorage.setItem("refreshToken", result.data.refreshToken);
        }

        await loadCurrentUser();
        await loadUserTheme();

        navigate("/dashboard");
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    login();
  }, []);

  return <h2>Logging you in...</h2>;
}