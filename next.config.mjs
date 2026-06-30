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
  // Reverse proxy para PostHog (evita bloqueo por adblockers).
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/flags',
        destination: 'https://us.i.posthog.com/flags',
      },
    ];
  },
  // Necesario para que el reverse proxy de PostHog reciba las trailing slashes correctas.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
