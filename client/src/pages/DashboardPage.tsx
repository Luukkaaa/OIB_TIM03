import React, { useState } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { ISaleAPI } from "../api/sales/ISaleAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { PlantManagement } from "../components/dashboard/plants/PlantManagement";
import { SaleList } from "../components/dashboard/sales/SaleList";

type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  saleAPI: ISaleAPI;
};

type MainTab = "pocetna" | "proizvodnja" | "prerada" | "pakovanje" | "skladistenje" | "prodaja" | "korisnici";

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI, saleAPI }) => {
  const [activeTab, setActiveTab] = useState<MainTab>("pocetna");

  const tabs = [
    { key: "pocetna", label: "Početna" },
    { key: "proizvodnja", label: "Proizvodnja" },
    { key: "prerada", label: "Prerada" },
    { key: "pakovanje", label: "Pakovanje" },
    { key: "skladistenje", label: "Skladistenje" },
    { key: "prodaja", label: "Prodaja" },
    { key: "korisnici", label: "Korisnici" },
  ];

  const renderContent = () => {
    if (activeTab === "korisnici") {
      return (
        <div style={{ flex: 1, overflow: "auto" }}>
          <UserManagement userAPI={userAPI} />
        </div>
      );
    }

    // Početna i ostale sekcije trenutno prikazuju biljke i račune
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", flex: 1, minHeight: 0 }}>
        <PlantManagement plantAPI={plantAPI} />
        <SaleList saleAPI={saleAPI} />
      </div>
    );
  };

  return (
    <div className="overlay-blur-none" style={{ position: "fixed", inset: 0 }}>
      <div
        className="window"
        style={{ width: "1200px", maxWidth: "98%", height: "720px", maxHeight: "92%", display: "flex", flexDirection: "column" }}
      >
        <DashboardNavbar userAPI={userAPI} />

        <div className="window-content" style={{ padding: "16px 18px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "12px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`btn ${activeTab === tab.key ? "btn-accent" : "btn-ghost"}`}
                onClick={() => setActiveTab(tab.key as MainTab)}
                style={{ minWidth: 120 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};
