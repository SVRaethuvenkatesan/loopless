// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Loopless - Break Free From Nicotine",
  description:
    "Science-backed tools to help you quit smoking and break the habit loop.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#fef9f0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
