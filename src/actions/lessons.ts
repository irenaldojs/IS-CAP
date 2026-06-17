'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

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
    },
    orderBy: {
      date: 'asc',
    },
  })
}

// 2. Criar Nova Aula
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
      recurrence: data.recurrence || null,
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
