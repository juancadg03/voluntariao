import Link from "next/link";
import "./globals.css";
export const metadata = { title: "Voluntariao · Iniciativas en Colombia" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>
        <header>
          <Link href="/" className="marca">
            Voluntariao
          </Link>
          <nav>
            <Link href="/iniciativas">Explorar iniciativas →</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>Voluntariao · Demostración con iniciativas ficticias</footer>
      </body>
    </html>
  );
}
