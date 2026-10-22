import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.signatureuniforms.in'),
  title: {
    default: 'Signature Uniforms by Hari | Premium Uniform Supplier Kerala',
    template: '%s | Signature Uniforms by Hari',
  },
  description:
    'Wholesale uniform manufacturer for schools, colleges, corporate offices, hospitals, and industries. Bulk orders, quality fabrics, institution-wide supply from Kodakara, Thrissur, Kerala.',
  keywords: [
    'school uniforms Kerala',
    'uniform manufacturer Thrissur',
    'bulk uniform supply',
    'wholesale uniforms Kerala',
    'school uniform bulk order',
    'college uniforms Kerala',
    'corporate uniforms Kerala',
    'hospital uniforms Kerala',
    'Signature Uniforms Kodakara',
  ],
  authors: [{ name: 'Signature Uniforms by Hari' }],
  creator: 'Signature Uniforms by Hari',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.signatureuniforms.in',
    siteName: 'Signature Uniforms by Hari',
    title: 'Signature Uniforms by Hari | Premium Uniform Supplier Kerala',
    description:
      'Wholesale uniform manufacturer for schools, colleges, corporate offices, hospitals, and industries in Kerala.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signature Uniforms by Hari',
    description: 'Premium uniform manufacturer and wholesale supplier in Thrissur, Kerala.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {},
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=plein@1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
