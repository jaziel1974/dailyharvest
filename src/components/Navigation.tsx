'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  const isDefaultLocale = locale === 'pt';

  // Always include the locale in the path
  const navLinks = [
    { href: `/${locale}/`, label: 'Home' },
    { href: `/${locale}/harvests`, label: 'Harvests' },
    { href: `/${locale}/reports`, label: 'Reports' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white z-50 shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold">
              Daily Harvest
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label="Open main menu"
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={pathname === href ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}