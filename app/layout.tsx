import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

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
        <Providers>
          {children}
          <footer className="border-t border-white/10 px-4 py-6 text-xs text-white/60">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>© {new Date().getFullYear()} Cartoon Capital</div>
              <a
                href="https://t.me/CartoonVC"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
              >
                联系电报 Telegram: @CartoonVC
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
