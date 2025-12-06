import React, { useEffect, useRef, useState } from "react";
import { IAuthAPI } from "../api/auth/IAuthAPI";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import "./AuthPage.css";
import "./AuthPageInline.css";

type AuthPageProps = {
  authAPI: IAuthAPI;
};

export const AuthPage: React.FC<AuthPageProps> = ({ authAPI }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const trapRef = useRef<HTMLDivElement | null>(null);

  // Fokus i trap za Tab da ostane u auth prozoru
  useEffect(() => {
    const container = trapRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>("a, button, input, select, textarea")
    ).filter((el) => !el.hasAttribute("disabled"));

    // fokusiraj prvi fokusabilni element (login user polje)
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
  }, [activeTab]);

  return (
    <div className="overlay-blur-none auth-overlay" ref={trapRef}>
      <div className="window auth-window">
        <div className="titlebar">
          <div className="titlebar-icon">
            <img className="auth-titlebar-img" src="/icon.png" width="20" height="20" alt="logo" title="logo" />
          </div>
          <span className="titlebar-title">Authentication</span>
        </div>

        <div className="window-content auth-window-content">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "btn-accent active" : "btn-ghost"}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab ${activeTab === "register" ? "btn-accent active" : "btn-ghost"}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* Content */}
          <div className="auth-content">
            {activeTab === "login" ? (
              <>
                <LoginForm authAPI={authAPI} />
                <div className="auth-register-hint">
                  <span><strong>Nemate nalog?</strong></span>
                  <button className="btn auth-register-button" type="button" onClick={() => setActiveTab("register")}>
                    Registrujte se
                  </button>
                </div>
              </>
            ) : (
              <RegisterForm authAPI={authAPI} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
