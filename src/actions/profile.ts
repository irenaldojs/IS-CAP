'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function getUserProfile() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado.' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        defaultHourlyRate: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { error: 'Usuário não encontrado.' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return { error: 'Erro interno do servidor.' }
  }
}

export async function updateUserProfile(data: { name: string; defaultHourlyRate: number }) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado.' }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        defaultHourlyRate: Number(data.defaultHourlyRate),
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error)
    return { error: 'Erro interno do servidor.' }
  }
}
