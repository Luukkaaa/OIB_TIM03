import React, { useEffect, useMemo, useState } from "react";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserSummary } from "../../../models/reports/UserSummary";

export const UserReports: React.FC<{ userAPI: IUserAPI }> = ({ userAPI }) => {
  const { token } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
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
      const data = await userAPI.getUserSummary(token);
      setSummary(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Nije moguće učitati izveštaj korisnika.";
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
      const file = await userAPI.exportUserSummary(token);
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

  return (
    <div className="card reports-card">
      <div className="reports-header">
        <div>
          <h3 className="section-title">Izveštaj o korisnicima</h3>
          <p className="text-muted">Ukupan broj i raspodela po ulozi.</p>
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

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="reports-grid">
        <div className="reports-card-metric">
          <span className="metric-label">Broj korisnika</span>
          <span className="metric-value">{summary?.totalCount ?? 0}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card__header">
          <h4>Po ulozi</h4>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Uloga</th>
                <th className="text-right">Broj</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center">
                    Učitavanje...
                  </td>
                </tr>
              ) : (summary?.byRole?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center">
                    Nema podataka.
                  </td>
                </tr>
              ) : (
                summary?.byRole?.map((row) => (
                  <tr key={row.role}>
                    <td>{row.role}</td>
                    <td className="text-right">{row.count}</td>
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
