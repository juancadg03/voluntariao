import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <Link href="/" className="marca">Voluntariao</Link>
        <nav>
          <Link href="/iniciativas">Explorar iniciativas →</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>Voluntariao · Demostración con iniciativas ficticias</footer>
    </>
  );
}
