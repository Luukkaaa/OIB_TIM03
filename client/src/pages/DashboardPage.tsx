import React from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";

type DashboardPageProps = {
  userAPI: IUserAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI }) => {
  return (
    <div className="overlay-blur-none" style={{ position: "fixed", inset: 0 }}>
      <div className="window" style={{ width: "900px", maxWidth: "95%", height: "640px", maxHeight: "90%", display: "flex", flexDirection: "column" }}>
        <DashboardNavbar userAPI={userAPI} />

        <div className="window-content" style={{ padding: "24px", overflow: "auto", flex: 1 }}>
          <UserManagement userAPI={userAPI} />
        </div>
      </div>
    </div>
  );
};
