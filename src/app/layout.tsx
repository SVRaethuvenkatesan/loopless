// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export const metadata: Metadata = {
  title: "Loopless - Break Free From Nicotine",
  description:
    "Science-backed tools to help you quit smoking and break the habit loop.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#060606",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
          <ServiceWorkerRegistration />
          <PwaInstallPrompt />
          <GlobalLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
