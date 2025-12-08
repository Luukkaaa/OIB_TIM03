import React, { useEffect, useMemo, useState } from "react";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { PlantState } from "../../../models/plants/PlantState";

type Props = {
  plantAPI: IPlantAPI;
};

export const PlantManagement: React.FC<Props> = ({ plantAPI }) => {
  const { token } = useAuth();
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const hasToken = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (hasToken) void loadPlants();
  }, [hasToken]);

  const loadPlants = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await plantAPI.getAllPlants(token);
      setPlants(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Neuspešno učitavanje biljaka.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    if (!search.trim()) {
      loadPlants();
      return;
    }
    if (search.trim().length < 2) {
      setError("Unesite najmanje 2 znaka za pretragu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await plantAPI.searchPlants(token, search.trim());
      setPlants(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Greška pri pretrazi biljaka.");
    } finally {
      setLoading(false);
    }
  };

  const badgeForState = (state: PlantState) => {
    switch (state) {
      case PlantState.PLANTED:
        return { label: "Посађена", color: "#90caf933" };
      case PlantState.HARVESTED:
        return { label: "Убрана", color: "#f7d44a33" };
      case PlantState.PROCESSED:
        return { label: "Прерађена", color: "#4caf5033" };
      default:
        return { label: state, color: "var(--win11-subtle)" };
    }
  };

  return (
    <div className="card" style={{ padding: "16px", height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 style={{ margin: 0 }}>Биљке</h3>
          <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Преглед и претрага биљака.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Претрага биљака..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={handleSearch}>Претражи</button>
        <button className="btn btn-ghost" onClick={loadPlants}>Освежи</button>
      </div>

      {error && (
        <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span style={{ fontSize: "13px" }}>{error}</span>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--win11-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Назив</th>
                <th style={{ padding: "10px 12px" }}>Латински</th>
                <th style={{ padding: "10px 12px" }}>Земља</th>
                <th style={{ padding: "10px 12px" }}>Јачина</th>
                <th style={{ padding: "10px 12px" }}>Стање</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>Учитавање...</td>
                </tr>
              ) : plants.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>Нема биљака за приказ.</td>
                </tr>
              ) : (
                plants.map((plant) => {
                  const badge = badgeForState(plant.state);
                  return (
                    <tr key={plant.id} style={{ borderTop: "1px solid var(--win11-divider)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600 }}>{plant.commonName}</div>
                        <div style={{ color: "var(--win11-text-secondary)", fontSize: "12px" }}>ID: {plant.id}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>{plant.latinName}</td>
                      <td style={{ padding: "10px 12px" }}>{plant.originCountry}</td>
                      <td style={{ padding: "10px 12px" }}>{Number(plant.oilStrength).toFixed(1)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span className="badge" style={{ padding: "4px 8px", borderRadius: "8px", background: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ color: "var(--win11-text-secondary)", fontSize: 12 }}>
        Укупно биљака: {plants.length}
      </div>
    </div>
  );
};
