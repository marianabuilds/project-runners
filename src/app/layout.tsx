import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const nunitoSans = Nunito_Sans({ subsets: ["latin"], display: "swap", variable: "--font-fallback" });

export const metadata: Metadata = {
  title: "trato — gestor de negocios",
  description: "Mantén a compradores y agentes alineados en cada negocio inmobiliario.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={nunitoSans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('trato-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <StoreProvider>
          <div className="lg:flex">
            <Sidebar />
            <main className="min-w-0 flex-1 px-4 pb-6 sm:px-6 lg:px-10 lg:pb-8">
              <Topbar />
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
