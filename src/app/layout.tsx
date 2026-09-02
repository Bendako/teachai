import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "./AppProviders";
import ConvexClientProvider from './ConvexClientProvider'
import Header from '@/components/layout/header'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "teachai",
  description: "A modern web application built with Next.js, powered by teachai",
  keywords: ["Next.js", "React", "TypeScript", "Convex", "Clerk", "teachai"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppProviders publishableKey={clerkPublishableKey}>
          <ConvexClientProvider>
            <Header />
            {children}
          </ConvexClientProvider>
        </AppProviders>
      </body>
    </html>
  );
}
