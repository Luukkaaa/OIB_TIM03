import React, { useEffect, useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

type LoginFormProps = {
  authAPI: IAuthAPI;
};

export const LoginForm: React.FC<LoginFormProps> = ({ authAPI }) => {
  const [formData, setFormData] = useState<LoginUserDTO>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.success && response.token) {
        login(response.token);
        navigate("/dashboard");
      } else {
        setError(response.message || "Пријава није успела. Покушајте поново.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Догодила се грешка. Покушајте поново.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="login-label">
          Корисничко име
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Унесите корисничко име"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="login-label">
          Лозинка
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Унесите лозинку"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="card login-error-card">
          <div className="flex items-center gap-2">
            <svg
              className="login-error-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="var(--win11-close-hover)"
            >
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span className="login-error-text">{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-accent login-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="spinner login-spinner" />
            <span>Пријављивање...</span>
          </div>
        ) : (
          "Пријави се"
        )}
      </button>
    </form>
  );
};
