import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
  ],
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ladoalado.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lado a Lado | Apuração 2º Turno Presidencial (2026 vs 2022)",
  description: "Acompanhe e compare em tempo real a apuração dos votos do 2º turno presidencial de 2026 com o histórico do 2º turno de 2022 sincronizado a cada 20 segundos.",
  keywords: ["eleições 2026", "2º turno", "segundo turno", "apuração de votos", "tse", "lado a lado", "comparação 2022 e 2026", "tempo real", "jornalismo de dados"],
  authors: [{ name: "Lado a Lado" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lado a Lado | Apuração 2º Turno 2026 vs 2022",
    description: "Comparador em tempo real da apuração do 2º turno de 2026 com o histórico de 2022 sincronizado a cada 20 segundos com dados oficiais do TSE.",
    url: "/",
    siteName: "Lado a Lado",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lado a Lado | Apuração 2º Turno 2026 vs 2022",
    description: "Comparador em tempo real da apuração do 2º turno de 2026 com o histórico de 2022 sincronizado a cada 20 segundos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200 font-sans">
        {children}
      </body>
    </html>
  );
}
