import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SolanaWalletProvider from "@/components/SolanaWalletProvider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import AppLayout from "@/components/layout/AppLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iRacing Crypto Bets",
  description: "Place cryptocurrency bets on iRacing events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <SolanaWalletProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
