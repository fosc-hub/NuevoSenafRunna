/** @type {import('next').NextConfig} */
const nextConfig = {typescript: {ignoreBuildErrors: true},  experimental: {
    esmExternals: 'loose', // habilita carga ESM en cliente
  },};

export default nextConfig;
