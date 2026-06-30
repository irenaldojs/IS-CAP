'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { 
  createRecurringScheduleDb, 
  updateRecurringScheduleDb, 
  deleteRecurringScheduleDb 
} from './lessons'
import { createNotification } from './notifications'

// Tipo para criação de estudante
export interface StudentInput {
  name: string
  parentName?: string
  parentPhone?: string
  email?: string
  phone?: string
  school?: string
  age?: number
  gradeLevel?: string
  notes?: string
  promotion?: string
  hourlyRate?: number
  subjectIds?: string[]
  recurringSchedules?: {
    dayOfWeek: number
    startTime: string
    value: number
    subjectId: string
  }[]
}

// Helpers para sincronização de Agenda Fixa e Matérias
function mapDayStringToNumber(dayStr: string): number {
  switch (dayStr.toLowerCase()) {
    case 'domingo': return 0;
    case 'segunda-feira': case 'segunda': return 1;
    case 'terça-feira': case 'terça': return 2;
    case 'quarta-feira': case 'quarta': return 3;
    case 'quinta-feira': case 'quinta': return 4;
    case 'sexta-feira': case 'sexta': return 5;
    case 'sábado': case 'sabado': return 6;
    default: return 1;
  }
}

function getNextDayOfWeekDate(dayOfWeek: number, timeStr: string): Date {
  const now = new Date()
  const [hours, minutes] = (timeStr || '14:00').split(':').map(Number)
  
  const resultDate = new Date()
  resultDate.setHours(hours, minutes, 0, 0)
  
  const currentDay = now.getDay()
  let daysToAdd = (dayOfWeek - currentDay + 7) % 7
  
  if (daysToAdd === 0 && resultDate.getTime() <= now.getTime()) {
    daysToAdd = 7
  }
  
  resultDate.setDate(resultDate.getDate() + daysToAdd)
  return resultDate
}

async function syncStudentSubjects(studentId: string, subjectIds: string[]) {
  // Remove associações antigas
  await prisma.studentSubject.deleteMany({
    where: { studentId }
  })

  // Adiciona as novas associações
  if (subjectIds && subjectIds.length > 0) {
    await prisma.studentSubject.createMany({
      data: subjectIds.map(subjectId => ({
        studentId,
        subjectId
      }))
    })
  }
}

async function syncStudentRecurringSchedules(studentId: string, userId: string, schedules?: { dayOfWeek: number; startTime: string; value: number; subjectId: string }[]) {
  // Busca agendamentos recorrentes antigos
  const existingSchedules = await prisma.recurringSchedule.findMany({
    where: { studentId }
  })

  // Limpa agendamentos antigos e as respectivas aulas futuras
  for (const esc of existingSchedules) {
    await deleteRecurringScheduleDb(userId, esc.id)
  }

  // Cria novos agendamentos recorrentes
  if (schedules && schedules.length > 0) {
    for (const sc of schedules) {
      const firstDate = getNextDayOfWeekDate(sc.dayOfWeek, sc.startTime)
      await createRecurringScheduleDb(userId, {
        studentId,
        subjectId: sc.subjectId,
        startDate: firstDate,
        durationHours: 1.5,
        value: sc.value,
        modality: 'ONLINE',
      })
    }
  }
}

// 1. Criar Aluno
export async function createStudent(data: StudentInput) {
  const session = await auth()
  if (!session?.user?.id) {
    console.warn('[Server Action] createStudent: Tentativa de criação de aluno não autorizada.')
    throw new Error('Não autorizado')
  }

  try {
    console.log('[Server Action] createStudent: Tentando cadastrar aluno com dados:', JSON.stringify(data))

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!userExists) {
      console.warn(`[Server Action] createStudent: Usuário ${session.user.id} não encontrado no banco de dados. Sessão órfã/antiga.`)
      throw new Error('Sua sessão é antiga ou o usuário correspondente não existe no banco de dados atual. Por favor, faça logout e entre novamente no sistema.')
    }

    const student = await prisma.student.create({
      data: {
        userId: session.user.id,
        name: data.name,
        parentName: data.parentName || null,
        parentPhone: data.parentPhone || null,
        email: data.email || null,
        phone: data.phone || null,
        school: data.school || null,
        age: data.age ? Number(data.age) : null,
        gradeLevel: data.gradeLevel || null,
        notes: data.notes || null,
        active: true,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : null,
        promotion: data.promotion || null,
        fixedScheduleActive: false,
        fixedScheduleDay: null,
        fixedScheduleTime: null,
        fixedSchedulePrice: null,
        fixedScheduleTemporarilyDisabled: false,
      },
    })

    // Sincroniza as matérias
    if (data.subjectIds) {
      await syncStudentSubjects(student.id, data.subjectIds)
    }

    // Sincroniza a Agenda Fixa com as Aulas do Calendário
    await syncStudentRecurringSchedules(student.id, session.user.id, data.recurringSchedules)

    // Cria notificação de sucesso
    await createNotification(
      session.user.id,
      'info',
      'Novo aluno cadastrado',
      `${data.name} completou a matrícula hoje.`
    )

    console.log(`[Server Action] createStudent: Aluno cadastrado com sucesso! ID: ${student.id}`)
    revalidatePath('/dashboard/alunos')
    return student
  } catch (error) {
    console.error('[Server Action] Erro ao cadastrar aluno no banco de dados:', error)
    throw new Error(
      error instanceof Error ? error.message : `Erro ao cadastrar aluno: ${String(error)}`
    )
  }
}

// 2. Atualizar Aluno
export async function updateStudent(id: string, data: StudentInput) {
  const session = await auth()
  if (!session?.user?.id) {
    console.warn('[Server Action] updateStudent: Tentativa não autorizada.')
    throw new Error('Não autorizado')
  }

  try {
    console.log(`[Server Action] updateStudent: Tentando atualizar aluno ${id} com dados:`, JSON.stringify(data))

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!userExists) {
      console.warn(`[Server Action] updateStudent: Usuário ${session.user.id} não encontrado no banco de dados. Sessão órfã/antiga.`)
      throw new Error('Sua sessão é antiga ou o usuário correspondente não existe no banco de dados atual. Por favor, faça logout e entre novamente no sistema.')
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        parentName: data.parentName || null,
        parentPhone: data.parentPhone || null,
        email: data.email || null,
        phone: data.phone || null,
        school: data.school || null,
        age: data.age ? Number(data.age) : null,
        gradeLevel: data.gradeLevel || null,
        notes: data.notes || null,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : null,
        promotion: data.promotion || null,
      },
    })

    // Sincroniza as matérias
    if (data.subjectIds) {
      await syncStudentSubjects(student.id, data.subjectIds)
    }

    // Sincroniza a Agenda Fixa com as Aulas do Calendário
    await syncStudentRecurringSchedules(student.id, session.user.id, data.recurringSchedules)

    console.log(`[Server Action] updateStudent: Aluno atualizado com sucesso! ID: ${student.id}`)
    revalidatePath('/dashboard/alunos')
    revalidatePath(`/dashboard/alunos/${id}`)
    return student
  } catch (error) {
    console.error(`[Server Action] Erro ao atualizar aluno ${id} no banco de dados:`, error)
    throw new Error(
      error instanceof Error ? error.message : `Erro ao atualizar aluno: ${String(error)}`
    )
  }
}

// 3. Listar Alunos com busca/filtros
export async function getStudents(query?: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    return await prisma.student.findMany({
      where: {
        userId: session.user.id,
        OR: query
          ? [
              { name: { contains: query } },
              { school: { contains: query } },
              { parentName: { contains: query } },
              { parentPhone: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
            ]
          : undefined,
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('[Server Action] Erro ao buscar alunos no banco de dados:', error)
    throw new Error('Erro ao buscar lista de alunos')
  }
}

// 4. Buscar Aluno por ID
export async function getStudentById(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  try {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        recurringSchedules: {
          include: {
            subject: true,
          },
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        lessons: {
          orderBy: { date: 'desc' },
        },
        exams: {
          orderBy: { examDate: 'desc' },
        },
        grades: {
          orderBy: { period: 'asc' },
        },
      },
    })
  } catch (error) {
    console.error(`[Server Action] Erro ao buscar aluno ${id}:`, error)
    throw new Error('Erro ao obter detalhes do aluno')
  }
}

// 5. Inativar/Ativar Aluno (Soft Delete)
export async function toggleStudentStatus(id: string, active: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    console.warn('[Server Action] toggleStudentStatus: Tentativa não autorizada.')
    throw new Error('Não autorizado')
  }

  try {
    const student = await prisma.student.update({
      where: { id },
      data: { active },
    })

    console.log(`[Server Action] toggleStudentStatus: Status do aluno ${id} alterado para ${active}`)
    revalidatePath('/dashboard/alunos')
    revalidatePath(`/dashboard/alunos/${id}`)
    return student
  } catch (error) {
    console.error(`[Server Action] Erro ao alterar status do aluno ${id}:`, error)
    throw new Error('Erro ao alterar status do aluno')
  }
}
