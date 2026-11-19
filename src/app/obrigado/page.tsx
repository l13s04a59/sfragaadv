import Link from "next/link";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ObrigadoPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id;

  return (
    <main className="thank-shell">
      <header>
        <p className="brand-mark">SFraga Advocacia</p>
        <h1>Recebemos suas respostas</h1>
      </header>
      <div className="thank-panel">
        <p>
          Obrigado por confiar na SFraga Advocacia. Nossa equipe analisará as
          informações e entrará em contato quando houver necessidade de
          complemento ou documentação.
        </p>
        {id ? (
          <p>
            Protocolo interno: <code>{id}</code>
          </p>
        ) : null}
        <div className="thank-actions">
          <Link className="btn btn-primary" href="/">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
