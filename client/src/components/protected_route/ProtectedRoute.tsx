import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** 
   * Može бити jedna uloga: "ADMIN"
   * ili više uloga: ["ADMIN", "SALES_MANAGER"]
   */
  requiredRole?: string | string[];
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = "/",
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Normalizacija uloga
  const userRole = (user?.role ?? "").toLowerCase();
  const requiredRoles: string[] = React.useMemo(() => {
    if (!requiredRole) return [];
    if (Array.isArray(requiredRole)) return requiredRole;
    // podržava i slučaj "ADMIN,SALES_MANAGER"
    return requiredRole.split(",").map((r) => r.trim());
  }, [requiredRole]);

  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((r) => r.toLowerCase() === userRole);

  if (isLoading) {
    return (
      <div className="overlay">
        <div
          className="window modal-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-check-title"
        >
          <div className="titlebar">
            <div className="titlebar-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span className="titlebar-title" id="access-check-title">
              Провера приступа
            </span>
          </div>
          <div className="window-content">
            <div className="flex flex-col items-center justify-center gap-4 modal-body-centered">
              <div className="spinner" aria-hidden="true"></div>
              <p>Молимо сачекајте...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    return (
      <div className="overlay">
        <div
          className="window modal-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-denied-title"
          aria-describedby="access-denied-desc"
        >
          <div className="titlebar">
            <div className="titlebar-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
              </svg>
            </div>
            <span className="titlebar-title" id="access-denied-title">
              Приступ одбијен
            </span>
            <div className="titlebar-controls">
              <button
                className="titlebar-btn close"
                onClick={handleLogout}
                aria-label="Одјава"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path
                    d="M0 0L10 10M10 0L0 10"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="window-content">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="icon-accent" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 3c9.389 0 17 7.611 17 17s-7.611 17-17 17S7 33.389 7 24 14.611 7 24 7zm-1.5 7a1.5 1.5 0 00-1.5 1.5v11a1.5 1.5 0 003 0v-11a1.5 1.5 0 00-1.5-1.5zM24 32a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <h2>Приступ одбијен</h2>
              <p id="access-denied-desc">
                Ова страница захтева улогу{" "}
                <strong>
                  "
                  {Array.isArray(requiredRole)
                    ? requiredRole.join(", ")
                    : requiredRole}
                  "
                </strong>
                . Пријавите се са одговарајућим налогом.
              </p>
              <button className="btn btn-accent" onClick={handleLogout}>
                Одјава
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
