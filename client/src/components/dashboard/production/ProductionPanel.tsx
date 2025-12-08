import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { PlantState } from "../../../models/plants/PlantState";
import { ProductionLog } from "./ProductionLog";

type Props = {
  plantAPI: IPlantAPI;
};

type ModalType = "seed" | "harvest" | "adjust" | null;

type LogEntry = { id: string; time: string; message: string };

let cachedLogs: LogEntry[] = [];

export const ProductionPanel: React.FC<Props> = ({ plantAPI }) => {
  const { token, user } = useAuth();
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logError, setLogError] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [modalError, setModalError] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [seedForm, setSeedForm] = useState({ commonName: "", latinName: "", originCountry: "", oilStrength: "" });
  const [harvestForm, setHarvestForm] = useState({ commonName: "", count: "" });
  const [adjustForm, setAdjustForm] = useState({ plantId: "", targetPercent: "" });

  const hasToken = useMemo(() => !!token, [token]);
  const role = useMemo(() => (user?.role ?? "").toLowerCase(), [user]);
  const hideLogs = role === "seller" || role === "sales_manager";
  const totalQuantity = useMemo(() => plants.reduce((sum, p) => sum + (p.quantity ?? 0), 0), [plants]);

  useEffect(() => {
    if (cachedLogs.length === 0) {
      const stored = localStorage.getItem("productionLogs");
      if (stored) {
        try {
          cachedLogs = JSON.parse(stored);
        } catch {
          cachedLogs = [];
        }
      }
    }
    if (cachedLogs.length > 0) setLogs(cachedLogs);
    if (hasToken) {
      void loadPlants();
      void loadLogs(false);
    }
  }, [hasToken]);

  // фокус остаје унутар модала
  useEffect(() => {
    if (!modal || !modalRef.current) return;
    const container = modalRef.current;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>("input, button")).filter((el) => !el.hasAttribute("disabled"));
    focusable[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable.length) return;
      const active = document.activeElement as HTMLElement;
      const idx = focusable.indexOf(active);
      const lastIdx = focusable.length - 1;
      if (e.shiftKey) {
        const prev = idx <= 0 ? focusable[lastIdx] : focusable[idx - 1];
        prev.focus();
      } else {
        const next = idx === lastIdx ? focusable[0] : focusable[idx + 1];
        next.focus();
      }
      e.preventDefault();
    };
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [modal]);

  const loadPlants = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    setModalError("");
    try {
      const data = await plantAPI.getAllPlants(token);
      setPlants(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Неуспешно учитавање биљака.");
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (clearExisting = false) => {
    if (!token) return;
    setLogError("");
    if (clearExisting) {
      setLogs([]);
      cachedLogs = [];
      localStorage.removeItem("productionLogs");
    }
    try {
      const res = await axios.get<{ data: any[] } | any[]>(`${import.meta.env.VITE_GATEWAY_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (res.data as any).data ?? res.data;
      const filtered = Array.isArray(payload)
        ? (payload as any[])
            .filter((l) => typeof l.message === "string")
            .map((l) => ({
              id: String(l.id ?? l._id ?? Math.random()),
              time: l.createdAt ? new Date(l.createdAt).toLocaleString() : "",
              message: l.message as string,
            }))
            .slice(-100)
            .reverse()
        : [];
      if (filtered.length > 0) {
        setLogs(filtered);
        cachedLogs = filtered;
        localStorage.setItem("productionLogs", JSON.stringify(filtered));
      }
    } catch (err: any) {
      setLogError(err?.response?.data?.message || "Неуспешно учитавање дневника.");
    }
  };

  const handleSeed = async () => {
    if (!token) return;
    setError("");
    setModalError("");
    try {
      const oil = seedForm.oilStrength ? Number(seedForm.oilStrength) : undefined;
      await plantAPI.seedPlant(token, {
        commonName: seedForm.commonName,
        latinName: seedForm.latinName,
        originCountry: seedForm.originCountry,
        oilStrength: oil,
      });
      addLog(`Засађена биљка: ${seedForm.commonName}`);
      await loadPlants();
      setSeedForm({ commonName: "", latinName: "", originCountry: "", oilStrength: "" });
      setModal(null);
    } catch (err: any) {
      setModalError(err?.response?.data?.message || "Неуспешно сађење.");
    }
  };

  const handleHarvest = async () => {
    if (!token) return;
    setError("");
    setModalError("");
    try {
      await plantAPI.harvestPlants(token, {
        commonName: harvestForm.commonName,
        count: Number(harvestForm.count),
      });
      addLog(`Убрано ${harvestForm.count} биљака: ${harvestForm.commonName}`);
      await loadPlants();
      setHarvestForm({ commonName: "", count: "" });
      setModal(null);
    } catch (err: any) {
      setModalError(err?.response?.data?.message || "Неуспешно жање.");
    }
  };

  const handleAdjust = async () => {
    if (!token) return;
    setError("");
    setModalError("");
    try {
      const strength = Number(adjustForm.targetPercent);
      if (Number.isNaN(strength) || strength < 1 || strength > 5) {
        setModalError("Опсег мора бити између 1 и 5.");
        return;
      }

      await plantAPI.adjustStrength(token, {
        plantId: Number(adjustForm.plantId),
        targetPercent: strength,
      });
      addLog(`Промењена јачина за биљку ID ${adjustForm.plantId} на ${strength}`);
      await loadPlants();
      setAdjustForm({ plantId: "", targetPercent: "" });
      setModal(null);
    } catch (err: any) {
      setModalError(err?.response?.data?.message || "Неуспешно подешавање јачине.");
    }
  };

  const badge = (state: PlantState) => {
    switch (state) {
      case PlantState.PLANTED:
        return { label: "Посађена", color: "#4caf5033" };
      case PlantState.HARVESTED:
        return { label: "Убрана", color: "#f7d44a33" };
      case PlantState.PROCESSED:
        return { label: "Прерађена", color: "#90caf933" };
      default:
        return { label: state, color: "var(--win11-subtle)" };
    }
  };

  const addLog = (message: string) => {
    const ts = new Date();
    const time = ts.toLocaleTimeString() + " " + ts.toLocaleDateString();
    setLogs((prev) => {
      const next = [{ id: ts.getTime().toString(), time, message }, ...prev].slice(0, 50);
      cachedLogs = next;
      localStorage.setItem("productionLogs", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ margin: 0 }}>Управљање биљкама</h3>
            <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Преглед, претрага и управљање биљкама.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-accent" onClick={() => setModal("seed")}>Засади биљку</button>
            <button className="btn btn-accent" onClick={() => setModal("harvest")}>Убери биљку</button>
            <button className="btn btn-accent" onClick={() => setModal("adjust")}>Промени јачину</button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--win11-subtle)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Назив</th>
                  <th style={{ padding: "10px 12px" }}>Латински</th>
                  <th style={{ padding: "10px 12px" }}>Количина</th>
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
                    <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>Нема биљака.</td>
                  </tr>
                ) : (
                  plants.map((p) => {
                    const b = badge(p.state);
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--win11-divider)" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontWeight: 600 }}>{p.commonName}</div>
                          <div style={{ color: "var(--win11-text-secondary)", fontSize: 12 }}>ID: {p.id}</div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>{p.latinName}</td>
                        <td style={{ padding: "10px 12px" }}>{p.quantity ?? 0}</td>
                        <td style={{ padding: "10px 12px" }}>{Number(p.oilStrength).toFixed(1)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span className="badge" style={{ padding: "4px 8px", borderRadius: 8, background: b.color }}>
                            {b.label}
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

        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--win11-text-secondary)", fontSize: 12 }}>
          <span>Укупно биљака: {totalQuantity}</span>
          <span>Датум: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, height: "100%", minHeight: 0 }}>
        {hideLogs ? (
          <div style={{ padding: "12px", color: "var(--win11-text-secondary)" }}>
            Приступ дневнику није дозвољен за ову улогу.
          </div>
        ) : (
          <ProductionLog entries={logs} onRefresh={() => loadLogs(true)} error={logError} />
        )}
      </div>

      {modal && (
        <div className="overlay">
          <div className="window user-modal-window" ref={modalRef} tabIndex={-1} style={{ width: 440, maxWidth: "95%", display: "flex", flexDirection: "column" }}>
            <div className="titlebar">
              <div className="titlebar-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
                </svg>
              </div>
              <span className="titlebar-title">
                {modal === "seed" && "Засади биљку"}
                {modal === "harvest" && "Убери биљку"}
                {modal === "adjust" && "Промени јачину"}
              </span>
              <div className="titlebar-controls">
                <button className="titlebar-btn close" onClick={() => setModal(null)} aria-label="Close">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="window-content user-modal-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {modalError && (
                <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
                  <span style={{ fontSize: 13 }}>{modalError}</span>
                </div>
              )}

              {modal === "seed" && (
                <>
                  <div>
                    <label>Назив</label>
                    <input className="auth-input" value={seedForm.commonName} onChange={(e) => setSeedForm({ ...seedForm, commonName: e.target.value })} />
                  </div>
                  <div>
                    <label>Латински назив</label>
                    <input className="auth-input" value={seedForm.latinName} onChange={(e) => setSeedForm({ ...seedForm, latinName: e.target.value })} />
                  </div>
                  <div>
                    <label>Земља порекла</label>
                    <input className="auth-input" value={seedForm.originCountry} onChange={(e) => setSeedForm({ ...seedForm, originCountry: e.target.value })} />
                  </div>
                  <div>
                    <label>Јачина (опсег 1-5)</label>
                    <input className="auth-input" value={seedForm.oilStrength} onChange={(e) => setSeedForm({ ...seedForm, oilStrength: e.target.value })} />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button className="btn btn-ghost" onClick={() => setModal(null)}>Откажи</button>
                    <button className="btn btn-accent" onClick={handleSeed}>Сачувај</button>
                  </div>
                </>
              )}

              {modal === "harvest" && (
                <>
                  <div>
                    <label>Назив биљке</label>
                    <input className="auth-input" value={harvestForm.commonName} onChange={(e) => setHarvestForm({ ...harvestForm, commonName: e.target.value })} />
                  </div>
                  <div>
                    <label>Количина</label>
                    <input className="auth-input" value={harvestForm.count} onChange={(e) => setHarvestForm({ ...harvestForm, count: e.target.value })} />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button className="btn btn-ghost" onClick={() => setModal(null)}>Откажи</button>
                    <button className="btn btn-accent" onClick={handleHarvest}>Сачувај</button>
                  </div>
                </>
              )}

              {modal === "adjust" && (
                <>
                  <div>
                    <label>ID биљке</label>
                    <input className="auth-input" value={adjustForm.plantId} onChange={(e) => setAdjustForm({ ...adjustForm, plantId: e.target.value })} />
                  </div>
                  <div>
                    <label>Јачина (1-5)</label>
                    <input className="auth-input" value={adjustForm.targetPercent} onChange={(e) => setAdjustForm({ ...adjustForm, targetPercent: e.target.value })} />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button className="btn btn-ghost" onClick={() => setModal(null)}>Откажи</button>
                    <button className="btn btn-accent" onClick={handleAdjust}>Сачувај</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
