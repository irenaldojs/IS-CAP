'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

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
  fixedScheduleActive?: boolean
  fixedScheduleDay?: string | null
  fixedScheduleTime?: string | null
  fixedSchedulePrice?: number | null
  fixedScheduleTemporarilyDisabled?: boolean
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

    // Verifica se o usuário correspondente à sessão realmente existe no banco de dados
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
        fixedScheduleActive: data.fixedScheduleActive ?? false,
        fixedScheduleDay: data.fixedScheduleDay || null,
        fixedScheduleTime: data.fixedScheduleTime || null,
        fixedSchedulePrice: data.fixedSchedulePrice ? Number(data.fixedSchedulePrice) : null,
        fixedScheduleTemporarilyDisabled: data.fixedScheduleTemporarilyDisabled ?? false,
      },
    })

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

    // Verifica se o usuário correspondente à sessão realmente existe no banco de dados
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
        fixedScheduleActive: data.fixedScheduleActive ?? false,
        fixedScheduleDay: data.fixedScheduleDay || null,
        fixedScheduleTime: data.fixedScheduleTime || null,
        fixedSchedulePrice: data.fixedSchedulePrice ? Number(data.fixedSchedulePrice) : null,
        fixedScheduleTemporarilyDisabled: data.fixedScheduleTemporarilyDisabled ?? false,
      },
    })

    console.log(`[Server Action] updateStudent: Aluno cadastrado com sucesso! ID: ${student.id}`)
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
