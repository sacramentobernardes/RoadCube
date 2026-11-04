import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

// Roda antes da primeira pintura; ver lib/theme.ts.
const THEME_SCRIPT = `try{var t=localStorage.getItem("roadcube-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
  title: "RoadCube — Aprenda a resolver o Cubo Mágico",
  description:
    "Trilha gamificada para aprender o Cubo Mágico: do método básico ao CFOP completo, com cubo 3D, treino de algoritmos e repetição espaçada.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e10" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${geist.variable} ${plexMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
