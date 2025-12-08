import React from "react";

type LogEntry = {
  id: string;
  time: string;
  message: string;
};

type Props = {
  entries: LogEntry[];
  onRefresh?: () => void;
  error?: string;
};

export const ProductionLog: React.FC<Props> = ({ entries, onRefresh, error }) => {
  return (
    <div className="card" style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid var(--win11-divider)",
          background: "var(--win11-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Дневник производње</h3>
          <p style={{ margin: 0, color: "var(--win11-text-secondary)" }}>Бележи све акције у производњи.</p>
        </div>
        {onRefresh && (
          <button className="btn btn-ghost" onClick={onRefresh} style={{ padding: "6px 10px" }}>
            Освежи
          </button>
        )}
      </div>

      {error && (
        <div className="card" style={{ margin: 8, padding: "10px 12px", background: "rgba(196,43,28,0.12)", borderColor: "var(--win11-close-hover)" }}>
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto" }}>
        {entries.length === 0 ? (
          <div style={{ padding: "12px", color: "var(--win11-text-secondary)" }}>Нема забележених акција. Освежи.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ borderBottom: "1px solid var(--win11-divider)", padding: "10px 12px" }}>
              <div style={{ fontWeight: 600 }}>{entry.time}</div>
              <div style={{ color: "var(--win11-text-secondary)", fontSize: 13 }}>{entry.message}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--win11-divider)", color: "var(--win11-text-secondary)", fontSize: 12 }}>
        Укупно акција: {entries.length}
      </div>
    </div>
  );
};
