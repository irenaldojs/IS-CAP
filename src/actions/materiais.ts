'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { createNotification } from './notifications'
import fs from 'fs'
import path from 'path'

export interface MaterialInput {
  subjectId: string
  title: string
  schoolYear: string
  description?: string | null
  type: string // FOTO, SCAN, PDF, DOCUMENTO
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

// 1. Buscar Materiais Didáticos
export async function getMaterials(subjectId?: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.material.findMany({
    where: {
      userId: session.user.id,
      subjectId: subjectId || undefined,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

// 2. Registrar Novo Material
export async function createMaterial(data: MaterialInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const material = await prisma.material.create({
    data: {
      userId: session.user.id,
      subjectId: data.subjectId,
      title: data.title,
      schoolYear: data.schoolYear,
      description: data.description || null,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: Number(data.fileSize),
      mimeType: data.mimeType,
    },
  })

  // Cria notificação de material adicionado
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { name: true },
    })

    await createNotification(
      session.user.id,
      'material',
      'Material atualizado',
      `Novo material "${data.title}" foi adicionado em ${subject?.name || 'Matéria'}.`
    )
  } catch (err) {
    console.error('Erro ao gerar notificação de material:', err)
  }

  revalidatePath('/dashboard/materiais')
  revalidatePath('/dashboard')
  return material
}

// 3. Excluir Material
export async function deleteMaterial(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const material = await prisma.material.findUnique({
    where: { id },
  })

  if (!material) throw new Error('Material não encontrado')

  // Tenta remover o arquivo físico da pasta local para poupar espaço
  try {
    if (material.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', material.fileUrl)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  } catch (err) {
    console.error('Erro ao deletar arquivo físico:', err)
  }

  // Deleta o registro do banco
  const deleted = await prisma.material.delete({
    where: { id },
  })

  revalidatePath('/dashboard/materiais')
  revalidatePath('/dashboard')
  return deleted
}
