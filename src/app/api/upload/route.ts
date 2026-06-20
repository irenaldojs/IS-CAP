import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      console.warn('[Upload API] Acesso não autorizado: nenhuma sessão válida ou ID de usuário encontrado.')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      console.warn('[Upload API] Nenhum arquivo foi enviado na requisição.')
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Cria diretório de upload se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      if (!fs.existsSync(uploadDir)) {
        console.log(`[Upload API] Diretório de uploads não existe. Criando em: ${uploadDir}`)
        fs.mkdirSync(uploadDir, { recursive: true })
      }
    } catch (fsError) {
      console.error('[Upload API] Falha crítica ao criar o diretório de upload:', fsError)
      return NextResponse.json({ 
        error: 'Erro interno ao criar diretório de destino',
        details: fsError instanceof Error ? fsError.message : String(fsError)
      }, { status: 500 })
    }

    // Limpa o nome do arquivo para evitar problemas com caracteres especiais
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${Date.now()}_${cleanFileName}`
    const filePath = path.join(uploadDir, uniqueFileName)

    // Grava o buffer do arquivo no disco local
    let buffer: Buffer
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
    } catch (bufError) {
      console.error('[Upload API] Falha ao ler buffer do arquivo:', bufError)
      return NextResponse.json({ 
        error: 'Falha ao ler dados do arquivo',
        details: bufError instanceof Error ? bufError.message : String(bufError)
      }, { status: 500 })
    }

    try {
      console.log(`[Upload API] Gravando arquivo de ${file.size} bytes em: ${filePath}`)
      fs.writeFileSync(filePath, buffer)
    } catch (writeError) {
      console.error(`[Upload API] Falha ao gravar arquivo no disco (${filePath}):`, writeError)
      return NextResponse.json({ 
        error: 'Falha ao salvar arquivo no servidor',
        details: writeError instanceof Error ? writeError.message : String(writeError)
      }, { status: 500 })
    }

    const fileUrl = `/uploads/${uniqueFileName}`
    console.log(`[Upload API] Upload realizado com sucesso por usuário ${session.user.id}. URL: ${fileUrl}`)

    return NextResponse.json({
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('[Upload API] Erro interno inesperado no endpoint de upload:', error)
    return NextResponse.json({ 
      error: 'Erro interno ao processar upload',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
