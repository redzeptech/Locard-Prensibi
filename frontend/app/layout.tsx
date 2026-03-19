import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Locard Prensibi — Dijital Adli Bilişim',
  description: 'Her temas iz bırakır. Dijital ayak izi analizi platformu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
