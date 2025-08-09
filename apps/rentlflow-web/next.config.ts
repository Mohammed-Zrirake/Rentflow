import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint:{
    ignoreDuringBuilds: true,
  }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
enabled : process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig);
