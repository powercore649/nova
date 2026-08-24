import type { Metadata } from 'next';
<<<<<<< HEAD
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'nova-browser ',
  description: 'browser is love',
=======
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'nova-browserdev ',
  description: 'nova-browser is love',
>>>>>>> 29aed2e9981bab3783c1bfffea7c7f06ccce60ec
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body className={outfit.className}>{children}</body>
=======
      <body className={jetbrainsMono.className}>{children}</body>
>>>>>>> 29aed2e9981bab3783c1bfffea7c7f06ccce60ec
    </html>
  );
}
