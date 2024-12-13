import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/app/providers";

import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Flipside",
  description: "Prediction market launch platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex flex-col container mx-auto mb-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
