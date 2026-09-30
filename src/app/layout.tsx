import type { Metadata } from "next";
import { Reddit_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const body = Reddit_Mono({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-body" });

export const metadata: Metadata = {
  title: "trato — mis ventas",
  description: "Todas tus ventas de casas en un solo lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        {/* Cal Sans isn't bundled with next/font in Next 14 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cal+Sans&display=swap" />
      </head>
      <body className={`${body.variable} font-body bg-crema text-[17px] text-cafe-900 antialiased`}>
        <div className="lg:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-12 lg:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
