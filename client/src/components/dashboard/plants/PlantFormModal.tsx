import React, { useEffect, useRef, useState } from "react";
import { PlantState } from "../../../models/plants/PlantState";
import { CreatePlantDTO } from "../../../models/plants/CreatePlantDTO";
import { UpdatePlantDTO } from "../../../models/plants/UpdatePlantDTO";
import { PlantDTO } from "../../../models/plants/PlantDTO";
import "./PlantFormModal.css";

type Mode = "create" | "edit";

type Props = {
  isOpen: boolean;
  mode: Mode;
  initial?: PlantDTO | null;
  onClose: () => void;
  onSubmit: (payload: CreatePlantDTO | UpdatePlantDTO) => Promise<void>;
};

type FormState = {
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: string;
  state: PlantState;
};

const defaultState: FormState = {
  commonName: "",
  latinName: "",
  originCountry: "",
  oilStrength: "1.0",
  state: PlantState.PLANTED,
};

export const PlantFormModal: React.FC<Props> = ({ isOpen, mode, initial, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(defaultState);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && initial) {
      setForm({
        commonName: initial.commonName ?? "",
        latinName: initial.latinName ?? "",
        originCountry: initial.originCountry ?? "",
        oilStrength: String(initial.oilStrength ?? "1.0"),
        state: initial.state ?? PlantState.PLANTED,
      });
    } else if (isOpen) {
      setForm(defaultState);
    }
  }, [isOpen, initial]);

  // Trap tab у оквиру модала
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const container = modalRef.current;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>("input, select, textarea, button")).filter((el) => !el.hasAttribute("disabled"));
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!focusable.length) return;
      const current = document.activeElement as HTMLElement;
      const idx = focusable.indexOf(current);
      const lastIdx = focusable.length - 1;
      if (e.shiftKey) {
        const prev = idx <= 0 ? focusable[lastIdx] : focusable[idx - 1];
        prev.focus();
        e.preventDefault();
      } else {
        const next = idx === lastIdx ? focusable[0] : focusable[idx + 1];
        next.focus();
        e.preventDefault();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = (): string | null => {
    const strength = Number(form.oilStrength);
    if (!form.commonName || form.commonName.trim().length < 3) return "Општи назив мора имати најмање 3 знака.";
    if (!form.latinName || form.latinName.trim().length < 3) return "Латински назив мора имати најмање 3 знака.";
    if (!form.originCountry || form.originCountry.trim().length < 2) return "Земља порекла мора имати најмање 2 знака.";
    if (Number.isNaN(strength) || strength < 1 || strength > 5) return "Јачина уља мора бити између 1.0 и 5.0.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setIsSubmitting(true);
    try {
      const strength = Number(Number(form.oilStrength).toFixed(1));
      if (mode === "create") {
        const payload: CreatePlantDTO = {
          commonName: form.commonName.trim(),
          latinName: form.latinName.trim(),
          originCountry: form.originCountry.trim(),
          oilStrength: strength,
          state: form.state,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdatePlantDTO = {
          commonName: form.commonName.trim(),
          latinName: form.latinName.trim(),
          originCountry: form.originCountry.trim(),
          oilStrength: strength,
          state: form.state,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Грешка при чувању биљке.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overlay">
      <div className="window plant-modal-window" ref={modalRef} tabIndex={-1}>
        <div className="titlebar">
          <div className="titlebar-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
            </svg>
          </div>
          <span className="titlebar-title">{mode === "create" ? "Нова биљка" : "Измена биљке"}</span>
          <div className="titlebar-controls">
            <button className="titlebar-btn close" onClick={onClose} aria-label="Close">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="window-content plant-modal-content">
          <form onSubmit={handleSubmit} className="plant-form">
            <div>
              <label className="plant-label" htmlFor="commonName">Општи назив</label>
              <input id="commonName" name="commonName" className="auth-input" value={form.commonName} onChange={handleChange} placeholder="Нпр. Ружа" required />
            </div>

            <div>
              <label className="plant-label" htmlFor="latinName">Латински назив</label>
              <input id="latinName" name="latinName" className="auth-input" value={form.latinName} onChange={handleChange} placeholder="Нпр. Rosa rubiginosa" required />
            </div>

            <div>
              <label className="plant-label" htmlFor="originCountry">Земља порекла</label>
              <input id="originCountry" name="originCountry" className="auth-input" value={form.originCountry} onChange={handleChange} placeholder="Нпр. Француска" required />
            </div>

            <div>
              <label className="plant-label" htmlFor="oilStrength">Јачина уља (1.0 - 5.0)</label>
              <input
                id="oilStrength"
                name="oilStrength"
                className="auth-input"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.oilStrength}
                onChange={handleChange}
                placeholder="1.0 - 5.0"
                required
              />
            </div>

            <div>
              <label className="plant-label" htmlFor="state">Стање</label>
              <select id="state" name="state" className="auth-input" value={form.state} onChange={handleChange}>
                <option value={PlantState.PLANTED}>Посађена</option>
                <option value={PlantState.HARVESTED}>Убрана</option>
                <option value={PlantState.PROCESSED}>Прерађена</option>
              </select>
            </div>

            {error && (
              <div className="card plant-error">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
                  </svg>
                  <span className="plant-error-text">{error}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 plant-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Откажи
              </button>
              <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
                {isSubmitting ? "Чување..." : mode === "create" ? "Креирај" : "Сачувај измене"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
