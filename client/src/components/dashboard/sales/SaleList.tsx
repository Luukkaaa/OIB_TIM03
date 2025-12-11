import React, { useEffect, useMemo, useState } from "react";
import { ISaleAPI } from "../../../api/sales/ISaleAPI";
import { SaleDTO } from "../../../models/sales/SaleDTO";
import { SaleType } from "../../../models/sales/SaleType";
import { PaymentMethod } from "../../../models/sales/PaymentMethod";
import { useAuth } from "../../../hooks/useAuthHook";
import "./SaleList.css";

type Props = {
  saleAPI: ISaleAPI;
};

export const SaleList: React.FC<Props> = ({ saleAPI }) => {
  const { token } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);

  const [sales, setSales] = useState<SaleDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (hasToken) {
      void loadSales();
    }
  }, [hasToken]);

  const loadSales = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await saleAPI.getAllSales(token);
      setSales(result);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Неуспешно учитавање рачуна. Проверите мрежу или се поново пријавите.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    const query = search.trim();
    if (!query) {
      void loadSales();
      return;
    }
    if (query.length < 2) {
      setError("Унесите бар 2 карактера за претрагу.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await saleAPI.searchSales(token, query);
      setSales(result);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Неуспешна претрага рачуна.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const saleBadge = (type: SaleType) => {
    if (type === SaleType.MALOPRODAJA) {
      return { label: "Малопродаја", className: "sale-badge malo" };
    }
    if (type === SaleType.VELEPRODAJA) {
      return { label: "Велепродаја", className: "sale-badge vele" };
    }
    return { label: type, className: "sale-badge" };
  };

  const paymentLabel = (payment: PaymentMethod) => {
    switch (payment) {
      case PaymentMethod.GOTOVINA:
        return "Готовина";
      case PaymentMethod.UPLATA_NA_RACUN:
        return "Уплата на рачун";
      case PaymentMethod.KARTICA:
        return "Картична уплата";
      default:
        return payment;
    }
  };

  return (
    <div className="card sales-card">
      <div>
        <h3 className="section-title">Фискални рачуни</h3>
        <p className="text-muted">Преглед и претрага рачуна.</p>
      </div>

      <div className="sales-toolbar">
        <label className="sr-only" htmlFor="sale-search">
          Претрага рачуна
        </label>
        <input
          id="sale-search"
          className="auth-input sales-search-input"
          placeholder="Претрага рачуна..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          className="btn btn-standard"
          onClick={handleSearch}
          disabled={loading}
        >
          Претражи
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => void loadSales()}
          disabled={loading}
        >
          Освежи
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="card table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Број рачуна</th>
                <th>Тип продаје</th>
                <th>Начин плаћања</th>
                <th className="text-right">Износ (RSD)</th>
                <th>Датум</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center">
                    Учитавање...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">
                    Нема резултата за приказ.
                  </td>
                </tr>
              ) : (
                sales.map((s) => {
                  const badge = saleBadge(s.saleType);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div>{s.receiptNumber}</div>
                        <div className="text-muted">ID: {s.id}</div>
                      </td>
                      <td>
                        <span className={badge.className}>{badge.label}</span>
                      </td>
                      <td>{paymentLabel(s.paymentMethod)}</td>
                      <td className="text-right">
                        {Number(s.totalAmount ?? 0).toFixed(2)}
                      </td>
                      <td>
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-footer-between text-muted">
        <span>Укупно рачуна: {sales.length}</span>
        <span />
      </div>
    </div>
  );
};
