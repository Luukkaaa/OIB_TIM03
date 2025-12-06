import React, { useState } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { ISaleAPI } from "../api/sales/ISaleAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { PlantManagement } from "../components/dashboard/plants/PlantManagement";
import { SaleList } from "../components/dashboard/sales/SaleList";
import { ProductionPanel } from "../components/dashboard/production/ProductionPanel";

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
    { key: "skladistenje", label: "Skladištenje" },
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

    if (activeTab === "proizvodnja") {
      return <ProductionPanel plantAPI={plantAPI} />;
    }

    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", minHeight: 0, height: "100%" }}>
          <div style={{ minHeight: 0, overflow: "auto" }}>
            <PlantManagement plantAPI={plantAPI} />
          </div>
          <div style={{ minHeight: 0, overflow: "auto" }}>
            <SaleList saleAPI={saleAPI} />
          </div>
        </div>
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
