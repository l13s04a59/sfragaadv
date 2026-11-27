import { sql } from "./db";
import { PORTAL_SCHEMA_IDS, type PortalSchemaId } from "./portal-schemas";

export type CdpesInput = {
  cpf?: string | null;
  nome?: string | null;
  celular?: string | null;
  email?: string | null;
};

export type LinkedPessoa = {
  cdpes_id: number;
  cpf: string | null;
  nome: string | null;
  celular: string | null;
  email: string | null;
};

function digitsOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = String(value).replace(/\D/g, "");
  return d === "" ? null : d;
}

function trunc(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function assertSchema(schema: string): asserts schema is PortalSchemaId {
  if (!(PORTAL_SCHEMA_IDS as readonly string[]).includes(schema)) {
    throw new Error(`schema inválido: ${schema}`);
  }
}

/**
 * Upsert public.cdpes by CPF when present; otherwise insert a new row.
 * Then ensure an active link row in `{schema}.pessoa`.
 */
export async function upsertCdpesAndLink(
  schema: string,
  input: CdpesInput,
  createdBy?: string | null,
): Promise<{ cdpesId: number; linked: boolean }> {
  assertSchema(schema);

  const cpfRaw = digitsOnly(input.cpf);
  const cpf = cpfRaw && cpfRaw.length === 11 ? cpfRaw : null;
  const nome = trunc(input.nome, 40);
  const celular = trunc(input.celular, 20);
  const email = trunc(input.email, 40);
  const by = trunc(createdBy, 80);

  let cdpesId: number | undefined;

  if (cpf) {
    const existing = await sql<{ id: number }>(
      `select id from public.cdpes
       where cpf = $1 and is_deleted = 'f'
       limit 1`,
      [cpf],
    );
    if (existing[0]?.id) {
      cdpesId = existing[0].id;
      await sql(
        `update public.cdpes set
           nome = coalesce($2, nome),
           celular = coalesce($3, celular),
           email = coalesce($4, email)
         where id = $1`,
        [cdpesId, nome, celular, email],
      );
    }
  }

  if (cdpesId === undefined) {
    const inserted = await sql<{ id: number }>(
      `insert into public.cdpes (cpf, nome, celular, email)
       values ($1, $2, $3, $4)
       returning id`,
      [cpf, nome, celular, email],
    );
    cdpesId = inserted[0]?.id;
  }

  if (!cdpesId) {
    throw new Error("Falha ao gravar public.cdpes");
  }

  const linkTable = `${schema}.pessoa`;
  const existingLink = await sql<{ cdpes_id: number; is_deleted: string }>(
    `select cdpes_id, is_deleted from ${linkTable} where cdpes_id = $1`,
    [cdpesId],
  );

  let linked = false;
  if (!existingLink[0]) {
    await sql(
      `insert into ${linkTable} (cdpes_id, created_by, is_deleted)
       values ($1, $2, 'f')`,
      [cdpesId, by],
    );
    linked = true;
  } else if (existingLink[0].is_deleted === "t") {
    await sql(
      `update ${linkTable}
       set is_deleted = 'f', created_by = coalesce($2, created_by)
       where cdpes_id = $1`,
      [cdpesId, by],
    );
    linked = true;
  }

  return { cdpesId, linked };
}

/** People visible to a schema: active local link + active cdpes. */
export async function listLinkedPessoas(
  schema: string,
  limit = 50,
): Promise<LinkedPessoa[]> {
  assertSchema(schema);
  const linkTable = `${schema}.pessoa`;
  return sql<LinkedPessoa>(
    `select c.id as cdpes_id, c.cpf, c.nome, c.celular, c.email
     from ${linkTable} p
     join public.cdpes c on c.id = p.cdpes_id
     where p.is_deleted = 'f' and c.is_deleted = 'f'
     order by c.nome nulls last, c.id
     limit $1`,
    [Math.min(Math.max(limit, 1), 200)],
  );
}

export async function countLinkedPessoas(schema: string): Promise<number | null> {
  assertSchema(schema);
  try {
    const rows = await sql<{ count: string | number }>(
      `select count(*)::int as count
       from ${schema}.pessoa p
       join public.cdpes c on c.id = p.cdpes_id
       where p.is_deleted = 'f' and c.is_deleted = 'f'`,
    );
    return Number(rows[0]?.count ?? 0);
  } catch {
    return null;
  }
}
