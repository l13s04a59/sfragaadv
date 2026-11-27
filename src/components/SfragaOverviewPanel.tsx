import type { SfragaOverview } from "@/lib/portal-sfraga-overview";
import { sfragaOverviewHint } from "@/lib/portal-sfraga-overview";

type Props = {
  overview: SfragaOverview;
};

export function SfragaOverviewPanel({ overview }: Props) {
  return (
    <div className="portal-data">
      <h2 className="portal-data-title">Prévia de dados</h2>
      <p className="portal-data-hint">{sfragaOverviewHint()}</p>

      {!overview.ok && overview.error ? (
        <p className="error-text" role="alert">
          {overview.error}
        </p>
      ) : null}

      <dl className="portal-stats">
        <div>
          <dt>sfragaadv.reclamante</dt>
          <dd>
            {overview.reclamanteCount === null
              ? "—"
              : overview.reclamanteCount}
          </dd>
        </div>
        <div>
          <dt>sfragaadv.pessoa</dt>
          <dd>
            {overview.pessoaCount === null ? "—" : overview.pessoaCount}
          </dd>
        </div>
        <div>
          <dt>public.tbescol</dt>
          <dd>
            {overview.tbescolCount === null ? "—" : overview.tbescolCount}
          </dd>
        </div>
        <div>
          <dt>Modo</dt>
          <dd>
            <code>{overview.mode}</code>
            {overview.source ? (
              <>
                {" "}
                · <code>{overview.source}</code>
              </>
            ) : null}
          </dd>
        </div>
      </dl>

      <h3 className="portal-data-subtitle">Pessoas (vínculo ativo)</h3>
      {overview.pessoas.length === 0 ? (
        <p className="portal-data-hint">
          Nenhuma pessoa com vínculo em <code>sfragaadv.pessoa</code>.
        </p>
      ) : (
        <ul className="portal-table-list" role="list">
          {overview.pessoas.map((p) => (
            <li key={p.cdpes_id}>
              <code>
                #{p.cdpes_id} {p.nome || "(sem nome)"}
                {p.cpf ? ` · CPF ${p.cpf}` : ""}
              </code>
            </li>
          ))}
        </ul>
      )}

      <h3 className="portal-data-subtitle">Tabelas (public + sfragaadv)</h3>
      {overview.tables.length === 0 ? (
        <p className="portal-data-hint">Nenhuma tabela listada.</p>
      ) : (
        <ul className="portal-table-list" role="list">
          {overview.tables.map((t) => (
            <li key={`${t.schema}.${t.name}`}>
              <code>
                {t.schema}.{t.name}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
