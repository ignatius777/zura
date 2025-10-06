import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    // 🚫 Don’t block production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚫 Don’t block production build on TS errors
    ignoreBuildErrors: true,
  },

  images: {
    domains: ["gpower.africa"], // ✅ allow images from your domain
  },
};

export default nextConfig;
