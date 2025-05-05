'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  const isDefaultLocale = locale === 'pt';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: `${isDefaultLocale ? '' : `/${locale}`}/`, label: 'Home', icon: '🏠' },
    { href: `${isDefaultLocale ? '' : `/${locale}`}/harvests`, label: 'Harvests', icon: '🌾' },
    { href: `${isDefaultLocale ? '' : `/${locale}`}/reports`, label: 'Reports', icon: '📊' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg' : 'bg-white dark:bg-gray-800'
      }`}
      role="navigation" 
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              Daily Harvest
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname === href
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
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
          className={`transform transition-transform duration-300 ease-in-out md:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed left-0 right-0 top-16 bg-white dark:bg-gray-800 border-t dark:border-gray-700`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium ${
                  pathname === href
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === href ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                <span role="img" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 md:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}