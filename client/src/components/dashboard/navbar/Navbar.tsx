import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";
import "./DashboardNavbar.css";

type DashboardNavbarProps = {
  userAPI: IUserAPI;
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userAPI }) => {
  const { user: authUser, logout, token } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hasAuth = !!authUser?.id && !!token;
    if (!hasAuth) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userData = await userAPI.getUserById(token ?? "", authUser.id);
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    const onUserUpdated = () => fetchUser();
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, [authUser?.id, token, userAPI]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "";

  return (
    <nav className="titlebar navbar-top">
      <div className="navbar-right">
        {isLoading ? (
          <div className="spinner navbar-spinner" aria-label="Учитавање"></div>
        ) : user ? (
          <>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="navbar-avatar-img"
              />
            ) : (
              <div className="navbar-avatar-fallback" aria-label={user.username}>
                {initials}
              </div>
            )}

            <div className="navbar-user-info">
              <span className="navbar-email">{user.email}</span>
              <span className="navbar-role">{user.role}</span>
            </div>

            <button className="btn btn-ghost navbar-logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2v2H3v8h3v2H2V2h4zm4 3l4 3-4 3V9H6V7h4V5z" />
              </svg>
              Одјава
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};
