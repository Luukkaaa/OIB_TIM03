import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { PlantState } from "../../../models/plants/PlantState";
import { ProductionLog } from "./ProductionLog";
import "./ProductionPanel.css";

type Props = {
  plantAPI: IPlantAPI;
};

type ModalType = "seed" | "harvest" | "adjust" | null;
type LogEntry = { id: string; time: string; message: string };
type Notice = { text: string; tone: "info" | "warn" | "error" | "success" };

let cachedLogs: LogEntry[] = [];

export const ProductionPanel: React.FC<Props> = ({ plantAPI }) => {
  const { token, user } = useAuth();
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logError, setLogError] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [seedForm, setSeedForm] = useState({
    commonName: "",
    latinName: "",
    originCountry: "",
    oilStrength: "",
  });
  const [harvestForm, setHarvestForm] = useState({ commonName: "", count: "" });
  const [adjustForm, setAdjustForm] = useState({ plantId: "", targetPercent: "" });
  const modalRef = useRef<HTMLDivElement | null>(null);

  const hasToken = useMemo(() => !!token, [token]);
  const role = useMemo(() => (user?.role ?? "").toLowerCase(), [user]);
  const hideLogs = role === "seller" || role === "sales_manager";
  const totalQuantity = useMemo(
    () => plants.reduce((sum, p) => sum + (p.quantity ?? 0), 0),
    [plants]
  );

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

  // trap focus inside modal
  useEffect(() => {
    if (!modal || !modalRef.current) return;
    const container = modalRef.current;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>("input, button")
    ).filter((el) => !el.hasAttribute("disabled"));
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
    setModalError("");
    setNotice(null);
    try {
      const data = await plantAPI.getAllPlants(token);
      setPlants(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Неуспешно учитавање биљака.";
      setNotice({ text: msg, tone: "error" });
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
      const res = await axios.get<{ data: any[] } | any[]>(
        `${import.meta.env.VITE_GATEWAY_URL}/logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    setModalError("");
    setNotice(null);
    try {
      const oil = seedForm.oilStrength ? Number(seedForm.oilStrength) : undefined;
      await plantAPI.seedPlant(token, {
        commonName: seedForm.commonName,
        latinName: seedForm.latinName,
        originCountry: seedForm.originCountry,
        oilStrength: oil,
      });
      addLog(`Засађена биљка: ${seedForm.commonName}`);
      setNotice({
        text: `Успешно засађена биљка ${seedForm.commonName}.`,
        tone: "success",
      });
      await loadPlants();
      setSeedForm({
        commonName: "",
        latinName: "",
        originCountry: "",
        oilStrength: "",
      });
      setModal(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Неуспешно садњење.";
      setModalError(msg);
      setNotice({ text: msg, tone: "error" });
    }
  };

  const handleHarvest = async () => {
    if (!token) return;
    setModalError("");
    setNotice(null);
    try {
      await plantAPI.harvestPlants(token, {
        commonName: harvestForm.commonName,
        count: Number(harvestForm.count),
      });
      addLog(`Убрано ${harvestForm.count} биљака: ${harvestForm.commonName}`);
      setNotice({
        text: `Убрано ${harvestForm.count} биљака (${harvestForm.commonName}).`,
        tone: "success",
      });
      await loadPlants();
      setHarvestForm({ commonName: "", count: "" });
      setModal(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Неуспешно убирање.";
      setModalError(msg);
      setNotice({ text: msg, tone: "error" });
    }
  };

  const handleAdjust = async () => {
    if (!token) return;
    setModalError("");
    setNotice(null);
    try {
      const strength = Number(adjustForm.targetPercent);
      if (Number.isNaN(strength) || strength < 1 || strength > 5) {
        setModalError("Јачина мора бити између 1 и 5.");
        return;
      }

      await plantAPI.adjustStrength(token, {
        plantId: Number(adjustForm.plantId),
        targetPercent: strength,
      });
      addLog(`Подешена јачина за биљку ID ${adjustForm.plantId} на ${strength}`);
      setNotice({
        text: `Јачина подешена на ${strength} за биљку ${adjustForm.plantId}.`,
        tone: "success",
      });
      await loadPlants();
      setAdjustForm({ plantId: "", targetPercent: "" });
      setModal(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Неуспешно подешавање јачине.";
      setModalError(msg);
      setNotice({ text: msg, tone: "error" });
    }
  };

  const badge = (state: PlantState) => {
    switch (state) {
      case PlantState.PLANTED:
        return { label: "Посађена", colorClass: "plant-badge-planted" };
      case PlantState.HARVESTED:
        return { label: "Убрана", colorClass: "plant-badge-harvested" };
      case PlantState.PROCESSED:
        return { label: "Прерађена", colorClass: "plant-badge-processed" };
      default:
        return { label: state, colorClass: "plant-badge-default" };
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
    <div className="production-layout">
      {/* LEVA STRANA */}
      <div className="card production-main">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="production-title">Управљање биљкама</h3>
            <p className="production-subtitle">
              Преглед, претрага и управљање биљкама.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-accent" onClick={() => setModal("seed")}>
              Засади
            </button>
            <button className="btn btn-accent" onClick={() => setModal("harvest")}>
              Убери
            </button>
            <button className="btn btn-accent" onClick={() => setModal("adjust")}>
              Промени јачину
            </button>
          </div>
        </div>

        {notice && (
          <div className={`card production-notice notice-${notice.tone}`}>
            <span className="production-notice-text">{notice.text}</span>
          </div>
        )}

        <div className="card production-table-card">
          <div className="production-table-scroll">
            <table className="production-table">
              <thead>
                <tr className="production-table-header-row">
                  <th className="production-table-header-cell">Назив</th>
                  <th className="production-table-header-cell">Латински назив</th>
                  <th className="production-table-header-cell">Количина</th>
                  <th className="production-table-header-cell">Јачина</th>
                  <th className="production-table-header-cell">Стање</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="production-table-cell center" colSpan={5}>
                      Учитавање...
                    </td>
                  </tr>
                ) : plants.length === 0 ? (
                  <tr>
                    <td className="production-table-cell center" colSpan={5}>
                      Нема биљака.
                    </td>
                  </tr>
                ) : (
                  plants.map((p) => {
                    const b = badge(p.state);
                    const strengthValid =
                      p.oilStrength !== undefined &&
                      !Number.isNaN(Number(p.oilStrength));
                    return (
                      <tr key={p.id} className="production-table-row">
                        <td className="production-table-cell">
                          <div className="production-plant-name">{p.commonName}</div>
                          <div className="production-plant-id">ID: {p.id}</div>
                        </td>
                        <td className="production-table-cell">{p.latinName}</td>
                        <td className="production-table-cell">{p.quantity ?? 0}</td>
                        <td className="production-table-cell">
                          {strengthValid ? Number(p.oilStrength).toFixed(1) : "-"}
                        </td>
                        <td className="production-table-cell">
                          <span className={`badge production-plant-badge ${b.colorClass}`}>
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

        <div className="production-footer">
          <span>Укупно биљака: {totalQuantity}</span>
          <span>Датум: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* DESNA STRANA */}
      <div className="card production-log-card">
        {hideLogs ? (
          <div className="production-log-unavailable">
            Дневник производње није доступан за ову улогу.
          </div>
        ) : (
          <ProductionLog entries={logs} onRefresh={() => loadLogs(true)} error={logError} />
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="overlay production-modal-overlay">
          <div
            className="window user-modal-window production-modal-window"
            ref={modalRef}
            tabIndex={-1}
          >
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
                <button
                  className="titlebar-btn close"
                  onClick={() => setModal(null)}
                  aria-label="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path
                      d="M0 0L10 10M10 0L0 10"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="window-content user-modal-content production-modal-content">
              {modalError && (
                <div className="card production-modal-error">
                  <span className="production-notice-text">{modalError}</span>
                </div>
              )}

              {modal === "seed" && (
                <>
                  <div>
                    <label htmlFor="seedCommonName">Назив</label>
                    <input
                      id="seedCommonName"
                      className="auth-input"
                      value={seedForm.commonName}
                      onChange={(e) =>
                        setSeedForm({ ...seedForm, commonName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="seedLatinName">Латински назив</label>
                    <input
                      id="seedLatinName"
                      className="auth-input"
                      value={seedForm.latinName}
                      onChange={(e) =>
                        setSeedForm({ ...seedForm, latinName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="seedOriginCountry">Земља порекла</label>
                    <input
                      id="seedOriginCountry"
                      className="auth-input"
                      value={seedForm.originCountry}
                      onChange={(e) =>
                        setSeedForm({ ...seedForm, originCountry: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="seedOilStrength">Јачина (опсег 1-5)</label>
                    <input
                      id="seedOilStrength"
                      className="auth-input"
                      value={seedForm.oilStrength}
                      onChange={(e) =>
                        setSeedForm({ ...seedForm, oilStrength: e.target.value })
                      }
                    />
                  </div>
                  <div className="production-modal-actions">
                    <button className="btn btn-ghost" onClick={() => setModal(null)}>
                      Откажи
                    </button>
                    <button className="btn btn-accent" onClick={handleSeed}>
                      Сачувај
                    </button>
                  </div>
                </>
              )}

              {modal === "harvest" && (
                <>
                  <div>
                    <label htmlFor="harvestCommonName">Назив биљке</label>
                    <input
                      id="harvestCommonName"
                      className="auth-input"
                      value={harvestForm.commonName}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          commonName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="harvestCount">Количина</label>
                    <input
                      id="harvestCount"
                      className="auth-input"
                      value={harvestForm.count}
                      onChange={(e) =>
                        setHarvestForm({ ...harvestForm, count: e.target.value })
                      }
                    />
                  </div>
                  <div className="production-modal-actions">
                    <button className="btn btn-ghost" onClick={() => setModal(null)}>
                      Откажи
                    </button>
                    <button className="btn btn-accent" onClick={handleHarvest}>
                      Сачувај
                    </button>
                  </div>
                </>
              )}

              {modal === "adjust" && (
                <>
                  <div>
                    <label htmlFor="adjustPlantId">ID биљке</label>
                    <input
                      id="adjustPlantId"
                      className="auth-input"
                      value={adjustForm.plantId}
                      onChange={(e) =>
                        setAdjustForm({ ...adjustForm, plantId: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="adjustTargetPercent">Јачина (1-5)</label>
                    <input
                      id="adjustTargetPercent"
                      className="auth-input"
                      value={adjustForm.targetPercent}
                      onChange={(e) =>
                        setAdjustForm({
                          ...adjustForm,
                          targetPercent: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="production-modal-actions">
                    <button className="btn btn-ghost" onClick={() => setModal(null)}>
                      Откажи
                    </button>
                    <button className="btn btn-accent" onClick={handleAdjust}>
                      Сачувај
                    </button>
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
