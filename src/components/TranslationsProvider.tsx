'use client';

import { NextIntlClientProvider } from 'next-intl';

type Props = {
  messages: any;
  locale: string;
  children: React.ReactNode;
};

export function TranslationsProvider({ messages, locale, children }: Props) {
  return (
    <NextIntlClientProvider 
      messages={messages} 
      locale={locale}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}