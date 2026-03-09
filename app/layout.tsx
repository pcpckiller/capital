import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Cartoon Capital — Where Logic Meets Alpha',
  description:
    'Cartoon Capital leverages proprietary ML models and high-frequency execution to deliver market-neutral returns.',
  metadataBase: new URL('https://cartoon.capital'),
  openGraph: {
    title: 'Cartoon Capital',
    description: 'Where Logic Meets Alpha.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-dvh bg-bg text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
