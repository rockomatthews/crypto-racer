import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't run ESLint during build for production
    ignoreDuringBuilds: true
  },
  typescript: {
    // Don't run TypeScript type checking during build for production
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets'
  ]
};

export default nextConfig;
