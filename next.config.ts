import withPWA from '@ducanh2912/next-pwa';
import type { NextConfig } from "next";

const nextConfig: NextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  }
});

export default nextConfig;
