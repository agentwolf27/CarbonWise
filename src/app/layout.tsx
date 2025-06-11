import type { Metadata } from "next";
import SessionWrapper from "@/components/SessionWrapper"
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CarbonWise - AI-Driven Carbon Footprint Tracking",
    template: "%s | CarbonWise"
  },
  description: "Track your digital carbon footprint in real time with AI-powered insights and personalized recommendations for a sustainable future.",
  keywords: ["carbon footprint", "sustainability", "environment", "AI", "green tech", "carbon tracking"],
  authors: [{ name: "CarbonWise Team" }],
  creator: "CarbonWise",
  publisher: "CarbonWise",
  metadataBase: new URL("https://carbonwise.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://carbonwise.com",
    siteName: "CarbonWise",
    title: "CarbonWise - AI-Driven Carbon Footprint Tracking",
    description: "Track your digital carbon footprint in real time with AI-powered insights and personalized recommendations for a sustainable future.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CarbonWise - Track Your Carbon Footprint",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CarbonWise - AI-Driven Carbon Footprint Tracking",
    description: "Track your digital carbon footprint in real time with AI-powered insights and personalized recommendations for a sustainable future.",
    images: ["/og-image.png"],
    creator: "@carbonwise",
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#171f14" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-carbon-dark text-white antialiased">
        <SessionWrapper>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}
