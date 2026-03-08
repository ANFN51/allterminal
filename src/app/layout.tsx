import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allterminals — Professional Financial Terminal",
  description: "Allterminals: Next-generation Bloomberg-style financial terminal with real-time market data, AI analyst, heat maps, and crypto integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#050507' }}>
        {children}
      </body>
    </html>
  );
}
