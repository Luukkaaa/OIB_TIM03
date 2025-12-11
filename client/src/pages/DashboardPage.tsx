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
  <div className="card dash-card">
    <h3 className="dash-card__title">{title}</h3>
    <p className="dash-card__text">Функционалност је у припреми.</p>
  </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userAPI,
  plantAPI,
  saleAPI,
  processingAPI,
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
        return (
          <ProcessingPanel processingAPI={processingAPI} plantAPI={plantAPI} />
        );
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
          <div className="dash-avatar">
            {user?.username ? user.username[0].toUpperCase() : "?"}
          </div>
          <div className="dash-user__info">
            <div className="dash-user__name">{user?.username ?? "Корисник"}</div>
            <div className="dash-user__role">
              {user?.role?.toUpperCase() ?? ""}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => logout()}
        >
          Одјава
        </button>
      </header>

      <nav
        className="card dash-nav"
        role="tablist"
        aria-label="Главне секције контролне табле"
      >
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

      <main
        id={activePanelId}
        role="tabpanel"
        aria-labelledby={activeTabId}
      >
        {renderContent()}
      </main>
    </div>
  );
};
