import { defineConfig } from 'prisma/config'
import fs from 'fs'
import path from 'path'

const dbUrl = process.env.DATABASE_URL || ''
let schemaPath = 'prisma/schema.prisma'

if (dbUrl.startsWith('file:')) {
  try {
    const originalSchemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma')
    const originalSchema = fs.readFileSync(originalSchemaPath, 'utf-8')
    const devSchema = originalSchema.replace(
      /provider\s*=\s*"postgresql"/g,
      'provider = "sqlite"'
    )
    
    const devSchemaPath = path.resolve(process.cwd(), 'prisma/schema.dev.prisma')
    fs.writeFileSync(devSchemaPath, devSchema, 'utf-8')
    schemaPath = 'prisma/schema.dev.prisma'
  } catch (error) {
    console.error('Error generating dev schema:', error)
  }
}

export default defineConfig({
  schema: schemaPath,
  datasource: {
    url: dbUrl,
    // @ts-expect-error directUrl is missing from Prisma v7's Config typings in this release
    directUrl: process.env.DIRECT_URL
  }
})
