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

  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      <label htmlFor={id}>
        <span className="field-label">
          {field.label}
          {field.required ? <span className="req" aria-hidden>*</span> : null}
        </span>
      </label>

      {field.type === "choice" && field.options ? (
        <div className="choice-list" role="radiogroup" aria-labelledby={id}>
          {field.options.map((opt) => {
            const optId = `${id}-${opt.value}`;
            return (
              <label key={opt.value} className="choice-option" htmlFor={optId}>
                <input
                  id={optId}
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(field.id, opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : null}

      {field.type === "multi" && field.options ? (
        <div className="choice-list" role="group" aria-labelledby={id}>
          {field.options.map((opt) => {
            const optId = `${id}-${opt.value}`;
            const selected = Array.isArray(value) ? value.includes(opt.value) : false;
            return (
              <label key={opt.value} className="choice-option" htmlFor={optId}>
                <input
                  id={optId}
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
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
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      ) : null}

      {(field.type === "text" || field.type === "phone" || field.type === "number" || field.type === "date") && (
        <input
          id={id}
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
