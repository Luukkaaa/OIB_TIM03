import React, { useEffect, useMemo, useRef, useState } from "react";
import { IProcessingAPI } from "../../../api/processing/IProcessingAPI";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PerfumeDTO } from "../../../models/processing/PerfumeDTO";
import { PerfumeType } from "../../../models/processing/PerfumeType";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";

type Props = {
  processingAPI: IProcessingAPI;
  plantAPI: IPlantAPI;
};

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

export const ProcessingPanel: React.FC<Props> = ({ processingAPI, plantAPI }) => {
  const { token } = useAuth();
  const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  const totalAvailablePlants = useMemo(() => plants.reduce((sum, p) => sum + (p.quantity ?? 0), 0), [plants]);

  useEffect(() => {
    if (hasToken) void loadData();
  }, [hasToken]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [perfumeData, plantData] = await Promise.all([processingAPI.getPerfumes(token), plantAPI.getAllPlants(token)]);
      setPerfumes(perfumeData);
      setPlants(plantData);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Неуспешно учитавање прераде.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.open && modalRef.current) {
      const focusables = modalRef.current.querySelectorAll<HTMLElement>("input, select, textarea, button");
      focusables[0]?.focus();
    }
  }, [modal.open]);

  const trapFocus = (event: React.KeyboardEvent) => {
    if (!modal.open || event.key !== "Tab" || !modalRef.current) return;
    const focusables = Array.from(modalRef.current.querySelectorAll<HTMLElement>("input, select, textarea, button"));
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
    if (!modal.name.trim() || !modal.expirationDate || !modal.plantId || modal.count <= 0) {
      setModalError("Попуните обавезна поља и изаберите биљку.");
      return;
    }
    setLoading(true);
    setError("");
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
    } catch (err: any) {
      setModalError(err?.response?.data?.message || "Неуспешно покретање прераде.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "skladisten" || normalized === "складиштен") return { label: "Складиштен", bg: "#d7d0f5" };
    return { label: "Спакован", bg: "#f7c77d" };
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, height: "100%" }}>
      <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ margin: 0 }}>Сервис прераде</h3>
            <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Преглед и управљање прерадом биљака у парфеме.</p>
          </div>
          <button className="btn btn-accent" onClick={() => setModal((m) => ({ ...m, open: true }))}>Започни прераду</button>
        </div>

        {error && (
          <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--win11-subtle)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Назив парфема</th>
                  <th style={{ padding: "10px 12px" }}>Тип</th>
                  <th style={{ padding: "10px 12px" }}>Запремина</th>
                  <th style={{ padding: "10px 12px" }}>Серијски број</th>
                  <th style={{ padding: "10px 12px" }}>Рок трајања</th>
                  <th style={{ padding: "10px 12px" }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "14px", textAlign: "center" }}>Учитавање...</td>
                  </tr>
                ) : perfumes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "14px", textAlign: "center" }}>Нема парфема.</td>
                  </tr>
                ) : (
                  perfumes.map((p) => {
                    const badge = statusBadge(p.status);
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--win11-divider)" }}>
                        <td style={{ padding: "10px 12px" }}>{p.name}</td>
                        <td style={{ padding: "10px 12px" }}>{p.type === PerfumeType.KOLONJSKA ? "Колоњска вода" : "Парфем"}</td>
                        <td style={{ padding: "10px 12px" }}>{p.netQuantityMl} ml</td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 13 }}>{p.serialNumber}</td>
                        <td style={{ padding: "10px 12px" }}>{new Date(p.expirationDate).toLocaleDateString()}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span className="badge" style={{ padding: "4px 8px", borderRadius: 8, background: badge.bg }}>
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

      <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        <div className="card" style={{ padding: "10px 12px" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Информације о преради</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Правила прераде:</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: "var(--win11-text-secondary)", lineHeight: 1.6 }}>
            <li>Од 1 биљке = 50 ml парфема</li>
            <li>Запремине: 150ml или 250ml</li>
            <li>Серијски број: PP-2025-ID</li>
          </ul>
        </div>

        <div className="card" style={{ padding: "10px 12px" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Упозорења:</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: "var(--win11-text-secondary)", lineHeight: 1.6 }}>
            <li>Јачина уља &gt; 4.0 захтева балансирање</li>
            <li>Засадити нову биљку за равнотежу</li>
          </ul>
        </div>

        <div
          className="card"
          style={{
            padding: "10px 12px",
            flex: 1,
            borderRadius: 12,
            border: "1px solid #2c2c2c",
            marginBottom: 4
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Доступне биљке:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, color: "var(--win11-text-secondary)" }}>
            {plants.length === 0 ? (
              <span>Нема доступних биљака.</span>
            ) : (
              plants.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{p.commonName}</span>
                  <span>{p.quantity ?? 0} ком</span>
                </div>
              ))
            )}
          </div>
          <div
            style={{
              paddingTop: 8,
              borderTop: "1px solid var(--win11-divider)",
              marginTop: 8,
              fontSize: 12,
              color: "var(--win11-text-secondary)"
            }}
          >
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "var(--win11-text-secondary)",
          fontSize: 12,
          marginTop: 8,
          paddingRight: 24
        }}
      >
        <span>Укупно парфема: {perfumes.length}</span>
        <span>Укупно доступних биљака: {totalAvailablePlants}</span>
      </div>

      {modal.open && (
        <div
          className="overlay"
          style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          onKeyDown={trapFocus}
        >
          <div className="window" style={{ width: 440, maxWidth: "95%" }} ref={modalRef}>
            <div className="titlebar">
              <span className="titlebar-title">Започни прераду</span>
              <div className="titlebar-controls">
                <button className="titlebar-btn close" onClick={() => setModal((m) => ({ ...m, open: false }))} aria-label="Close">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="window-content" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {modalError && (
                <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
                  <span style={{ fontSize: 13 }}>{modalError}</span>
                </div>
              )}
              <div>
                <label>Назив парфема</label>
                <input className="auth-input" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} />
              </div>
              <div>
                <label>Тип</label>
                <select className="auth-input" value={modal.type} onChange={(e) => setModal({ ...modal, type: e.target.value as PerfumeType })}>
                  <option value={PerfumeType.PARFEM}>Парфем</option>
                  <option value={PerfumeType.KOLONJSKA}>Колоњска вода</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label>Запремина (ml)</label>
                  <select className="auth-input" value={modal.volume} onChange={(e) => setModal({ ...modal, volume: Number(e.target.value) })}>
                    <option value={150}>150</option>
                    <option value={250}>250</option>
                  </select>
                </div>
                <div>
                  <label>Број боца</label>
                  <input
                    className="auth-input"
                    type="number"
                    min={1}
                    value={modal.count}
                    onChange={(e) => setModal({ ...modal, count: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label>Биљка</label>
                <select
                  className="auth-input"
                  value={modal.plantId}
                  onChange={(e) => setModal({ ...modal, plantId: e.target.value ? Number(e.target.value) : "" })}
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
                <label>Рок трајања</label>
                <input
                  className="auth-input"
                  type="date"
                  value={modal.expirationDate}
                  onChange={(e) => setModal({ ...modal, expirationDate: e.target.value })}
                />
              </div>
              <div>
                <label>Префикс серије</label>
                <input
                  className="auth-input"
                  value={modal.serialPrefix}
                  onChange={(e) => setModal({ ...modal, serialPrefix: e.target.value })}
                  placeholder="PP-2025"
                />
              </div>
              <div className="flex items-center justify-end" style={{ gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal((m) => ({ ...m, open: false }))}>
                  Откажи
                </button>
                <button className="btn btn-accent" onClick={handleStartProcess} disabled={loading}>
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
