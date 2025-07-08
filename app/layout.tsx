import type { Metadata } from 'next'
import './globals.css'
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Arcade Point Calculator',
  description: 'Created with v0'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script async custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">
        </script>
        <meta name="google-adsense-account" content="ca-pub-3136730634801361" />
      </head>
      <body>{children}
        <amp-auto-ads type="adsense"
          data-ad-client="ca-pub-3136730634801361">
        </amp-auto-ads>
        {/* Footer will be rendered in the main page, not here, to access setCurrentView */}
      </body>
    </html>
  )
}
