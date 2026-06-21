'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface NotificationDto {
  id: string
  title: string
  description: string
  time: string
  type: 'info' | 'calendar' | 'finance' | 'material'
  read: boolean
}

// Obter as últimas 50 notificações do usuário logado
export async function getNotifications(): Promise<NotificationDto[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.message,
      time: formatDistanceToNow(new Date(n.createdAt), {
        addSuffix: true,
        locale: ptBR,
      }),
      type: n.type as 'info' | 'calendar' | 'finance' | 'material',
      read: n.isRead,
    }))
  } catch (error) {
    console.error('[Server Action] Erro ao obter notificações:', error)
    return []
  }
}

// Marcar uma notificação específica como lida
export async function markNotificationAsRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  try {
    await prisma.notification.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isRead: true,
      },
    })
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('[Server Action] Erro ao marcar notificação como lida:', error)
    throw new Error('Erro ao atualizar notificação')
  }
}

// Marcar todas as notificações do usuário como lidas
export async function markAllNotificationsAsRead() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('[Server Action] Erro ao marcar todas as notificações como lidas:', error)
    throw new Error('Erro ao atualizar notificações')
  }
}

// Excluir uma notificação específica
export async function deleteNotification(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  try {
    await prisma.notification.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('[Server Action] Erro ao excluir notificação:', error)
    throw new Error('Erro ao excluir notificação')
  }
}

// Função utilitária interna para criar notificações (chamada do lado do servidor)
export async function createNotification(
  userId: string,
  type: 'info' | 'calendar' | 'finance' | 'material',
  title: string,
  message: string,
  metadata?: any
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
    revalidatePath('/dashboard')
    return notification
  } catch (error) {
    console.error('[Server Action] Erro ao criar notificação:', error)
    return null
  }
}
