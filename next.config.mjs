/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib', 'xlsx'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Force rebuild
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
