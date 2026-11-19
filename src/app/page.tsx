import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home">
      <section className="home-hero">
        <h1 className="brand-hero">SFraga Advocacia</h1>
        <p className="home-lead">
          Formulários de triagem trabalhista — escolha o questionário adequado
          para iniciar a análise preliminar do caso.
        </p>
        <div className="home-links">
          <Link className="btn btn-primary" href="/formulario/trabalhista">
            Direito Trabalhista
          </Link>
          <Link className="btn btn-ghost" href="/formulario/gestante">
            Direito da Gestante
          </Link>
        </div>
      </section>
    </main>
  );
}
