/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    esmExternals: 'loose', // habilita carga ESM en cliente
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  webpack: (config) => {
    // Fix for pdfjs-dist canvas dependency
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
