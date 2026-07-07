'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

    revalidatePath('/dashboard/financeiro')
    revalidatePath('/dashboard/agenda')

    return { success: true, user }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error)
    return { error: 'Erro interno do servidor.' }
  }
}

export async function updateDefaultHourlyRate(rate: number) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado.' }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        defaultHourlyRate: Number(rate),
      },
    })

    revalidatePath('/dashboard/financeiro')
    revalidatePath('/dashboard/agenda')

    return { success: true, defaultHourlyRate: user.defaultHourlyRate }
  } catch (error) {
    console.error('Erro ao atualizar valor hora base:', error)
    return { error: 'Erro interno do servidor.' }
  }
}

