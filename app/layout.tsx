import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Sidebar from '../components/layout/sidebar';
import { getServerSession } from 'next-auth';
import PageTransition from '@/components/layout/page-transition';
import Script from 'next/script';
import { GA_TRACKING_ID } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains'
});

export const metadata: Metadata = {
  title: 'EDEN - Academic Tools Platform',
  description: 'AI-powered academic tools for researchers and students. Features include MindMap Translator, Focus Soundscapes, Thesis Sculptor, and more.',
  keywords: 'academic tools, research, AI, mindmap, thesis writing, focus tools, study aids',
  authors: [{ name: 'EDEN Team' }],
  metadataBase: new URL('https://eden-academic.vercel.app'),
  openGraph: {
    title: 'EDEN - Academic Tools Platform',
    description: 'AI-powered academic tools for researchers and students',
    type: 'website',
    locale: 'en_US',
    images: ['/images/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDEN - Academic Tools Platform',
    description: 'AI-powered academic tools for researchers and students',
    images: ['/images/logo.png'],
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Analytics */}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-background text-text-primary antialiased`}>
        <Providers session={session}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-[250px] p-4 lg:p-8">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
