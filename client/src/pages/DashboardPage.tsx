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
import { SalesReports } from "../components/dashboard/reports/SalesReports";
import { PlantReports } from "../components/dashboard/reports/PlantReports";
import { PerfumeReports } from "../components/dashboard/reports/PerfumeReports";
import { UserReports } from "../components/dashboard/reports/UserReports";
import { ReportManager } from "../components/dashboard/reports/ReportManager";
import { IReportAPI } from "../api/reports/IReportAPI";

type MainTab =
  | "pocetna"
  | "proizvodnja"
  | "prerada"
  | "skladistenje"
  | "prodaja"
  | "korisnici"
  | "analizaprodaje"
  | "analizaperformansi"
  | "izvestaji";

type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  saleAPI: ISaleAPI;
  processingAPI: IProcessingAPI;
  reportAPI: IReportAPI;
};

const tabs: { id: MainTab; label: string }[] = [
  { id: "pocetna", label: "Početna" },
  { id: "proizvodnja", label: "Proizvodnja" },
  { id: "prerada", label: "Prerada" },
  { id: "skladistenje", label: "Skladištenje" },
  { id: "prodaja", label: "Prodaja" },
  { id: "korisnici", label: "Korisnici" },
  { id: "analizaprodaje", label: "Analiza prodaje" },
  { id: "analizaperformansi", label: "Analiza performansi" },
  { id: "izvestaji", label: "Izveštaji" },
];

const PendingCard: React.FC<{ title: string }> = ({ title }) => (
  <div className="card dash-card">
    <h3 className="dash-card__title">{title}</h3>
    <p className="dash-card__text">Ova sekcija još nije implementirana.</p>
  </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userAPI,
  plantAPI,
  saleAPI,
  processingAPI,
  reportAPI,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("pocetna");

  const activePanelId = `dash-panel-${activeTab}`;
  const activeTabId = `dash-tab-${activeTab}`;

  const renderContent = () => {
    switch (activeTab) {
      case "korisnici":
        return <UserManagement userAPI={userAPI} />;
      case "proizvodnja":
        return <ProductionPanel plantAPI={plantAPI} />;
      case "prerada":
        return <ProcessingPanel processingAPI={processingAPI} plantAPI={plantAPI} />;
      case "skladistenje":
        return <PendingCard title="Skladištenje" />;
      case "prodaja":
        return <PendingCard title="Prodaja" />;
      case "analizaprodaje":
        return <PendingCard title="Analiza prodaje" />;
      case "analizaperformansi":
        return <PendingCard title="Analiza performansi" />;
      case "izvestaji":
        return (
          <div className="dash-grid">
            <SalesReports saleAPI={saleAPI} />
            <PlantReports plantAPI={plantAPI} />
            <PerfumeReports processingAPI={processingAPI} />
            <UserReports userAPI={userAPI} />
            {/* Menadžer trajnih izveštaja */}
            <div className="dash-grid-full">
              <ReportManager reportAPI={reportAPI} />
            </div>
          </div>
        );
      case "pocetna":
      default:
        return (
          <div className="dash-grid">
            <PlantManagement plantAPI={plantAPI} />
            <SaleList saleAPI={saleAPI} />
          </div>
        );
    }
  };

  return (
    <div className="page-wrapper dash-page">
      <header className="card dash-header">
        <div className="dash-user">
          <div className="dash-avatar">{user?.username ? user.username[0].toUpperCase() : "?"}</div>
          <div className="dash-user__info">
            <div className="dash-user__name">{user?.username ?? "Nepoznat korisnik"}</div>
            <div className="dash-user__role">{user?.role?.toUpperCase() ?? ""}</div>
          </div>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => logout()}>
          Odjava
        </button>
      </header>

      <nav className="card dash-nav" role="tablist" aria-label="Navigacija kontrolnih tabova">
        {tabs.map((t) => {
          const id = `dash-tab-${t.id}`;
          const panelId = `dash-panel-${t.id}`;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              id={id}
              role="tab"
              aria-current={isActive ? "page" : undefined}
              tabIndex={isActive ? 0 : -1}
              aria-controls={panelId}
              className={`btn ${isActive ? "btn-accent" : "btn-ghost"}`}
              type="button"
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <main id={activePanelId} role="tabpanel" aria-labelledby={activeTabId}>
        {renderContent()}
      </main>
    </div>
  );
};
