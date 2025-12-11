import React, { useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { UserRole } from "../../enums/UserRole";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import "./RegisterForm.css";

type RegisterFormProps = {
  authAPI: IAuthAPI;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ authAPI }) => {
  const [formData, setFormData] = useState<RegistrationUserDTO>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: UserRole.SELLER,
    profileImage: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== confirmPassword) {
      setError("Лозинке се не поклапају.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Лозинка мора имати најмање 6 карактера.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(formData);

      if (response.success) {
        setSuccess(response.message || "Регистрација је успела!");

        if (response.token) {
          login(response.token);
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      } else {
        setError(
          response.message || "Регистрација није успела. Покушајте поново."
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Догодила се грешка. Покушајте поново."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="register-label">
          Корисничко име
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Изаберите корисничко име"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="firstName" className="register-label">
          Име
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Унесите име"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="lastName" className="register-label">
          Презиме
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Унесите презиме"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="register-label">
          Имејл
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="vas.email@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="role" className="register-label">
          Улога
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          disabled={isLoading}
        >
          <option value={UserRole.SELLER}>Продавац</option>
          <option value={UserRole.ADMIN}>Админ</option>
          <option value={UserRole.SALES_MANAGER}>Менаџер продаје</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="register-label">
          Лозинка
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Креирајте лозинку (мин 6 карактера)"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="register-label">
          Потврда лозинке
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          placeholder="Поново унесите лозинку"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="profileImage" className="register-label">
          URL слике профила{" "}
          <span className="register-optional">(опционо)</span>
        </label>
        <input
          type="url"
          id="profileImage"
          name="profileImage"
          value={formData.profileImage}
          onChange={handleChange}
          placeholder="https://primer.com/avatar.jpg"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="card register-error-card">
          <div className="flex items-center gap-2">
            <svg
              className="register-error-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="var(--win11-close-hover)"
            >
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span className="register-error-text">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="card register-success-card">
          <div className="flex items-center gap-2">
            <svg
              className="register-success-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="#107c10"
            >
              <path d="M8 2a6 6 0 110 12A6 6 0 018 2zm2.354 4.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7 8.793l2.646-2.647a.5.5 0 01.708 0z" />
            </svg>
            <span className="register-success-text">{success}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-accent register-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="spinner register-spinner" />
            <span>Креирање налога...</span>
          </div>
        ) : (
          "Региструј се"
        )}
      </button>
    </form>
  );
};
