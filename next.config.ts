import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  allowedDevOrigins: ['192.168.29.103', 'localhost', '127.0.0.1'],
}

export default nextConfig
