import { notFound } from "next/navigation";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { SfragaOverviewPanel } from "@/components/SfragaOverviewPanel";
import { getPortalSchema } from "@/lib/portal-schemas";
import { requirePortalSchemaAccess } from "@/lib/portal-auth";
import { getSfragaOverview } from "@/lib/portal-sfraga-overview";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ schema: string }>;
};

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

  const session = await requirePortalSchemaAccess(schema.id);

  const overview =
    schema.hasDataPreview && schema.id === "sfragaadv"
      ? await getSfragaOverview()
      : null;

  return (
    <main className="portal">
      <section className="portal-hero portal-hero-center portal-placeholder">
        <p className="portal-eyebrow">Ambiente liberado</p>
        <h1 className="portal-brand portal-brand-sm">{schema.label}</h1>
        <p className="portal-lead">
          Schema <code className="portal-schema-code">{schema.id}</code>
          {" · "}
          usuário <code className="portal-schema-code">{session.login}</code>
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
          <PortalLogoutButton />
        </div>
      </section>
    </main>
  );
}
