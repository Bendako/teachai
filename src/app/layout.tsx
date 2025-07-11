import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
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
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ConvexClientProvider>
          <Header />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
