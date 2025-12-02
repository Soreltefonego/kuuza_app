import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kuuza Bank - Votre banque virtuelle",
  description: "Plateforme de gestion bancaire virtuelle pour managers et clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background overflow-x-hidden`}>
        <Providers>
          <div className="gradient-mesh fixed inset-0 -z-10" />
          <div className="min-h-screen overflow-x-hidden max-w-[100vw]">
            {children}
          </div>
          <Toaster
            position="top-right"
            richColors
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}
