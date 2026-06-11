import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { githubLogin } from "../../services/authService";
import { loadUserTheme } from "../../utils/theme";

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

        localStorage.setItem(
          "user",
          JSON.stringify(result.data.user)
        );

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