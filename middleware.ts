import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
 
// Create the next-intl middleware
const handleI18nRouting = createMiddleware({
  locales: ['en', 'es', 'pt'],
  defaultLocale: 'pt'
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect / to /pt
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/pt', request.url));
  }
  
  // Handle i18n routing for all other paths
  return handleI18nRouting(request);
}
 
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};