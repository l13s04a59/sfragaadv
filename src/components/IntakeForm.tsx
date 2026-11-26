"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormFieldControl } from "./FormFields";
import { getFormDefinition } from "@/lib/form-definitions";
import type { Answers, FormField, FormSource } from "@/lib/form-types";
import { isNao } from "@/lib/options";

type Props = {
  source: FormSource;
};

function visibleFields(fields: FormField[], answers: Answers): FormField[] {
  return fields.filter((f) => (f.showWhen ? f.showWhen(answers) : true));
}

function validatePage(fields: FormField[], answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.type === "info" || !field.required) continue;
    const value = answers[field.id];
    if (field.type === "multi") {
      if (!Array.isArray(value) || value.length === 0) {
        errors[field.id] = "Selecione ao menos uma opção";
      }
      continue;
    }
    if (value === undefined || value === null || String(value).trim() === "") {
      errors[field.id] = "Campo obrigatório";
    }
  }
  return errors;
}

export function IntakeForm({ source }: Props) {
  const definition = useMemo(() => getFormDefinition(source), [source]);
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [blocked, setBlocked] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Sync lock: useTransition pending drops before fetch finishes, so double-clicks raced. */
  const submitLock = useRef(false);

  const page = definition.pages[pageIndex];
  const fields = useMemo(() => visibleFields(page.fields, answers), [page, answers]);

  const progress = Math.round(((pageIndex + 1) / definition.pages.length) * 100);

  function update(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function submit(earlyExit: boolean) {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/reclamante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_source: definition.source,
          answers,
          early_exit: earlyExit,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; id?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Falha ao enviar");
      }
      router.push(`/obrigado?id=${encodeURIComponent(data.id || "")}`);
    } catch (err) {
      submitLock.current = false;
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : "Falha ao enviar");
    }
  }

  function goNext() {
    if (submitLock.current || submitting) return;

    const pageErrors = validatePage(fields, answers);
    if (Object.keys(pageErrors).length) {
      setErrors(pageErrors);
      return;
    }

    if (page.id === "consentimento" && isNao(answers.consentimento_lgpd)) {
      setBlocked(
        page.earlyExitMessage ||
          "Sem o consentimento não podemos analisar o caso.",
      );
      return;
    }

    if (page.earlyExitWhen?.(answers)) {
      void submit(true);
      return;
    }

    if (pageIndex >= definition.pages.length - 1) {
      void submit(false);
      return;
    }

    setPageIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (submitLock.current || submitting) return;
    setBlocked(null);
    setSubmitError(null);
    setPageIndex((i) => Math.max(0, i - 1));
  }

  if (blocked) {
    return (
      <div className="form-shell">
        <header className="form-brand">
          <p className="brand-mark">SFraga Advocacia</p>
          <h1>{definition.title}</h1>
        </header>
        <div className="blocked-panel">
          <h2>Não foi possível continuar</h2>
          <p>{blocked}</p>
          <button type="button" className="btn btn-secondary" onClick={goBack}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-shell">
      <header className="form-brand">
        <p className="brand-mark">SFraga Advocacia</p>
        <h1>{definition.title}</h1>
        <p className="form-sub">{definition.subtitle}</p>
        <div className="progress" aria-hidden>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-label">
          Etapa {pageIndex + 1} de {definition.pages.length}
        </p>
      </header>

      <form
        className="form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
      >
        <div className="page-head">
          <h2>{page.title}</h2>
          {page.description ? <p>{page.description}</p> : null}
        </div>

        <div className="fields">
          {fields.map((field) => (
            <FormFieldControl
              key={field.id}
              field={field}
              value={answers[field.id]}
              onChange={update}
              error={errors[field.id]}
            />
          ))}
        </div>

        {submitError ? <p className="error-text submit-error">{submitError}</p> : null}

        <div className="form-actions">
          {pageIndex > 0 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
              disabled={submitting}
            >
              Voltar
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? "Enviando…"
              : pageIndex >= definition.pages.length - 1 || page.earlyExitWhen?.(answers)
                ? "Enviar"
                : "Próximo"}
          </button>
        </div>
      </form>
    </div>
  );
}
