import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aleem Voice Agent | Aleem EHR",
  description: "AI Hospital Voice Agent & EHR Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
