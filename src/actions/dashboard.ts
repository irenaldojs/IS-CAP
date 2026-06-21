'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function getDashboardSummary() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      activeStudentsCount: 0,
      lessonsThisWeekCount: 0,
      estimatedRevenue: 0,
      pendingAlertsCount: 0,
      upcomingLessons: [],
      pendingPayments: [],
    }
  }

  const userId = session.user.id
  const now = new Date()

  // 1. Alunos Ativos
  const activeStudentsCount = await prisma.student.count({
    where: {
      userId,
      active: true,
    },
  })

  // 2. Aulas esta Semana (Segunda a Domingo)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const lessonsThisWeekCount = await prisma.lesson.count({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
      status: {
        not: 'CANCELADA',
      },
    },
  })

  // 3. Receita Estimada (Mês Atual)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const lessonsThisMonth = await prisma.lesson.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
      status: {
        not: 'CANCELADA',
      },
    },
    select: {
      value: true,
    },
  })

  const estimatedRevenue = lessonsThisMonth.reduce((sum, lesson) => sum + lesson.value, 0)

  // 4. Alertas Pendentes (Notificações não lidas)
  const pendingAlertsCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  // 5. Próximas Aulas (Aulas agendadas com startTime >= agora, ordenadas por data/hora asc, limite de 5)
  const upcomingLessons = await prisma.lesson.findMany({
    where: {
      userId,
      status: 'AGENDADA',
      startTime: {
        gte: now,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 5,
  })

  // 6. Pagamentos Pendentes (Não pagos, ordenados por data de criação desc, limite de 5)
  const pendingPayments = await prisma.payment.findMany({
    where: {
      userId,
      isPaid: false,
    },
    include: {
      lesson: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  return {
    activeStudentsCount,
    lessonsThisWeekCount,
    estimatedRevenue,
    pendingAlertsCount,
    upcomingLessons,
    pendingPayments,
  }
}
