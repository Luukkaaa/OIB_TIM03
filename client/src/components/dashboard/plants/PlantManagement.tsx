import React, { useEffect, useMemo, useState } from "react";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { PlantState } from "../../../models/plants/PlantState";
import "./PlantManagement.css";

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
      void loadPlants();
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
        return { label: "Посађена", className: "plant-badge-planted" };
      case PlantState.HARVESTED:
        return { label: "Убрана", className: "plant-badge-harvested" };
      case PlantState.PROCESSED:
        return { label: "Прерађена", className: "plant-badge-processed" };
      default:
        return { label: state, className: "plant-badge-default" };
    }
  };

  return (
    <div className="card plantmgmt-root">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="plantmgmt-title">Биљке</h3>
          <p className="plantmgmt-subtitle">Преглед и претрага биљака.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 plantmgmt-search-row">
        <label htmlFor="plantSearch" className="plantmgmt-search-label">
          Претрага
        </label>
        <input
          id="plantSearch"
          type="text"
          placeholder="Претрага биљака..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="plantmgmt-search-input"
        />
        <button className="btn btn-ghost" onClick={handleSearch}>
          Претражи
        </button>
        <button className="btn btn-ghost" onClick={loadPlants}>
          Освежи
        </button>
      </div>

      {error && (
        <div className="card plantmgmt-error-card">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="var(--win11-close-hover)"
            >
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span className="plantmgmt-error-text">{error}</span>
          </div>
        </div>
      )}

      <div className="card plantmgmt-table-card">
        <div className="plantmgmt-table-scroll">
          <table className="plantmgmt-table">
            <thead>
              <tr className="plantmgmt-table-header-row">
                <th className="plantmgmt-table-header-cell">Назив</th>
                <th className="plantmgmt-table-header-cell">Латински</th>
                <th className="plantmgmt-table-header-cell">Земља</th>
                <th className="plantmgmt-table-header-cell">Јачина</th>
                <th className="plantmgmt-table-header-cell">Стање</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="plantmgmt-table-cell center" colSpan={5}>
                    Учитавање...
                  </td>
                </tr>
              ) : plants.length === 0 ? (
                <tr>
                  <td className="plantmgmt-table-cell center" colSpan={5}>
                    Нема биљака за приказ.
                  </td>
                </tr>
              ) : (
                plants.map((plant) => {
                  const badge = badgeForState(plant.state);
                  const strengthValid =
                    plant.oilStrength !== undefined &&
                    !Number.isNaN(Number(plant.oilStrength));
                  return (
                    <tr key={plant.id} className="plantmgmt-table-row">
                      <td className="plantmgmt-table-cell">
                        <div className="plantmgmt-plant-name">
                          {plant.commonName}
                        </div>
                        <div className="plantmgmt-plant-id">
                          ID: {plant.id}
                        </div>
                      </td>
                      <td className="plantmgmt-table-cell">
                        {plant.latinName}
                      </td>
                      <td className="plantmgmt-table-cell">
                        {plant.originCountry}
                      </td>
                      <td className="plantmgmt-table-cell">
                        {strengthValid
                          ? Number(plant.oilStrength).toFixed(1)
                          : "-"}
                      </td>
                      <td className="plantmgmt-table-cell">
                        <span
                          className={`badge plantmgmt-badge ${badge.className}`}
                        >
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

      <div className="plantmgmt-footer">
        Укупно биљака: {plants.length}
      </div>
    </div>
  );
};
