import withPWA from 'next-pwa';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA configuration
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  })({})
}

export default nextConfig;
