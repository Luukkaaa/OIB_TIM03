import React, { useEffect, useMemo, useState } from "react";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { UserDTO } from "../../../models/users/UserDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserFormModal } from "./UserFormModal";
import { CreateUserDTO } from "../../../models/users/CreateUserDTO";
import { UpdateUserDTO } from "../../../models/users/UpdateUserDTO";

type Props = {
  userAPI: IUserAPI;
};

export const UserManagement: React.FC<Props> = ({ userAPI }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<UserDTO | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const hasToken = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (hasToken) {
      void loadUsers();
    }
  }, [hasToken]);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await userAPI.getAllUsers(token);
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Неуспешно учитавање корисника.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    if (!search.trim()) {
      void loadUsers();
      return;
    }
    if (search.trim().length < 2) {
      setError("Унесите најмање 2 знака за претрагу.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await userAPI.searchUsers(token, search.trim());
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Грешка при претрази корисника.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserDTO) => {
    setModalMode("edit");
    setSelected(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: UserDTO) => {
    if (!token) return;
    const confirmDelete = window.confirm(`Обрисати корисника ${user.username}?`);
    if (!confirmDelete) return;
    setBusyId(user.id);
    try {
      await userAPI.deleteUser(token, user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Грешка при брисању корисника.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async (payload: CreateUserDTO | UpdateUserDTO) => {
    if (!token) throw new Error("Недостаје токен.");
    if (modalMode === "create") {
      const created = await userAPI.createUser(token, payload as CreateUserDTO);
      setUsers((prev) => [created, ...prev]);
    } else if (selected) {
      const updated = await userAPI.updateUser(token, selected.id, payload as UpdateUserDTO);
      setUsers((prev) => prev.map((u) => (u.id === selected.id ? updated : u)));
    }
  };

  const avatarFor = (user: UserDTO): string | undefined => {
    if (!user.profileImage) return undefined;
    if (user.profileImage.startsWith("data:")) return user.profileImage;
    return `data:image/png;base64,${user.profileImage}`;
  };

  const badgeForRole = (role: string) => {
    const r = role?.toUpperCase();
    if (r === "ADMIN") return { label: "Админ", bg: "#d32f2f33" };
    if (r === "SALES_MANAGER") return { label: "Менаџер продаје", bg: "#1976d233" };
    if (r === "SELLER") return { label: "Продавац", bg: "#388e3c33" };
    return { label: role, bg: "var(--win11-subtle)" };
  };

  return (
    <div className="card" style={{ padding: "16px", height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 style={{ margin: 0 }}>Корисници</h3>
          <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Преглед, претрага и управљање налозима.</p>
        </div>
        <button className="btn btn-accent" onClick={handleCreate}>+ Нови корисник</button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Претрага (име, имејл, корисничко име)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-ghost" onClick={handleSearch}>Претражи</button>
        <button className="btn btn-ghost" onClick={loadUsers}>Освежи</button>
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
                <th style={{ padding: "10px 12px" }}>Корисник</th>
                <th style={{ padding: "10px 12px" }}>Име и презиме</th>
                <th style={{ padding: "10px 12px" }}>Имејл</th>
                <th style={{ padding: "10px 12px" }}>Улога</th>
                <th style={{ padding: "10px 12px", width: "160px" }}>Акције</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>Учитавање...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "14px", textAlign: "center" }}>Нема корисника за приказ.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderTop: "1px solid var(--win11-divider)" }}>
                    <td style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <Avatar src={avatarFor(user)} fallback={user.username.slice(0, 2).toUpperCase()} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.username}</div>
                        <div style={{ color: "var(--win11-text-secondary)", fontSize: "12px" }}>ID: {user.id}</div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>{user.firstName} {user.lastName}</td>
                    <td style={{ padding: "10px 12px" }}>{user.email}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {(() => {
                        const badge = badgeForRole(user.role);
                        return (
                          <span
                            className="badge"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              background: badge.bg,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-ghost" onClick={() => handleEdit(user)} disabled={busyId === user.id}>Измени</button>
                        <button className="btn btn-ghost" onClick={() => handleDelete(user)} disabled={busyId === user.id}>
                          {busyId === user.id ? "Брисање..." : "Обриши"}
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

      <div style={{ color: "var(--win11-text-secondary)", fontSize: 12 }}>
        Укупно корисника: {users.length}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initial={selected}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

const Avatar: React.FC<{ src?: string; fallback: string }> = ({ src, fallback }) => {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--win11-subtle)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "var(--win11-text-secondary)",
        fontWeight: 700,
        fontSize: "12px",
      }}
    >
      {src ? <img src={src} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : fallback}
    </div>
  );
};
