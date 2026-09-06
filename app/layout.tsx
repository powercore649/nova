import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import BackgroundProvider from '@/components/BackgroundProvider';
import ThemeProvider from '@/components/ThemeProvider';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import SplashScreen from '@/components/SplashScreen';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://novacorpbumpify.dpdns.org';

export const metadata: Metadata = {
  title: {
    default: 'nova-browser',
    template: '%s | nova-browser',
  },
  description: 'Your premium gateway to legendary source code. Search, explore and just pure value.',
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/icon.png' },
  openGraph: {
    type: 'website',
    siteName: 'nova-browser',
    title: 'nova-browser',
    description: 'Your premium gateway to legendary source code.',
    url: SITE_URL,
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'nova-browser' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nova-browser',
    description: 'Your premium gateway to legendary source code.',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jetbrainsMono.className}>
        <ThemeProvider>
          <SplashScreen />
          <BackgroundProvider />
          <KeyboardShortcuts />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
