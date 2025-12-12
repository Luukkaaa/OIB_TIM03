import React, { useEffect, useMemo, useState } from "react";
import { IProcessingAPI } from "../../../api/processing/IProcessingAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { PerfumeSummary } from "../../../models/reports/PerfumeSummary";
import { PerfumeType } from "../../../models/processing/PerfumeType";

type Filters = { from?: string; to?: string; type?: string };

const typeOptions: { value: string; label: string }[] = [
  { value: "", label: "Svi tipovi" },
  { value: PerfumeType.PARFEM, label: "Parfem" },
  { value: PerfumeType.KOLONJSKA, label: "Kolonjska voda" },
];

export const PerfumeReports: React.FC<{ processingAPI: IProcessingAPI }> = ({ processingAPI }) => {
  const { token } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);
  const [filters, setFilters] = useState<Filters>({});
  const [summary, setSummary] = useState<PerfumeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasToken) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await processingAPI.getPerfumeSummary(token, filters);
      setSummary(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Nije moguće učitati izveštaj za preradu.";
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
      const file = await processingAPI.exportPerfumeSummary(token, { ...filters, format: "csv" });
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
          <h3 className="section-title">Izveštaj o preradi (parfemi)</h3>
          <p className="text-muted">Rezime parfema sa CSV eksportom.</p>
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
          <label htmlFor="perf-from">Od datuma</label>
          <input
            id="perf-from"
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => handleFilter("from", e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="perf-to">Do datuma</label>
          <input id="perf-to" type="date" value={filters.to ?? ""} onChange={(e) => handleFilter("to", e.target.value)} />
        </div>
        <div className="filter-item">
          <label htmlFor="perf-type">Tip parfema</label>
          <select
            id="perf-type"
            value={filters.type ?? ""}
            onChange={(e) => handleFilter("type", e.target.value)}
          >
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
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
          <span className="metric-label">Broj parfema</span>
          <span className="metric-value">{summary?.totalCount ?? 0}</span>
        </div>
        <div className="reports-card-metric">
          <span className="metric-label">Prosečan volumen (ml)</span>
          <span className="metric-value">{fmt(summary?.averageVolume)}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card__header">
          <h4>Po tipu parfema</h4>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tip</th>
                <th className="text-right">Broj</th>
                <th className="text-right">Prosek (ml)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Učitavanje...
                  </td>
                </tr>
              ) : (summary?.byType?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Nema podataka.
                  </td>
                </tr>
              ) : (
                summary?.byType?.map((row) => (
                  <tr key={row.type}>
                    <td>{row.type}</td>
                    <td className="text-right">{row.count}</td>
                    <td className="text-right">{fmt(row.averageVolume)}</td>
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
