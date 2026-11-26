import Link from "next/link";
import { notFound } from "next/navigation";
import { SfragaOverviewPanel } from "@/components/SfragaOverviewPanel";
import {
  getPortalSchema,
  PORTAL_SCHEMA_IDS,
} from "@/lib/portal-schemas";
import { getSfragaOverview } from "@/lib/portal-sfraga-overview";

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
    return { title: "Sistema não encontrado — LUSEAN SISTEMAS" };
  }
  return {
    title: `${schema.label} — LUSEAN SISTEMAS`,
    description: `Ambiente selecionado: schema ${schema.id}`,
  };
}

export default async function PortalSchemaPage({ params }: PageProps) {
  const { schema: id } = await params;
  const schema = getPortalSchema(id);
  if (!schema) notFound();

  const overview =
    schema.hasDataPreview && schema.id === "sfragaadv"
      ? await getSfragaOverview()
      : null;

  return (
    <main className="portal">
      <section className="portal-hero portal-hero-center portal-placeholder">
        <p className="portal-eyebrow">Ambiente selecionado</p>
        <h1 className="portal-brand portal-brand-sm">{schema.label}</h1>
        <p className="portal-lead">
          Schema <code className="portal-schema-code">{schema.id}</code>
        </p>

        {overview ? (
          <SfragaOverviewPanel overview={overview} />
        ) : (
          <p className="portal-note">
            Página provisória — ainda sem CRUD neste sistema. A prévia de dados
            está disponível apenas em SFRAGA ADVOCACIA.
          </p>
        )}

        <div className="portal-actions portal-actions-center">
          <Link className="btn btn-primary" href="/portal">
            Voltar aos sistemas
          </Link>
        </div>
      </section>
    </main>
  );
}
