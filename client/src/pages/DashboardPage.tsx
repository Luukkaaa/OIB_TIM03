import React, { useState } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { PlantManagement } from "../components/dashboard/plants/PlantManagement";

type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI }) => {
  const [activeTab, setActiveTab] = useState<"users" | "plants">("users");

  return (
    <div className="overlay-blur-none" style={{ position: "fixed", inset: 0 }}>
      <div className="window" style={{ width: "1100px", maxWidth: "98%", height: "700px", maxHeight: "92%", display: "flex", flexDirection: "column" }}>
        <DashboardNavbar userAPI={userAPI} />

        <div className="window-content" style={{ padding: "24px", overflow: "auto", flex: 1 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "16px" }}>
            <button
              className={`btn ${activeTab === "users" ? "btn-accent" : "btn-ghost"}`}
              onClick={() => setActiveTab("users")}
              style={{ minWidth: 120 }}
            >
              Korisnici
            </button>
            <button
              className={`btn ${activeTab === "plants" ? "btn-accent" : "btn-ghost"}`}
              onClick={() => setActiveTab("plants")}
              style={{ minWidth: 120 }}
            >
              Biljke
            </button>
          </div>

          {activeTab === "users" ? <UserManagement userAPI={userAPI} /> : <PlantManagement plantAPI={plantAPI} />}
        </div>
      </div>
    </div>
  );
};
