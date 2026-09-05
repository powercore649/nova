import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import BackgroundProvider from '@/components/BackgroundProvider';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'nova-browser',
  description: 'Your premium gateway to legendary source code.',
  icons: {
    icon: '/icon.png',
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
          <BackgroundProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
