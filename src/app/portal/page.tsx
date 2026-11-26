import Link from "next/link";
import { PORTAL_SCHEMAS } from "@/lib/portal-schemas";

export const metadata = {
  title: "Portal de manutenção — SFraga",
  description: "Selecione o sistema / schema PostgreSQL para manutenção.",
};

export default function PortalPage() {
  return (
    <main className="portal">
      <section className="portal-hero">
        <p className="portal-eyebrow">Manutenção</p>
        <h1 className="portal-brand">SFraga</h1>
        <p className="portal-lead">
          Escolha o sistema (schema PostgreSQL) para continuar. Nesta etapa o
          portal só registra a escolha — operações CRUD virão depois.
        </p>

        <ul className="portal-grid" role="list">
          {PORTAL_SCHEMAS.map((schema) => (
            <li key={schema.id}>
              <Link
                className="portal-card"
                href={`/portal/${schema.id}`}
                aria-label={`${schema.label}: schema ${schema.id}`}
              >
                <span className="portal-card-label">{schema.label}</span>
                <span className="portal-card-meta">
                  schema <code>{schema.id}</code>
                </span>
                <span className="portal-card-hint">{schema.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="portal-foot">
          Conexão futura via <code>LUSEAN_URL</code> (mesmo banco lusean). Nesta
          MVP não há consulta ao banco.
        </p>
      </section>
    </main>
  );
}
