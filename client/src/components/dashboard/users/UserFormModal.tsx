import React, { useEffect, useRef, useState } from "react";
import { UserRole } from "../../../enums/UserRole";
import { CreateUserDTO } from "../../../models/users/CreateUserDTO";
import { UpdateUserDTO } from "../../../models/users/UpdateUserDTO";
import { UserDTO } from "../../../models/users/UserDTO";
import "./UserFormModal.css";

type Mode = "create" | "edit";

type Props = {
  isOpen: boolean;
  mode: Mode;
  initial?: UserDTO | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserDTO | UpdateUserDTO) => Promise<void>;
};

type FormState = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  profileImage: string;
};

const defaultState: FormState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: UserRole.SELLER,
  profileImage: "",
};

export const UserFormModal: React.FC<Props> = ({ isOpen, mode, initial, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(defaultState);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && initial) {
      setForm({
        username: initial.username ?? "",
        firstName: initial.firstName ?? "",
        lastName: initial.lastName ?? "",
        email: initial.email ?? "",
        role: (initial.role as UserRole) ?? UserRole.SELLER,
        profileImage: initial.profileImage ?? "",
        password: "",
        confirmPassword: "",
      });
    } else if (isOpen) {
      setForm(defaultState);
    }
  }, [isOpen, initial]);

  // trap таб навигације у модалу
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const container = modalRef.current;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>("input, select, textarea, button")).filter(
      (el) => !el.hasAttribute("disabled")
    );
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!focusable.length) return;
      const active = document.activeElement as HTMLElement;
      const idx = focusable.indexOf(active);
      const lastIdx = focusable.length - 1;
      if (e.shiftKey) {
        const prev = idx <= 0 ? focusable[lastIdx] : focusable[idx - 1];
        prev.focus();
        e.preventDefault();
      } else {
        const next = idx === lastIdx ? focusable[0] : focusable[idx + 1];
        next.focus();
        e.preventDefault();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = (): string | null => {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!form.username || form.username.trim().length < 3) return "Корисничко име мора имати најмање 3 знака.";
    if (!form.firstName || form.firstName.trim().length < 2) return "Име мора имати најмање 2 знака.";
    if (!form.lastName || form.lastName.trim().length < 2) return "Презиме мора имати најмање 2 знака.";
    if (!form.email || !emailRegex.test(form.email)) return "Имејл није исправан.";
    if (mode === "create") {
      if (!form.password || form.password.length < 6) return "Лозинка мора имати најмање 6 карактера.";
      if (form.password !== form.confirmPassword) return "Лозинке се не поклапају.";
    }
    if (mode === "edit" && form.password) {
      if (form.password.length < 6) return "Нова лозинка мора имати најмање 6 карактера.";
      if (form.password !== form.confirmPassword) return "Лозинке се не поклапају.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setIsSubmitting(true);
    try {
      const normalizedProfile = form.profileImage?.trim() ?? "";
      if (mode === "create") {
        const payload: CreateUserDTO = {
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          profileImage: normalizedProfile || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateUserDTO = {
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: form.role,
          profileImage: normalizedProfile === "" ? null : normalizedProfile,
        };
        if (form.password) {
          payload.password = form.password;
        }
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Грешка при чувању корисника.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overlay">
      <div className="window user-modal-window" ref={modalRef} tabIndex={-1}>
        <div className="titlebar">
          <div className="titlebar-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
            </svg>
          </div>
          <span className="titlebar-title">{mode === "create" ? "Нови корисник" : "Измена корисника"}</span>
          <div className="titlebar-controls">
            <button className="titlebar-btn close" onClick={onClose} aria-label="Close">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="window-content user-modal-content">
          <form onSubmit={handleSubmit} className="user-form">
            <div>
              <label className="user-label" htmlFor="username">Корисничко име</label>
              <input id="username" name="username" className="auth-input" value={form.username} onChange={handleChange} placeholder="Унесите корисничко име" required />
            </div>

            <div>
              <label className="user-label" htmlFor="firstName">Име</label>
              <input id="firstName" name="firstName" className="auth-input" value={form.firstName} onChange={handleChange} placeholder="Унесите име" required />
            </div>

            <div>
              <label className="user-label" htmlFor="lastName">Презиме</label>
              <input id="lastName" name="lastName" className="auth-input" value={form.lastName} onChange={handleChange} placeholder="Унесите презиме" required />
            </div>

            <div>
              <label className="user-label" htmlFor="email">Имејл</label>
              <input id="email" name="email" className="auth-input" type="email" value={form.email} onChange={handleChange} placeholder="vas.email@example.com" required />
            </div>

            <div>
              <label className="user-label" htmlFor="role">Улога</label>
              <select id="role" name="role" className="auth-input" value={form.role} onChange={handleChange}>
                <option value={UserRole.ADMIN}>Админ</option>
                <option value={UserRole.SALES_MANAGER}>Менаџер продаје</option>
                <option value={UserRole.SELLER}>Продавац</option>
              </select>
            </div>

            <div>
              <label className="user-label" htmlFor="password">{mode === "create" ? "Лозинка" : "Лозинка (опционо)"}</label>
              <input
                id="password"
                name="password"
                className="auth-input"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Креирајте лозинку (мин 6 карактера)"
              />
            </div>

            <div>
              <label className="user-label" htmlFor="confirmPassword">Потврдите лозинку</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="auth-input"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Поново унесите лозинку"
              />
            </div>

            <div>
              <label className="user-label" htmlFor="profileImage">URL слике профила (опционо)</label>
              <input
                id="profileImage"
                name="profileImage"
                className="auth-input"
                value={form.profileImage}
                onChange={handleChange}
                placeholder="https://primer.com/avatar.jpg"
              />
            </div>

            {error && (
              <div className="card user-error">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
                  </svg>
                  <span className="user-error-text">{error}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 user-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Откажи
              </button>
              <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
                {isSubmitting ? "Чување..." : mode === "create" ? "Креирај" : "Сачувај измене"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
