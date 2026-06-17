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
  school?: string
  age?: number
  gradeLevel?: string
  notes?: string
}

// 1. Criar Aluno
export async function createStudent(data: StudentInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const student = await prisma.student.create({
    data: {
      userId: session.user.id,
      name: data.name,
      parentName: data.parentName || null,
      parentPhone: data.parentPhone || null,
      email: data.email || null,
      school: data.school || null,
      age: data.age ? Number(data.age) : null,
      gradeLevel: data.gradeLevel || null,
      notes: data.notes || null,
      active: true,
    },
  })

  revalidatePath('/dashboard/alunos')
  return student
}

// 2. Atualizar Aluno
export async function updateStudent(id: string, data: StudentInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const student = await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      parentName: data.parentName || null,
      parentPhone: data.parentPhone || null,
      email: data.email || null,
      school: data.school || null,
      age: data.age ? Number(data.age) : null,
      gradeLevel: data.gradeLevel || null,
      notes: data.notes || null,
    },
  })

  revalidatePath('/dashboard/alunos')
  revalidatePath(`/dashboard/alunos/${id}`)
  return student
}

// 3. Listar Alunos com busca/filtros
export async function getStudents(query?: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.student.findMany({
    where: {
      userId: session.user.id,
      OR: query
        ? [
            { name: { contains: query } },
            { school: { contains: query } },
            { parentName: { contains: query } },
          ]
        : undefined,
    },
    orderBy: { name: 'asc' },
  })
}

// 4. Buscar Aluno por ID
export async function getStudentById(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.student.findUnique({
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
}

// 5. Inativar/Ativar Aluno (Soft Delete)
export async function toggleStudentStatus(id: string, active: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const student = await prisma.student.update({
    where: { id },
    data: { active },
  })

  revalidatePath('/dashboard/alunos')
  revalidatePath(`/dashboard/alunos/${id}`)
  return student
}
