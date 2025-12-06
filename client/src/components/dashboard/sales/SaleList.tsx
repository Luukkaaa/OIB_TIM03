import React, { useEffect, useMemo, useState } from "react";
import { ISaleAPI } from "../../../api/sales/ISaleAPI";
import { SaleDTO } from "../../../models/sales/SaleDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { SaleType } from "../../../models/sales/SaleType";
import { PaymentMethod } from "../../../models/sales/PaymentMethod";

type Props = {
  saleAPI: ISaleAPI;
};

const badge = (type: SaleType) => {
  switch (type) {
    case SaleType.MALOPRODAJA:
      return { label: "Maloprodaja", color: "#4caf5033" };
    case SaleType.VELEPRODAJA:
      return { label: "Veleprodaja", color: "#f7d44a33" };
    default:
      return { label: type, color: "var(--win11-subtle)" };
  }
};

const paymentLabel = (p: PaymentMethod) => {
  switch (p) {
    case PaymentMethod.GOTOVINA:
      return "Gotovina";
    case PaymentMethod.UPLATA_NA_RACUN:
      return "Uplata na račun";
    case PaymentMethod.KARTICA:
      return "Kartica";
    default:
      return p;
  }
};

export const SaleList: React.FC<Props> = ({ saleAPI }) => {
  const { token } = useAuth();
  const [sales, setSales] = useState<SaleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const hasToken = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (hasToken) loadSales();
  }, [hasToken]);

  const loadSales = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await saleAPI.getAllSales(token);
      setSales(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Neuspešno učitavanje prodaja. Proveri da je sales servis pokrenut.";
      setError(msg);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    if (!search.trim()) {
      loadSales();
      return;
    }
    if (search.trim().length < 2) {
      setError("Unesite najmanje 2 znaka za pretragu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await saleAPI.searchSales(token, search.trim());
      setSales(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Greška pri pretrazi prodaja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "16px", height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 style={{ margin: 0 }}>Fiskalni računi</h3>
          <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Pregled i pretraga računa.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Pretraga računa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={handleSearch}>
          Pretraži
        </button>
        <button className="btn btn-ghost" onClick={loadSales}>
          Osveži
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--win11-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Broj računa</th>
                <th style={{ padding: "10px 12px" }}>Tip prodaje</th>
                <th style={{ padding: "10px 12px" }}>Način plaćanja</th>
                <th style={{ padding: "10px 12px" }}>Iznos (RSD)</th>
                <th style={{ padding: "10px 12px" }}>Datum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>
                    Učitavanje...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>
                    Nema fiskalnih računa.
                  </td>
                </tr>
              ) : (
                sales.map((s) => {
                  const b = badge(s.saleType);
                  return (
                    <tr key={s.id} style={{ borderTop: "1px solid var(--win11-divider)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                        {s.receiptNumber}
                        <div style={{ color: "var(--win11-text-secondary)", fontSize: "12px" }}>ID: {s.id}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span className="badge" style={{ padding: "4px 8px", borderRadius: 8, background: b.color }}>
                          {b.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>{paymentLabel(s.paymentMethod)}</td>
                      <td style={{ padding: "10px 12px" }}>{Number(s.totalAmount || 0).toFixed(2)}</td>
                      <td style={{ padding: "10px 12px" }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ color: "var(--win11-text-secondary)", fontSize: 12 }}>
        Ukupno računa: {sales.length}
      </div>
    </div>
  );
};
