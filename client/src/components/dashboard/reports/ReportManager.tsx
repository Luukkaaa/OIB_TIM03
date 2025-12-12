import React, { useEffect, useMemo, useState } from "react";
import { IReportAPI } from "../../../api/reports/IReportAPI";
import { ReportDTO } from "../../../models/reports/ReportDTO";
import { ReportType } from "../../../models/reports/ReportType";
import { ReportStatus } from "../../../models/reports/ReportStatus";
import { useAuth } from "../../../hooks/useAuthHook";

type Props = {
  reportAPI: IReportAPI;
};

const typeOptions: { value: ReportType | ""; label: string }[] = [
  { value: "", label: "Izaberite tip" },
  { value: ReportType.SALES, label: "Prodaja" },
  { value: ReportType.PLANTS, label: "Biljke" },
  { value: ReportType.PERFUMES, label: "Parfemi" },
  { value: ReportType.USERS, label: "Korisnici" },
];

export const ReportManager: React.FC<Props> = ({ reportAPI }) => {
  const { token } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createType, setCreateType] = useState<ReportType | "">("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const filtersObject = () => {
    const obj: any = {};
    if (filterFrom) obj.from = filterFrom;
    if (filterTo) obj.to = filterTo;
    return obj;
  };

  useEffect(() => {
    if (hasToken) void loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  const loadReports = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const list = await reportAPI.listReports(token);
      setReports(list);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Nije moguće učitati listu izveštaja.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    if (!token) return;
    if (!createTitle.trim()) {
      setError("Unesite naziv izveštaja.");
      return;
    }
    if (!createType) {
      setError("Izaberite tip izveštaja.");
      return;
    }
    setBusyId(-1);
    setError("");
    try {
      await reportAPI.createReport(token, {
        title: createTitle.trim(),
        type: createType as ReportType,
        filters: filtersObject(),
      });
      setCreateTitle("");
      setCreateType("");
      await loadReports();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Kreiranje izveštaja neuspešno.";
      setError(msg);
    } finally {
      setBusyId(null);
    }
  };

  const runReport = async (id: number, storedFilters?: any) => {
    if (!token) return;
    setBusyId(id);
    setError("");
    try {
      // koristi postojeće filtere iz šablona; front ne menja
      await reportAPI.runReport(token, id, storedFilters);
      await loadReports();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Pokretanje izveštaja neuspešno.";
      setError(msg);
    } finally {
      setBusyId(null);
    }
  };

  const downloadReport = async (id: number) => {
    if (!token) return;
    setBusyId(id);
    setError("");
    try {
      const file = await reportAPI.downloadReport(token, id);
      const url = window.URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Preuzimanje neuspešno.";
      setError(msg);
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.READY:
        return <span className="tag tag-success">READY</span>;
      case ReportStatus.RUNNING:
        return <span className="tag tag-warning">RUNNING</span>;
      case ReportStatus.FAILED:
        return <span className="tag tag-error">FAILED</span>;
      default:
        return <span className="tag">PENDING</span>;
    }
  };

  return (
    <div className="card reports-card">
      <div className="reports-header">
        <div>
          <h3 className="section-title">Trajni izveštaji</h3>
          <p className="text-muted">Kreiraj šablon, pokreni generisanje (CSV) i preuzmi fajl.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => void loadReports()} disabled={loading}>
          Osveži
        </button>
      </div>

      <div className="reports-filters">
        <div className="filter-item">
          <label htmlFor="rep-title">Naziv</label>
          <input
            id="rep-title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            placeholder="Npr. Prodaja Q1"
          />
        </div>
        <div className="filter-item">
          <label htmlFor="rep-type">Tip</label>
          <select id="rep-type" value={createType} onChange={(e) => setCreateType(e.target.value as ReportType | "")}>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="rep-from">Od</label>
          <input id="rep-from" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
        </div>
        <div className="filter-item">
          <label htmlFor="rep-to">Do</label>
          <input id="rep-to" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </div>
        <div className="filter-actions">
          <button className="btn btn-standard" onClick={() => void createReport()} disabled={busyId !== null}>
            Kreiraj
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setCreateTitle("");
              setCreateType("");
              setFilterFrom("");
              setFilterTo("");
            }}
            disabled={busyId !== null}
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

      <div className="table-card">
        <div className="table-card__header">
          <h4>Izveštaji</h4>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Tip</th>
                <th>Status</th>
                <th>Zadnje pokretanje</th>
                <th>Greška</th>
                <th className="text-right">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Učitavanje...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Nema sačuvanih izveštaja.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{r.type}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>{r.lastRunAt ? new Date(r.lastRunAt).toLocaleString() : "-"}</td>
                    <td className="text-muted">{r.errorMessage ?? ""}</td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="btn btn-standard"
                          onClick={() => void runReport(r.id, r.filters)}
                          disabled={busyId !== null}
                        >
                          Run
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => void downloadReport(r.id)}
                          disabled={busyId !== null || r.status !== ReportStatus.READY}
                        >
                          Download
                        </button>
                      </div>
                    </td>
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
