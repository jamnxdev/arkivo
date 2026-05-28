import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PwaRegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteUrl } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = getSiteUrl();
const siteName = "Arkivo";
const title = "Arkivo - AI Receipt Tracking & Expense Document Management";
const description =
  "Arkivo uses AI to capture receipts, extract expense details, organize business documents, and turn spending records into searchable insights.";
const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Arkivo receipt tracking and expense analytics dashboard",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "Arkivo",
    "AI receipt tracking",
    "receipt tracking",
    "expense tracking",
    "expense management",
    "document management",
    "receipt scanner",
    "business receipts",
    "bookkeeping automation",
    "spending analytics",
  ],
  authors: [{ name: "Arkivo" }],
  creator: "Arkivo",
  publisher: "Arkivo",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title,
    description,
    url: "/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-sans antialiased ${geist.variable} ${fontMono.variable}`}
    >
      <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
        <body>
          <PwaRegister />
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
