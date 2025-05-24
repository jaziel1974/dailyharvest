import type { Metadata } from 'next';
import '../globals.css';
import { Providers } from '@/components/Providers';
import { TranslationsProvider } from '@/components/TranslationsProvider';
import Navigation from '@/components/Navigation';

// Import all translation files
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import pt from '@/translations/pt.json';

const translations = { en, es, pt };

export const metadata: Metadata = {
  title: 'Daily Harvest Tracker',
  description: 'Track your daily harvest amounts and generate reports',
  viewport: 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover',
  themeColor: '#0ea5e9',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/icons/icon-192x192.png' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daily Harvest'
  },
  formatDetection: {
    telephone: true
  },
  openGraph: {
    type: 'website',
    title: 'Daily Harvest Tracker',
    description: 'Track your daily harvest amounts and generate reports',
    siteName: 'Daily Harvest'
  }
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const paramsToUse = await params;
  const locale = paramsToUse?.locale || 'pt';

  return (
    <html lang={locale}>
      <head>
        <meta name="application-name" content="Daily Harvest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Daily Harvest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body className="bg-background-light dark:bg-background-dark">
        <TranslationsProvider messages={translations[locale as keyof typeof translations]} locale={locale}>
          <Providers>
            <Navigation />
            <div className="pt-16">
              {children}
            </div>
          </Providers>
        </TranslationsProvider>
      </body>
    </html>
  );
}
