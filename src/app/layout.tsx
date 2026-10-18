import type { Metadata } from "next";
import "./globals.css";
import { WorkNestProvider } from "@/context/WorkNestContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "WorkNest CRM — Coworking Space Management",
  description: "Operations and CRM interface for co-working communities, tours, and bookings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F8F6]">
        <WorkNestProvider>
          <AppShell>{children}</AppShell>
        </WorkNestProvider>
      </body>
    </html>
  );
}
