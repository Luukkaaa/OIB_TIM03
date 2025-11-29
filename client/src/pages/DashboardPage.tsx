import React from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";

type DashboardPageProps = {
  userAPI: IUserAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI }) => {
  return (
    <div className="overlay-blur-none" style={{ position: "fixed", inset: 0 }}>
      <div className="window" style={{ width: "900px", maxWidth: "95%", height: "640px", maxHeight: "90%", display: "flex", flexDirection: "column" }}>
        <DashboardNavbar userAPI={userAPI} />

        <div className="window-content" style={{ padding: "24px", overflow: "auto", flex: 1 }}>
          <h2 style={{ marginBottom: "12px" }}>Dashboard</h2>
          <p style={{ color: "var(--win11-text-secondary)", marginBottom: "16px" }}>
            Uspešno ste prijavljeni. Ovde možete dodati sadržaj za administraciju/prodaju.
          </p>
          <div className="card" style={{ padding: "16px" }}>
            <strong>Brzi pregled</strong>
            <ul style={{ marginTop: "8px", listStyle: "disc", paddingLeft: "18px" }}>
              <li>Pripremite widgete po potrebi.</li>
              <li>Navbar već prikazuje korisnika i omogućava odjavu.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
