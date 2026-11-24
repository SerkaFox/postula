import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION = "Seguimiento de tus candidaturas de empleo: estados, notas y tu tasa de respuesta en un solo sitio.";

export const metadata: Metadata = {
  metadataBase: new URL("https://postula-candidaturas.vercel.app"),
  title: "Postula",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Postula",
    title: "Postula · Tu búsqueda de empleo, bajo control",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Postula · Tu búsqueda de empleo, bajo control",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
