import React, { useEffect, useMemo, useState } from "react";
import { IPlantAPI } from "../../../api/plants/IPlantAPI";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { PlantFormModal } from "./PlantFormModal";
import { CreatePlantDTO } from "../../../models/plants/CreatePlantDTO";
import { UpdatePlantDTO } from "../../../models/plants/UpdatePlantDTO";
import { PlantState } from "../../../models/plants/PlantState";

type Props = {
  plantAPI: IPlantAPI;
};

export const PlantManagement: React.FC<Props> = ({ plantAPI }) => {
  const { token } = useAuth();
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<PlantDTO | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const hasToken = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (hasToken) {
      loadPlants();
    }
  }, [hasToken]);

  const loadPlants = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await plantAPI.getAllPlants(token);
      setPlants(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Neuspešno učitavanje biljaka.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    if (!search.trim()) {
      loadPlants();
      return;
    }
    if (search.trim().length < 2) {
      setError("Unesite najmanje 2 znaka za pretragu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await plantAPI.searchPlants(token, search.trim());
      setPlants(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Greska pri pretrazi biljaka.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plant: PlantDTO) => {
    setModalMode("edit");
    setSelected(plant);
    setIsModalOpen(true);
  };

  const handleDelete = async (plant: PlantDTO) => {
    if (!token) return;
    const confirmDelete = window.confirm(`Obrisati biljku ${plant.commonName}?`);
    if (!confirmDelete) return;
    setBusyId(plant.id);
    try {
      await plantAPI.deletePlant(token, plant.id);
      setPlants((prev) => prev.filter((p) => p.id !== plant.id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Greška pri brisanju biljke.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async (payload: CreatePlantDTO | UpdatePlantDTO) => {
    if (!token) throw new Error("Nedostaje token.");
    if (modalMode === "create") {
      const created = await plantAPI.createPlant(token, payload as CreatePlantDTO);
      setPlants((prev) => [created, ...prev]);
    } else if (selected) {
      const updated = await plantAPI.updatePlant(token, selected.id, payload as UpdatePlantDTO);
      setPlants((prev) => prev.map((p) => (p.id === selected.id ? updated : p)));
    }
  };

  const badgeForState = (state: PlantState) => {
    switch (state) {
      case PlantState.PLANTED:
        return { label: "Posađena", color: "#90caf933" };
      case PlantState.HARVESTED:
        return { label: "Ubrana", color: "#f7d44a33" };
      case PlantState.PROCESSED:
        return { label: "Prerađena", color: "#4caf5033" };
      default:
        return { label: state, color: "var(--win11-subtle)" };
    }
  };

  return (
    <div className="card" style={{ padding: "16px", height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 style={{ margin: 0 }}>Biljke</h3>
          <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Pregled, pretraga i upravljanje biljkama.</p>
        </div>
        <button className="btn btn-accent" onClick={handleCreate}>+ Nova biljka</button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Pretraga (naziv, latinski)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={handleSearch}>Pretraži</button>
        <button className="btn btn-ghost" onClick={loadPlants}>Osveži</button>
      </div>

      {error && (
        <div className="card" style={{ padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span style={{ fontSize: "13px" }}>{error}</span>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ overflow: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--win11-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Naziv</th>
                <th style={{ padding: "10px 12px" }}>Latinski</th>
                <th style={{ padding: "10px 12px" }}>Poreklo</th>
                <th style={{ padding: "10px 12px" }}>Jacina ulja</th>
                <th style={{ padding: "10px 12px" }}>Stanje</th>
                <th style={{ padding: "10px 12px", width: "160px" }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "14px", textAlign: "center" }}>Učitavanje...</td>
                </tr>
              ) : plants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "14px", textAlign: "center" }}>Nema biljaka za prikaz.</td>
                </tr>
              ) : (
                plants.map((plant) => {
                  const badge = badgeForState(plant.state);
                  return (
                    <tr key={plant.id} style={{ borderTop: "1px solid var(--win11-divider)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600 }}>{plant.commonName}</div>
                        <div style={{ color: "var(--win11-text-secondary)", fontSize: "12px" }}>ID: {plant.id}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>{plant.latinName}</td>
                      <td style={{ padding: "10px 12px" }}>{plant.originCountry}</td>
                      <td style={{ padding: "10px 12px" }}>{Number(plant.oilStrength).toFixed(1)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span className="badge" style={{ padding: "4px 8px", borderRadius: "8px", background: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div className="flex items-center gap-2">
                          <button className="btn btn-ghost" onClick={() => handleEdit(plant)} disabled={busyId === plant.id}>Izmeni</button>
                          <button className="btn btn-ghost" onClick={() => handleDelete(plant)} disabled={busyId === plant.id}>
                            {busyId === plant.id ? "Brisanje..." : "Obrisi"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PlantFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initial={selected}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
