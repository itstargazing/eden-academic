import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono, Unbounded } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Sidebar, { SidebarProvider } from '../components/layout/sidebar';
import { getServerSession } from 'next-auth';
import PageTransition from '@/components/layout/page-transition';
import Script from 'next/script';
import { GA_TRACKING_ID } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains'
});
const unbounded = Unbounded({ 
  subsets: ['latin'],
  variable: '--font-unbounded'
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
      <body className={`${inter.className} ${jetbrainsMono.variable} ${unbounded.variable} antialiased`}>
        <Providers session={session}>
          <SidebarProvider>
            <div className="min-h-screen">
              <Sidebar />
              <main className="transition-all duration-300 p-8" style={{ marginLeft: 'var(--sidebar-width, 250px)' }}>
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
          </SidebarProvider>
        </Providers>
        
        {/* Google Analytics */}
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
      </body>
    </html>
  );
}
