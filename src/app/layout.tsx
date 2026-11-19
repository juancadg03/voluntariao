import "./globals.css";

export const metadata = { title: "Cálida · Iniciativas en Colombia" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
