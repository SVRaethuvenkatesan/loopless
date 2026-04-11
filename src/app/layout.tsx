import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Loopless — Break the cycle. Keep your calm.",
  description:
    "Youth nicotine and stress intervention app for Australians aged 18–24",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
