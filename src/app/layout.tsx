import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "trato — mis ventas",
  description: "Mantén a compradores y agentes alineados en cada venta o alquiler.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="lg:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
