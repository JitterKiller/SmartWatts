"use client";

import "@/css/satoshi.css";
import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader showSpinner={false} />

          <div className="flex min-h-screen">
            {!isOnboarding && <Sidebar />} {/* Conditionnez l'affichage de la sidebar */}

            <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
              <Header />

              <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10 bg-gradient-to-r from-blue-100 to-purple-100">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}