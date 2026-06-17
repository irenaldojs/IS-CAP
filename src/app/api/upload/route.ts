import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Cria diretório de upload se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Limpa o nome do arquivo para evitar problemas com caracteres especiais
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${Date.now()}_${cleanFileName}`
    const filePath = path.join(uploadDir, uniqueFileName)

    // Grava o buffer do arquivo no disco local
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(filePath, buffer)

    const fileUrl = `/uploads/${uniqueFileName}`

    return NextResponse.json({
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('Erro no upload local:', error)
    return NextResponse.json({ error: 'Erro interno ao processar upload' }, { status: 500 })
  }
}
