"use client"
import type { Metadata } from 'next'
import './globals.css'
import Footer from "@/components/Footer";
import Script from 'next/script';
import { usePathname } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Arcade Point Calculator',
  description: 'Arcade Point Calculator: Your ultimate companion for tracking Google Cloud Arcade progress, calculating points, and winning prizes. Use our trusted calculator to monitor your achievements and maximize your rewards in the Google Cloud Arcade program.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  // Don't show ads on 404 page
  const showAds = pathname !== '/404';
  return (
    <html lang="en">
      <head>
        <script async custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-adsense-account" content="ca-pub-3136730634801361" />
        {/* SEO Meta Tags */}
        <meta name="description" content="Arcade Point Calculator: Your ultimate companion for tracking Google Cloud Arcade progress, calculating points, and winning prizes. Use our trusted calculator to monitor your achievements and maximize your rewards in the Google Cloud Arcade program." />
        <meta name="keywords" content="arcade, calculator, cloud, google, progress, points, rewards, prizes, tracker" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Arcade Point Calculator | Track Google Cloud Arcade Progress & Win Prizes" />
        <meta property="og:description" content="Arcade Point Calculator: Your ultimate companion for tracking Google Cloud Arcade progress, calculating points, and winning prizes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://arcadeindia.vercel.app/" />
        <meta property="og:image" content="/Champion.png" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Arcade Point Calculator | Track Google Cloud Arcade Progress & Win Prizes" />
        <meta name="twitter:description" content="Arcade Point Calculator: Your ultimate companion for tracking Google Cloud Arcade progress, calculating points, and winning prizes." />
        <meta name="twitter:image" content="/Champion.png" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Arcade Point Calculator",
          "url": "https://arcadeindia.vercel.app/",
          "description": "Arcade Point Calculator: Your ultimate companion for tracking Google Cloud Arcade progress, calculating points, and winning prizes.",
          "publisher": {
            "@type": "Organization",
            "name": "ArcadeINDIA"
          }
        }) }} />
        {/* Google Analytics (replace G-XXXXXXXXXX with your GA4 ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L5GMDD6YTR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L5GMDD6YTR');
          `}
        </Script>
      </head>
      <body>
        {showAds && (
          <>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <ins className="adsbygoogle"
                 style={{ display: "block" }}
                 data-ad-client="ca-pub-3136730634801361"
                 data-ad-slot="5057258625"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <Script id="adsbygoogle-init" strategy="afterInteractive">
              {`(adsbygoogle = window.adsbygoogle || []).push({});`}
            </Script>
          </>
        )}
        {children}
        {/* Footer will be rendered in the main page, not here, to access setCurrentView */}
      </body>
    </html>
  )
}









