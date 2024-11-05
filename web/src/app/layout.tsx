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
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Providers>
          <Header />
          <div className="container mx-auto">
            <main className="dark text-foreground bg-background">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
