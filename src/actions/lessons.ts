'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { createNotification } from './notifications'

export interface LessonInput {
  studentId: string
  subjectId: string
  packageId?: string | null
  date: Date | string
  startTime: Date | string
  durationHours: number
  value: number
  modality: string // PRESENCIAL, ONLINE
  status?: string // AGENDADA, CONCLUIDA, CANCELADA
  recurrence?: string | null // SEMANAL, QUINZENAL, MENSAL
  notes?: string | null
}

// 1. Obter Aulas do Usuário Logado
export async function getLessons() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.lesson.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      recurringSchedule: {
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          durationHours: true,
          value: true,
          modality: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })
}

// 2. Criar Nova Aula (Avulsa)
export async function createLesson(data: LessonInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const parsedDate = new Date(data.date)
  const parsedStartTime = new Date(data.startTime)

  const lesson = await prisma.lesson.create({
    data: {
      userId: session.user.id,
      studentId: data.studentId,
      subjectId: data.subjectId,
      packageId: data.packageId || null,
      date: parsedDate,
      startTime: parsedStartTime,
      durationHours: Number(data.durationHours),
      value: Number(data.value),
      modality: data.modality,
      status: data.status || 'AGENDADA',
      recurrence: data.recurrence || 'AVULSA',
      notes: data.notes || null,
    },
  })

  // Se a aula gerar um pagamento pendente
  await prisma.payment.create({
    data: {
      userId: session.user.id,
      lessonId: lesson.id,
      amount: lesson.value,
      isPaid: false,
    },
  }).catch((err) => {
    console.error('Erro ao criar registro de pagamento para a aula:', err)
  })

  // Busca dados adicionais do aluno e matéria para a mensagem de notificação
  try {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { name: true },
    })
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { name: true },
    })

    const dateStr = parsedStartTime.toLocaleDateString('pt-BR')
    const hourStr = parsedStartTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    await createNotification(
      session.user.id,
      'calendar',
      'Aula agendada',
      `Aula de ${subject?.name || 'Matéria'} com ${student?.name || 'Aluno'} agendada para ${dateStr} às ${hourStr}.`
    )
  } catch (err) {
    console.error('Erro ao gerar notificação de aula:', err)
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return lesson
}

// 3. Atualizar Aula Existente
export async function updateLesson(id: string, data: LessonInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const parsedDate = new Date(data.date)
  const parsedStartTime = new Date(data.startTime)

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      packageId: data.packageId || null,
      date: parsedDate,
      startTime: parsedStartTime,
      durationHours: Number(data.durationHours),
      value: Number(data.value),
      modality: data.modality,
      status: data.status,
      recurrence: data.recurrence || null,
      notes: data.notes || null,
    },
  })

  // Sincroniza o valor do pagamento caso tenha mudado e ainda não esteja pago
  const payment = await prisma.payment.findUnique({ where: { lessonId: id } })
  if (payment && !payment.isPaid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { amount: lesson.value },
    }).catch(console.error)
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return lesson
}

// 4. Atualizar Apenas o Status da Aula
export async function updateLessonStatus(id: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const lesson = await prisma.lesson.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return lesson
}

// 5. Deletar Aula
export async function deleteLesson(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  // O Payment será deletado em cascata por onDelete: Cascade definido no model Payment
  const lesson = await prisma.lesson.delete({
    where: { id },
  })

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return lesson
}

// 6. Obter Matérias do Usuário
export async function getSubjects() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.subject.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

// 7. Criar Agendamento Semanal (Recorrência) - Função direta de Banco de Dados
export async function createRecurringScheduleDb(userId: string, data: {
  studentId: string
  subjectId: string
  startDate: Date | string
  durationHours: number
  value: number
  modality: string
  notes?: string | null
}) {
  const firstDate = new Date(data.startDate)
  const dayOfWeek = firstDate.getDay()
  const timeString = firstDate.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

  // 1. Cria a recorrência master
  const schedule = await prisma.recurringSchedule.create({
    data: {
      userId,
      studentId: data.studentId,
      subjectId: data.subjectId,
      dayOfWeek,
      startTime: timeString,
      durationHours: Number(data.durationHours),
      value: Number(data.value),
      modality: data.modality,
      active: true,
    },
  })

  // 2. Pré-gera 8 semanas de aulas
  const dates = []
  const current = new Date(firstDate)
  for (let i = 0; i < 8; i++) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }

  for (const lessonDate of dates) {
    const dateOnly = new Date(lessonDate)
    dateOnly.setHours(0, 0, 0, 0)

    const lesson = await prisma.lesson.create({
      data: {
        userId,
        studentId: data.studentId,
        subjectId: data.subjectId,
        date: dateOnly,
        startTime: lessonDate,
        durationHours: Number(data.durationHours),
        value: Number(data.value),
        modality: data.modality,
        status: 'AGENDADA',
        recurrence: 'SEMANAL',
        recurringScheduleId: schedule.id,
        notes: data.notes || null,
      },
    })

    // Cria o pagamento pendente correspondente
    await prisma.payment.create({
      data: {
        userId,
        lessonId: lesson.id,
        amount: lesson.value,
        isPaid: false,
      },
    }).catch((err) => console.error('Erro ao criar pagamento recorrente:', err))
  }

  // Cria notificação de aula recorrente agendada
  try {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { name: true },
    })
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { name: true },
    })

    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    const dayName = days[dayOfWeek]

    await createNotification(
      userId,
      'calendar',
      'Aula recorrente agendada',
      `Aulas de ${subject?.name || 'Matéria'} com ${student?.name || 'Aluno'} agendadas para todas as ${dayName}s às ${timeString}.`
    )
  } catch (err) {
    console.error('Erro ao gerar notificação de aula recorrente:', err)
  }

  return schedule
}

export async function createRecurringSchedule(data: {
  studentId: string
  subjectId: string
  startDate: Date | string
  durationHours: number
  value: number
  modality: string
  notes?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const schedule = await createRecurringScheduleDb(session.user.id, data)

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return schedule
}

// 8. Atualizar Agendamento Semanal (Recorrência) - Função direta de Banco de Dados
export async function updateRecurringScheduleDb(
  userId: string,
  id: string,
  data: {
    dayOfWeek: number
    startTime: string
    durationHours: number
    value: number
    modality: string
  }
) {
  // 1. Atualiza a recorrência master
  const schedule = await prisma.recurringSchedule.update({
    where: { id },
    data: {
      dayOfWeek: Number(data.dayOfWeek),
      startTime: data.startTime,
      durationHours: Number(data.durationHours),
      value: Number(data.value),
      modality: data.modality,
    },
  })

  // 2. Atualiza futuras aulas agendadas (não concluídas ou canceladas)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureLessons = await prisma.lesson.findMany({
    where: {
      recurringScheduleId: id,
      status: 'AGENDADA',
      date: { gte: today },
    },
    orderBy: { date: 'asc' },
  })

  for (const lesson of futureLessons) {
    const lessonDate = new Date(lesson.date)
    const currentDay = lessonDate.getDay()
    const daysToAdd = (data.dayOfWeek - currentDay + 7) % 7
    if (daysToAdd !== 0) {
      lessonDate.setDate(lessonDate.getDate() + daysToAdd)
    }

    const [hours, minutes] = data.startTime.split(':').map(Number)
    const newStartTime = new Date(lessonDate)
    newStartTime.setHours(hours, minutes, 0, 0)

    const dateOnly = new Date(lessonDate)
    dateOnly.setHours(0, 0, 0, 0)

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        date: dateOnly,
        startTime: newStartTime,
        durationHours: Number(data.durationHours),
        value: Number(data.value),
        modality: data.modality,
      },
    })

    // Sincroniza pagamento pendente se existir
    const payment = await prisma.payment.findUnique({ where: { lessonId: lesson.id } })
    if (payment && !payment.isPaid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { amount: Number(data.value) },
      }).catch(console.error)
    }
  }

  return schedule
}

export async function updateRecurringSchedule(
  id: string,
  data: {
    dayOfWeek: number
    startTime: string
    durationHours: number
    value: number
    modality: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const schedule = await updateRecurringScheduleDb(session.user.id, id, data)

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return schedule
}

// 9. Deletar Agendamento Semanal (Recorrência) - Função direta de Banco de Dados
export async function deleteRecurringScheduleDb(userId: string, id: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Deleta as futuras aulas que ainda não foram ministradas
  await prisma.lesson.deleteMany({
    where: {
      recurringScheduleId: id,
      status: 'AGENDADA',
      date: { gte: today },
    },
  })

  // Remove o agendamento master
  const schedule = await prisma.recurringSchedule.delete({
    where: { id },
  })

  return schedule
}

export async function deleteRecurringSchedule(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const schedule = await deleteRecurringScheduleDb(session.user.id, id)

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
  return schedule
}


// 10. Obter Agendamentos Semanais do Usuário
export async function getRecurringSchedules() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.recurringSchedule.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, color: true } },
    },
    orderBy: {
      dayOfWeek: 'asc',
    },
  })
}
