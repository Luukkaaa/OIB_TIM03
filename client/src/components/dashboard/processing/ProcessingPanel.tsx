import React, { useEffect, useMemo, useRef, useState } from "react";
import { IProcessingAPI } from "../../../api/processing/IProcessingAPI";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PerfumeDTO } from "../../../models/processing/PerfumeDTO";
import { PerfumeType } from "../../../models/processing/PerfumeType";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import "./ProcessingPanel.css"; 

type Props = {
  processingAPI: IProcessingAPI;
  plantAPI: IPlantAPI;
};

// proširenje da TS ne kuka za p.status
type PerfumeWithStatus = PerfumeDTO & { status?: string };

type ModalState = {
  open: boolean;
  name: string;
  type: PerfumeType;
  volume: number;
  count: number;
  plantId: number | "";
  expirationDate: string;
  serialPrefix: string;
};

type Notice = { text: string; tone: "info" | "warn" | "error" | "success" };

export const ProcessingPanel: React.FC<Props> = ({ processingAPI, plantAPI }) => {
  const { token } = useAuth();
  const [perfumes, setPerfumes] = useState<PerfumeWithStatus[]>([]);
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [modalError, setModalError] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    name: "",
    type: PerfumeType.PARFEM,
    volume: 250,
    count: 1,
    plantId: "",
    expirationDate: "",
    serialPrefix: "PP-2025",
  });

  const hasToken = useMemo(() => !!token, [token]);
  const totalAvailablePlants = useMemo(
    () => plants.reduce((sum, p) => sum + (p.quantity ?? 0), 0),
    [plants]
  );

  useEffect(() => {
    if (hasToken) void loadData();
  }, [hasToken]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setNotice(null);
    try {
      const [perfumeData, plantData] = await Promise.all([
        processingAPI.getPerfumes(token),
        plantAPI.getAllPlants(token),
      ]);
      setPerfumes(perfumeData);
      setPlants(plantData);
    } catch (err: any) {
      setNotice({
        text: err?.response?.data?.message || "Неуспешно учитавање података о преради.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.open && modalRef.current) {
      const focusables =
        modalRef.current.querySelectorAll<HTMLElement>("input, select, textarea, button");
      focusables[0]?.focus();
    }
  }, [modal.open]);

  const trapFocus = (event: React.KeyboardEvent) => {
    if (!modal.open || event.key !== "Tab" || !modalRef.current) return;
    const focusables = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>("input, select, textarea, button")
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  };

  const handleStartProcess = async () => {
    if (!token) return;
    setModalError("");
    setNotice(null);

    if (!modal.name.trim() || !modal.expirationDate || !modal.plantId || modal.count <= 0) {
      setModalError("Попуните сва обавезна поља и изаберите биљку.");
      return;
    }

    setLoading(true);
    try {
      const res = await processingAPI.startProcessing(token, {
        perfumeName: modal.name.trim(),
        perfumeType: modal.type,
        bottleVolumeMl: modal.volume,
        bottleCount: modal.count,
        plantId: Number(modal.plantId),
        expirationDate: modal.expirationDate,
        serialPrefix: modal.serialPrefix || undefined,
      });
      setPerfumes((prev) => [...res, ...prev]);
      setModal((m) => ({ ...m, open: false }));
      setNotice({
        text: `Прерада покренута: ${modal.count} боца (${modal.name}).`,
        tone: "success",
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Неуспешно покретање прераде.";
      setModalError(msg);
      setNotice({ text: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "skladisten" || normalized === "складиштен") {
      return { label: "Складиштен", bgClass: "badge-skladisten" };
    }
    return { label: "Спакован", bgClass: "badge-spakovan" };
  };

  return (
    <div className="processing-layout">
      {/* LEVA STRANA */}
      <div className="card processing-main">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="processing-title">Сервис прераде</h3>
            <p className="processing-subtitle">
              Преглед и управљање прерадом биљака у парфеме.
            </p>
          </div>
          <button
            className="btn btn-accent"
            onClick={() => setModal((m) => ({ ...m, open: true }))}
          >
            Започни прераду
          </button>
        </div>

        {notice && (
          <div className={`card notice-card notice-${notice.tone}`}>
            <span className="notice-text">{notice.text}</span>
          </div>
        )}

        <div className="card processing-table-card">
          <div className="processing-table-scroll">
            <table className="processing-table">
              <thead>
                <tr className="processing-table-header-row">
                  <th className="processing-table-header-cell">Назив парфема</th>
                  <th className="processing-table-header-cell">Тип</th>
                  <th className="processing-table-header-cell">Запремина</th>
                  <th className="processing-table-header-cell">Серијски број</th>
                  <th className="processing-table-header-cell">Рок трајања</th>
                  <th className="processing-table-header-cell">Статус</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="processing-table-cell center" colSpan={6}>
                      Учитавање...
                    </td>
                  </tr>
                ) : perfumes.length === 0 ? (
                  <tr>
                    <td className="processing-table-cell center" colSpan={6}>
                      Нема парфема.
                    </td>
                  </tr>
                ) : (
                  perfumes.map((p) => {
                    const badge = statusBadge(p.status);
                    return (
                      <tr key={p.id} className="processing-table-row">
                        <td className="processing-table-cell">{p.name}</td>
                        <td className="processing-table-cell">
                          {p.type === PerfumeType.KOLONJSKA ? "Колоњска вода" : "Парфем"}
                        </td>
                        <td className="processing-table-cell">{p.netQuantityMl} ml</td>
                        <td className="processing-table-cell mono">
                          {p.serialNumber}
                        </td>
                        <td className="processing-table-cell">
                          {new Date(p.expirationDate).toLocaleDateString()}
                        </td>
                        <td className="processing-table-cell">
                          <span className={`badge processing-badge ${badge.bgClass}`}>
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
      </div>

      {/* DESNA STRANA */}
      <div className="card processing-aside">
        <div className="card processing-info-card">
          <div className="processing-info-title">Информације о преради</div>
          <div className="processing-info-subtitle">Правила прераде:</div>
          <ul className="processing-info-list">
            <li>Од 1 биљке = 50 ml парфема</li>
            <li>Запремине: 150ml или 250ml</li>
            <li>Серијски број: PP-2025-ID</li>
          </ul>
        </div>

        <div className="card processing-info-card">
          <div className="processing-info-title">Упозорења:</div>
          <ul className="processing-info-list">
            <li>Јачина уља &gt; 4.0 захтева балансирање</li>
            <li>Засадити нову биљку за равнотежу</li>
          </ul>
        </div>

        <div className="card processing-plants-card">
          <div className="processing-info-title">Доступне биљке:</div>
          <div className="processing-plants-list">
            {plants.length === 0 ? (
              <span>Нема доступних биљака.</span>
            ) : (
              plants.map((p) => (
                <div key={p.id} className="processing-plants-row">
                  <span>{p.commonName}</span>
                  <span>{p.quantity ?? 0} ком</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="processing-footer">
        <span>Укупно парфема: {perfumes.length}</span>
        <span>Укупно доступних биљака: {totalAvailablePlants}</span>
      </div>

      {/* MODAL */}
      {modal.open && (
        <div
          className="overlay processing-modal-overlay"
          onKeyDown={trapFocus}
        >
          <div className="window processing-modal-window" ref={modalRef}>
            <div className="titlebar">
              <span className="titlebar-title">Започни прераду</span>
              <div className="titlebar-controls">
                <button
                  className="titlebar-btn close"
                  onClick={() => setModal((m) => ({ ...m, open: false }))}
                  aria-label="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="window-content processing-modal-content">
              {modalError && (
                <div className="card processing-modal-error">
                  <span className="notice-text">{modalError}</span>
                </div>
              )}
              <div>
                <label htmlFor="perfumeName">Назив парфема</label>
                <input
                  id="perfumeName"
                  className="auth-input"
                  value={modal.name}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="perfumeType">Тип</label>
                <select
                  id="perfumeType"
                  className="auth-input"
                  value={modal.type}
                  onChange={(e) =>
                    setModal({ ...modal, type: e.target.value as PerfumeType })
                  }
                >
                  <option value={PerfumeType.PARFEM}>Парфем</option>
                  <option value={PerfumeType.KOLONJSKA}>Колоњска вода</option>
                </select>
              </div>
              <div className="processing-modal-grid">
                <div>
                  <label htmlFor="perfumeVolume">Запремина (ml)</label>
                  <select
                    id="perfumeVolume"
                    className="auth-input"
                    value={modal.volume}
                    onChange={(e) =>
                      setModal({ ...modal, volume: Number(e.target.value) })
                    }
                  >
                    <option value={150}>150</option>
                    <option value={250}>250</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bottleCount">Број боца</label>
                  <input
                    id="bottleCount"
                    className="auth-input"
                    type="number"
                    min={1}
                    value={modal.count}
                    onChange={(e) =>
                      setModal({ ...modal, count: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor="plantSelect">Биљка</label>
                <select
                  id="plantSelect"
                  className="auth-input"
                  value={modal.plantId}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      plantId: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                >
                  <option value="">Изабери биљку</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.commonName} (ID {p.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="expirationDate">Рок трајања</label>
                <input
                  id="expirationDate"
                  className="auth-input"
                  type="date"
                  value={modal.expirationDate}
                  onChange={(e) =>
                    setModal({ ...modal, expirationDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="serialPrefix">Префикс серије</label>
                <input
                  id="serialPrefix"
                  className="auth-input"
                  value={modal.serialPrefix}
                  onChange={(e) =>
                    setModal({ ...modal, serialPrefix: e.target.value })
                  }
                  placeholder="PP-2025"
                />
              </div>
              <div className="processing-modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setModal((m) => ({ ...m, open: false }))}
                >
                  Откажи
                </button>
                <button
                  className="btn btn-accent"
                  onClick={handleStartProcess}
                  disabled={loading}
                >
                  Сачувај
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
