/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  outputFileTracingRoot: '/root/prod-dev.timewave.org.uk',
}

export default nextConfig
