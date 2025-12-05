import React, { useState } from "react";
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

  return (
    <div className="overlay-blur-none auth-overlay">
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
