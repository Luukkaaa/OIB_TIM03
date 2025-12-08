import React, { useState } from "react";
import { useAuth } from "../hooks/useAuthHook";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { ISaleAPI } from "../api/sales/ISaleAPI";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { PlantManagement } from "../components/dashboard/plants/PlantManagement";
import { SaleList } from "../components/dashboard/sales/SaleList";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { ProductionPanel } from "../components/dashboard/production/ProductionPanel";
import { ProcessingPanel } from "../components/dashboard/processing/ProcessingPanel";

type MainTab =
  | "pocetna"
  | "proizvodnja"
  | "prerada"
  | "skladistenje"
  | "prodaja"
  | "korisnici"
  | "analizaprodaje"
  | "analizaperformansi";

type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  saleAPI: ISaleAPI;
  processingAPI: IProcessingAPI;
};

const tabs: { id: MainTab; label: string }[] = [
  { id: "pocetna", label: "Почетна" },
  { id: "proizvodnja", label: "Производња" },
  { id: "prerada", label: "Прерада" },
  { id: "skladistenje", label: "Складиштење" },
  { id: "prodaja", label: "Продаја" },
  { id: "korisnici", label: "Корисници" },
  { id: "analizaprodaje", label: "Анализа продаје" },
  { id: "analizaperformansi", label: "Анализа перформанси" },
];

const PendingCard: React.FC<{ title: string }> = ({ title }) => (
  <div className="card" style={{ padding: 16, textAlign: "center" }}>
    <h3 style={{ margin: "0 0 8px 0" }}>{title}</h3>
    <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Овај сервис треба да се уради.</p>
  </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI, saleAPI, processingAPI }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("pocetna");

  const renderContent = () => {
    switch (activeTab) {
      case "korisnici":
        return <UserManagement userAPI={userAPI} />;
      case "proizvodnja":
        return <ProductionPanel plantAPI={plantAPI} />;
      case "prerada":
        return <ProcessingPanel processingAPI={processingAPI} plantAPI={plantAPI} />;
      case "skladistenje":
        return <PendingCard title="Складиштење" />;
      case "prodaja":
        return <PendingCard title="Продаја" />;
      case "analizaprodaje":
        return <PendingCard title="Анализа продаје" />;
      case "analizaperformansi":
        return <PendingCard title="Анализа перформанси" />;
      case "pocetna":
      default:
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
            <PlantManagement plantAPI={plantAPI} />
            <SaleList saleAPI={saleAPI} />
          </div>
        );
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <header
        className="card"
        style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--win11-accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {user?.username ? user.username[0].toUpperCase() : "?"}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700 }}>{user?.username ?? "Корисник"}</div>
            <div style={{ color: "var(--win11-text-secondary)", fontSize: 12 }}>{user?.role?.toUpperCase() ?? ""}</div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => logout()}>
          Одјава
        </button>
      </header>

      <nav className="card" style={{ padding: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`btn ${activeTab === t.id ? "btn-accent" : "btn-ghost"}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>{renderContent()}</main>
    </div>
  );
};
