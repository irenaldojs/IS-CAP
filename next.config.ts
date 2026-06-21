import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-libsql', '@libsql/client', '@prisma/adapter-pg', 'pg'],
}

export default nextConfig
