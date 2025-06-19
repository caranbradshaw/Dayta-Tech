/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib', 'xlsx'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }
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
    domains: ['placeholder.svg'],
  },
  // Ensure proper static export
  trailingSlash: false,
  // Fix for deployment
  output: 'standalone',
};

export default nextConfig;
