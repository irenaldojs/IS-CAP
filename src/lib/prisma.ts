import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || ''
  
  if (dbUrl.startsWith('file:')) {
    // Para SQLite local, utiliza o adaptador de LibSQL passando as configurações diretamente
    const adapter = new PrismaLibSql({ url: dbUrl })
    return new PrismaClient({ adapter })
  }

  // Para PostgreSQL/Supabase em produção
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
