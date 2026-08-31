import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}`
  : "https://preview-md.vercel.app");

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Markdown Studio | Edit, Format & Interactive Live Preview",
    template: "%s | Markdown Studio",
  },
  description:
    "A modern, bidirectional Markdown editor and interactive live preview environment with synchronized scrolling, file attachments, GFM tables, interactive checklists, and shadcn/ui.",
  applicationName: "Markdown Studio",
  authors: [{ name: "Markdown Studio Team" }],
  generator: "Next.js",
  keywords: [
    "Markdown Editor",
    "Live Preview Markdown",
    "WYSIWYG Markdown",
    "Next.js Markdown",
    "GFM Tables",
    "Interactive Checklists",
    "Synchronized Scrolling",
    "shadcn UI",
    "TailwindCSS v4",
    "Web Markdown Studio",
  ],
  creator: "Markdown Studio",
  publisher: "Markdown Studio",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Markdown Studio",
    title: "Markdown Studio | Bidirectional Markdown Editor & Live Interactive Preview",
    description:
      "Format in plaintext or click directly inside the live rendered preview to edit. Features synchronized scrolling, file drag-and-drop, GFM tables, and shadcn/ui.",
    images: [
      {
        url: "/og-image.png",
        secureUrl: "/og-image.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "Markdown Studio - Bidirectional Markdown Editor & Live Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Studio | Bidirectional Markdown Editor & Live Preview",
    description: "Edit Markdown in plaintext or directly in the visual preview with instant bidirectional sync and synchronized scrolling.",
    images: ["/og-image.png"],
    creator: "@markdownstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Markdown Studio",
  url: siteUrl,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "A modern, bidirectional Markdown editor and interactive live preview environment with synchronized scrolling, file attachments, and shadcn/ui.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Bidirectional live Markdown and WYSIWYG editing",
    "Synchronized scrolling across editor and preview",
    "GFM table and interactive checklist editing",
    "Local file drag-and-drop and attachment modal",
    "Export as Markdown or standalone HTML",
    "Light and Dark mode support with shadcn/ui",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "dark", "theme-cps", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
