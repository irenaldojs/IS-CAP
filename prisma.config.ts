import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-expect-error directUrl is missing from Prisma v7's Config typings in this release
    directUrl: process.env.DIRECT_URL
  }
})
