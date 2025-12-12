import React, { useEffect, useMemo, useState } from "react";
import { ISaleAPI } from "../../../api/sales/ISaleAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { SalesSummary } from "../../../models/reports/SalesSummary";
import { PaymentMethod } from "../../../models/sales/PaymentMethod";
import { SaleType } from "../../../models/sales/SaleType";
import "./SalesReports.css";

type Filters = { from?: string; to?: string; paymentMethod?: string; saleType?: string };

const paymentOptions: { value: string; label: string }[] = [
  { value: "", label: "Svi načini plaćanja" },
  { value: PaymentMethod.GOTOVINA, label: "Gotovina" },
  { value: PaymentMethod.KARTICA, label: "Kartica" },
  { value: PaymentMethod.UPLATA_NA_RACUN, label: "Uplata na račun" },
];

const saleTypeOptions: { value: string; label: string }[] = [
  { value: "", label: "Svi tipovi prodaje" },
  { value: SaleType.MALOPRODAJA, label: "Maloprodaja" },
  { value: SaleType.VELEPRODAJA, label: "Veleprodaja" },
];

export const SalesReports: React.FC<{ saleAPI: ISaleAPI }> = ({ saleAPI }) => {
  const { token } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);

  const [filters, setFilters] = useState<Filters>({});
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (hasToken) {
      void loadSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  const loadSummary = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await saleAPI.getSalesSummary(token, filters);
      setSummary(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Nije moguće učitati izveštaj. Pokušajte ponovo.";
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
      const file = await saleAPI.exportSalesSummary(token, { ...filters, format: "csv" });
      const url = window.URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Nije moguće eksportovati CSV. Pokušajte ponovo.";
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const formatCurrency = (val: number | undefined) => Number(val ?? 0).toFixed(2);

  return (
    <div className="card reports-card">
      <div className="reports-header">
        <div>
          <h3 className="section-title">Izveštaji o prodaji</h3>
          <p className="text-muted">Rezime fiskalnih računa sa mogućnošću eksportovanja u CSV.</p>
        </div>
        <div className="reports-actions">
          <button className="btn btn-ghost" onClick={() => void loadSummary()} disabled={loading}>
            Osveži
          </button>
          <button className="btn btn-accent" onClick={() => void exportCsv()} disabled={loading || exporting}>
            {exporting ? "Ekspor..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-item">
          <label htmlFor="from">Od datuma</label>
          <input
            id="from"
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => handleFilterChange("from", e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="to">Do datuma</label>
          <input
            id="to"
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => handleFilterChange("to", e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="pm">Plaćanje</label>
          <select
            id="pm"
            value={filters.paymentMethod ?? ""}
            onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
          >
            {paymentOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="stype">Tip prodaje</label>
          <select
            id="stype"
            value={filters.saleType ?? ""}
            onChange={(e) => handleFilterChange("saleType", e.target.value)}
          >
            {saleTypeOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn btn-standard" onClick={() => void loadSummary()} disabled={loading}>
            Primeni filtere
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFilters({});
              void loadSummary();
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
          <span className="metric-label">Broj računa</span>
          <span className="metric-value">{summary?.totalCount ?? 0}</span>
        </div>
        <div className="reports-card-metric">
          <span className="metric-label">Ukupan iznos (RSD)</span>
          <span className="metric-value">{formatCurrency(summary?.totalAmount)}</span>
        </div>
        <div className="reports-card-metric">
          <span className="metric-label">Prosečan račun (RSD)</span>
          <span className="metric-value">{formatCurrency(summary?.averageAmount)}</span>
        </div>
      </div>

      <div className="reports-tables">
        <div className="table-card">
          <div className="table-card__header">
            <h4>Po načinu plaćanja</h4>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Način plaćanja</th>
                  <th className="text-right">Iznos (RSD)</th>
                  <th className="text-right">Broj</th>
                  <th className="text-right">Prosek (RSD)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Učitavanje...
                    </td>
                  </tr>
                ) : (summary?.byPaymentMethod?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Nema podataka.
                    </td>
                  </tr>
                ) : (
                  summary?.byPaymentMethod?.map((row) => (
                    <tr key={row.paymentMethod}>
                      <td>{row.paymentMethod}</td>
                      <td className="text-right">{formatCurrency(row.totalAmount)}</td>
                      <td className="text-right">{row.count}</td>
                      <td className="text-right">{formatCurrency(row.averageAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card__header">
            <h4>Po tipu prodaje</h4>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tip prodaje</th>
                  <th className="text-right">Iznos (RSD)</th>
                  <th className="text-right">Broj</th>
                  <th className="text-right">Prosek (RSD)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Učitavanje...
                    </td>
                  </tr>
                ) : (summary?.bySaleType?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Nema podataka.
                    </td>
                  </tr>
                ) : (
                  summary?.bySaleType?.map((row) => (
                    <tr key={row.saleType}>
                      <td>{row.saleType}</td>
                      <td className="text-right">{formatCurrency(row.totalAmount)}</td>
                      <td className="text-right">{row.count}</td>
                      <td className="text-right">{formatCurrency(row.averageAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
