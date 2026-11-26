import Link from "next/link";
import { PORTAL_SCHEMAS } from "@/lib/portal-schemas";

export const metadata = {
  title: "LUSEAN SISTEMAS",
  description: "Selecione o sistema / schema PostgreSQL.",
};

export default function PortalPage() {
  return (
    <main className="portal">
      <section className="portal-hero portal-hero-center">
        <h1 className="portal-brand">LUSEAN SISTEMAS</h1>
        <p className="portal-lead">
          Escolha o sistema para continuar. Cada botão seleciona o schema
          PostgreSQL correspondente no banco lusean.
        </p>

        <ul className="portal-grid portal-grid-center" role="list">
          {PORTAL_SCHEMAS.map((schema) => (
            <li key={schema.id}>
              <Link
                className="portal-btn"
                href={`/portal/${schema.id}`}
                aria-label={`${schema.label}: schema ${schema.id}`}
              >
                <span className="portal-btn-label">{schema.label}</span>
                <span className="portal-btn-meta">
                  schema <code>{schema.id}</code>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="portal-foot">
          Conexão via <code>LUSEAN_URL</code>. Prévia de dados disponível só em
          SFRAGA ADVOCACIA nesta etapa.
        </p>
      </section>
    </main>
  );
}
