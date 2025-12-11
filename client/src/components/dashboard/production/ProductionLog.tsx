import React from "react";
import "./ProductionLog.css";

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
    <div className="card productionlog-root">
      <div className="productionlog-header">
        <div>
          <h3 className="productionlog-title">Дневник производње</h3>
          <p className="productionlog-subtitle">Бележи све акције у производњи.</p>
        </div>
        {onRefresh && (
          <button className="btn btn-ghost productionlog-refresh-btn" onClick={onRefresh}>
            Освежи
          </button>
        )}
      </div>

      {error && (
        <div className="card productionlog-error">
          <span className="productionlog-error-text">{error}</span>
        </div>
      )}

      <div className="productionlog-body">
        {entries.length === 0 ? (
          <div className="productionlog-empty">
            Нема забележених акција. Освежи.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="productionlog-entry">
              <div className="productionlog-entry-time">{entry.time}</div>
              <div className="productionlog-entry-message">{entry.message}</div>
            </div>
          ))
        )}
      </div>

      <div className="productionlog-footer">
        Укупно акција: {entries.length}
      </div>
    </div>
  );
};
