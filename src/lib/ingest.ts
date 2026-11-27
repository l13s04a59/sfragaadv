import { applyOptionalIndexes, databaseMode, sql } from "./db";
import {
  INSERT_COLUMNS,
  mapAnswersToReclamante,
  rowToParams,
  type ReclamanteRow,
} from "./map-to-reclamante";
import type { Answers, FormSource } from "./form-types";
import { upsertCdpesAndLink } from "./pessoa";

let indexesAttempted = false;

export async function insertReclamante(
  answers: Answers,
  source: FormSource,
  earlyExit = false,
): Promise<{
  id: string;
  mode: "postgres" | "pglite";
  row: ReclamanteRow;
  cdpesId: number | null;
}> {
  if (!answers || typeof answers !== "object") {
    throw new Error("Payload inválido");
  }
  if (source !== "trabalhista" && source !== "gestante") {
    throw new Error("form_source inválido");
  }
  if (answers.consentimento_lgpd !== "sim" && answers.consentimento_lgpd !== true) {
    throw new Error("Consentimento LGPD é obrigatório para enviar");
  }

  const row = mapAnswersToReclamante(answers, source, earlyExit);
  const placeholders = INSERT_COLUMNS.map((_, i) => `$${i + 1}`).join(", ");
  const query = `
    INSERT INTO sfragaadv.reclamante (${INSERT_COLUMNS.join(", ")})
    VALUES (${placeholders})
    RETURNING id
  `;

  const mode = databaseMode();
  if (mode === "postgres" && !indexesAttempted) {
    indexesAttempted = true;
    try {
      await applyOptionalIndexes();
    } catch {
      // Indexes are optional; never block ingest.
    }
  }

  const result = await sql<{ id: string }>(query, rowToParams(row));
  const id = result[0]?.id;
  if (!id) throw new Error("Insert não retornou id");

  // Shared person + Sfraga-only link (upsert by CPF when present).
  let cdpesId: number | null = null;
  try {
    const cpf =
      typeof answers.cpf === "string"
        ? answers.cpf
        : typeof answers.CPF === "string"
          ? answers.CPF
          : null;
    const linked = await upsertCdpesAndLink(
      "sfragaadv",
      {
        cpf,
        nome: row.nome_completo,
        celular: row.telefone,
      },
      `intake:${source}`,
    );
    cdpesId = linked.cdpesId;
  } catch (error) {
    // Intake already persisted; surface link failure without rolling back reclamante.
    console.error("[ingest] cdpes/pessoa link failed", error);
  }

  return { id, mode, row, cdpesId };
}
