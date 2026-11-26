import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPortalSchema,
  PORTAL_SCHEMA_IDS,
} from "@/lib/portal-schemas";

type PageProps = {
  params: Promise<{ schema: string }>;
};

export function generateStaticParams() {
  return PORTAL_SCHEMA_IDS.map((schema) => ({ schema }));
}

export async function generateMetadata({ params }: PageProps) {
  const { schema: id } = await params;
  const schema = getPortalSchema(id);
  if (!schema) {
    return { title: "Schema não encontrado — Portal SFraga" };
  }
  return {
    title: `${schema.label} — Portal SFraga`,
    description: `Ambiente selecionado: schema ${schema.id}`,
  };
}

export default async function PortalSchemaPage({ params }: PageProps) {
  const { schema: id } = await params;
  const schema = getPortalSchema(id);
  if (!schema) notFound();

  return (
    <main className="portal">
      <section className="portal-hero portal-placeholder">
        <p className="portal-eyebrow">Ambiente selecionado</p>
        <h1 className="portal-brand portal-brand-sm">{schema.label}</h1>
        <p className="portal-lead">
          Você escolheu o schema{" "}
          <code className="portal-schema-code">{schema.id}</code>.
        </p>
        <p className="portal-note">
          Página provisória — ainda sem CRUD. Na próxima etapa as operações
          usarão <code>LUSEAN_URL</code> apontando para o banco lusean neste
          schema.
        </p>
        <div className="portal-actions">
          <Link className="btn btn-primary" href="/portal">
            Voltar aos sistemas
          </Link>
          <Link className="btn btn-ghost" href="/">
            Início
          </Link>
        </div>
      </section>
    </main>
  );
}
