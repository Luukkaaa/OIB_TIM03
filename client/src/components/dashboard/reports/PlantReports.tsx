import React, { useEffect, useMemo, useState } from "react";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { PlantSummary } from "../../../models/reports/PlantSummary";
import { PlantState } from "../../../models/plants/PlantState";

type Filters = { from?: string; to?: string; state?: string };

const stateOptions: { value: string; label: string }[] = [
  { value: "", label: "Sva stanja" },
  { value: PlantState.PLANTED, label: "Planted" },
  { value: PlantState.HARVESTED, label: "Harvested" },
  { value: PlantState.PROCESSED, label: "Processed" },
];

export const PlantReports: React.FC<{ plantAPI: IPlantAPI }> = ({ plantAPI }) => {
  const { token } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);
  const [filters, setFilters] = useState<Filters>({});
  const [summary, setSummary] = useState<PlantSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasToken) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await plantAPI.getPlantSummary(token, filters);
      setSummary(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Nije moguće učitati izveštaj za biljke.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    if (!token) return;
    setExporting(true);
    setError("");
    try {
      const file = await plantAPI.exportPlantSummary(token, { ...filters, format: "csv" });
      const url = window.URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Export nije uspeo.";
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const fmt = (val?: number) => Number(val ?? 0).toFixed(2);

  return (
    <div className="card reports-card">
      <div className="reports-header">
        <div>
          <h3 className="section-title">Izveštaj o biljkama</h3>
          <p className="text-muted">Rezime stanja biljaka sa CSV eksportom.</p>
        </div>
        <div className="reports-actions">
          <button className="btn btn-ghost" onClick={() => void load()} disabled={loading}>
            Osveži
          </button>
          <button className="btn btn-accent" onClick={() => void exportCsv()} disabled={loading || exporting}>
            {exporting ? "Ekspor..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-item">
          <label htmlFor="plant-from">Od datuma</label>
          <input
            id="plant-from"
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => handleFilter("from", e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="plant-to">Do datuma</label>
          <input id="plant-to" type="date" value={filters.to ?? ""} onChange={(e) => handleFilter("to", e.target.value)} />
        </div>
        <div className="filter-item">
          <label htmlFor="plant-state">Stanje</label>
          <select
            id="plant-state"
            value={filters.state ?? ""}
            onChange={(e) => handleFilter("state", e.target.value)}
          >
            {stateOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn btn-standard" onClick={() => void load()} disabled={loading}>
            Primeni filtere
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFilters({});
              void load();
            }}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="reports-grid">
        <div className="reports-card-metric">
          <span className="metric-label">Broj vrsta</span>
          <span className="metric-value">{summary?.totalSpecies ?? 0}</span>
        </div>
        <div className="reports-card-metric">
          <span className="metric-label">Ukupna količina</span>
          <span className="metric-value">{summary?.totalQuantity ?? 0}</span>
        </div>
        <div className="reports-card-metric">
          <span className="metric-label">Prosečna jačina ulja</span>
          <span className="metric-value">{fmt(summary?.averageOilStrength)}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card__header">
          <h4>Po stanju</h4>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stanje</th>
                <th className="text-right">Broj</th>
                <th className="text-right">Količina</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Učitavanje...
                  </td>
                </tr>
              ) : (summary?.byState?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Nema podataka.
                  </td>
                </tr>
              ) : (
                summary?.byState?.map((row) => (
                  <tr key={row.state}>
                    <td>{row.state}</td>
                    <td className="text-right">{row.count}</td>
                    <td className="text-right">{row.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
