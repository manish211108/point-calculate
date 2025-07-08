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
        <meta name="google-adsense-account" content="ca-pub-3136730634801361" />
      </head>
      <body>{children}
        {/* Footer will be rendered in the main page, not here, to access setCurrentView */}
      </body>
    </html>
  )
}
