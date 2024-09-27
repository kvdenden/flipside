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
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
