import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildersConnect — Ghana's Trusted Home Services Marketplace",
    template: "%s | BuildersConnect",
  },
  description:
    "Find verified tradespeople across Ghana. Plumbers, electricians, carpenters, builders and more. Post a job for free and get quotes from trusted professionals.",
  keywords: [
    "Ghana tradespeople",
    "home services Ghana",
    "builders Ghana",
    "plumbers Accra",
    "electricians Ghana",
    "hire tradesperson Ghana",
    "BuildersConnect",
  ],
  authors: [{ name: "BuildersConnect" }],
  creator: "BuildersConnect",
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://buildersconnect.gh",
    siteName: "BuildersConnect",
    title: "BuildersConnect — Ghana's Trusted Home Services Marketplace",
    description:
      "Find verified tradespeople across Ghana. Post a job for free and get quotes from trusted professionals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildersConnect — Ghana's Trusted Home Services Marketplace",
    description:
      "Find verified tradespeople across Ghana. Post a job for free and get quotes from trusted professionals.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1db954",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
