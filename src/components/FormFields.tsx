"use client";

import type { Answers, FormField } from "@/lib/form-types";

type Props = {
  field: FormField;
  value: Answers[string];
  onChange: (id: string, value: string | string[]) => void;
  error?: string;
};

export function FormFieldControl({ field, value, onChange, error }: Props) {
  if (field.type === "info") {
    return (
      <aside className="info-callout" role="note">
        <strong>{field.label}</strong>
        {field.help ? <p>{field.help}</p> : null}
      </aside>
    );
  }

  const id = `field-${field.id}`;

  const labelId = `${id}-label`;

  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      <p className="field-label" id={labelId}>
        {field.label}
        {field.required ? <span className="req" aria-hidden>*</span> : null}
      </p>

      {field.type === "choice" && field.options ? (
        <div className="choice-list" role="radiogroup" aria-labelledby={labelId}>
          {field.options.map((opt) => {
            const optId = `${id}-${opt.value}`;
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                id={optId}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`choice-option ${selected ? "is-selected" : ""}`}
                onClick={() => onChange(field.id, opt.value)}
              >
                <span className="choice-mark" aria-hidden />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {field.type === "multi" && field.options ? (
        <div className="choice-list" role="group" aria-labelledby={labelId}>
          {field.options.map((opt) => {
            const optId = `${id}-${opt.value}`;
            const selected = Array.isArray(value) ? value.includes(opt.value) : false;
            return (
              <button
                key={opt.value}
                id={optId}
                type="button"
                role="checkbox"
                aria-checked={selected}
                className={`choice-option ${selected ? "is-selected" : ""}`}
                onClick={() => {
                  const current = Array.isArray(value) ? [...value] : [];
                  if (opt.value === "nenhum") {
                    onChange(field.id, selected ? [] : ["nenhum"]);
                    return;
                  }
                  let next = current.filter((v) => v !== "nenhum");
                  if (selected) next = next.filter((v) => v !== opt.value);
                  else next.push(opt.value);
                  onChange(field.id, next);
                }}
              >
                <span className="choice-mark" aria-hidden />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          aria-labelledby={labelId}
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      ) : null}

      {(field.type === "text" || field.type === "phone" || field.type === "number" || field.type === "date") && (
        <input
          id={id}
          aria-labelledby={labelId}
          type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          inputMode={field.type === "phone" ? "tel" : field.type === "number" ? "numeric" : undefined}
          placeholder={field.placeholder}
          value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
