import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const loraSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Lado a Lado — Apuração Presidencial Comparada (2022 vs 2026)",
  description: "Acompanhe e compare em tempo real, minuto a minuto, a apuração dos votos da eleição presidencial brasileira de 2026 com o histórico oficial de 2022.",
  keywords: ["eleições 2026", "apuração de votos", "tse", "lado a lado", "comparação 2022 e 2026", "resultado eleições"],
  authors: [{ name: "Lado a Lado - Jornalismo de Dados" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${loraSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
