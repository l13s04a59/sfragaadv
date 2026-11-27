import { redirect } from "next/navigation";
import { PortalLoginForm } from "@/components/PortalLoginForm";
import { getPortalSession } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LUSEAN SISTEMAS — Entrar",
  description: "Login do portal LUSEAN SISTEMAS.",
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function PortalPage({ searchParams }: PageProps) {
  const session = await getPortalSession();
  if (session) {
    redirect(`/portal/${session.schema}`);
  }

  const params = await searchParams;
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/portal/")
      ? params.next
      : null;

  return (
    <main className="portal">
      <section className="portal-hero portal-hero-center">
        <h1 className="portal-brand">LUSEAN SISTEMAS</h1>
        <p className="portal-lead">
          Entre com seu login. Após autenticar, o portal abre somente o sistema
          liberado para a sua conta (um schema por sessão).
        </p>

        <PortalLoginForm nextPath={nextPath} />

        <p className="portal-foot">
          Conexão via <code>LUSEAN_URL</code>. Sem seletor aberto dos três
          sistemas — o schema vem de <code>schema_permitido</code>.
        </p>
      </section>
    </main>
  );
}
