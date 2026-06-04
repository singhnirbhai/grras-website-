import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Grras Solutions - Unified Academic Portal",
  description: "Unified Quiz Management System and Performance Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
