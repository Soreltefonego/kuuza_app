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
    <html lang="fr" className="dark">
      <body className={`${inter.className} antialiased bg-background`}>
        <Providers>
          <div className="gradient-mesh fixed inset-0 -z-10" />
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="dark"
          />
        </Providers>
      </body>
    </html>
  );
}
