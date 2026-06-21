'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { createNotification } from './notifications'

export interface ExpenseInput {
  description: string
  amount: number
  date: Date | string
  category: string // MATERIAL, TRANSPORTE, SOFTWARE, OUTRO
  notes?: string | null
}

// 1. Obter Resumo Financeiro
export async function getFinancialSummary() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      totalPaid: 0,
      totalPending: 0,
      totalExpenses: 0,
      netBalance: 0,
    }
  }

  const userId = session.user.id

  // Busca todos os pagamentos do usuário
  const payments = await prisma.payment.findMany({
    where: { userId },
  })

  // Busca todas as despesas do usuário
  const expenses = await prisma.expense.findMany({
    where: { userId },
  })

  const totalPaid = payments
    .filter((p) => p.isPaid)
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => !p.isPaid)
    .reduce((sum, p) => sum + p.amount, 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const netBalance = totalPaid - totalExpenses

  return {
    totalPaid,
    totalPending,
    totalExpenses,
    netBalance,
  }
}

// 2. Obter Todos os Pagamentos
export async function getPayments() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.payment.findMany({
    where: {
      userId: session.user.id,
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
  })
}

// 3. Alterar Status de Pagamento
export async function togglePaymentStatus(
  id: string,
  isPaid: boolean,
  paymentMethod?: string | null
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      isPaid,
      paidAt: isPaid ? new Date() : null,
      paymentMethod: isPaid ? paymentMethod || 'PIX' : null,
    },
  })

  if (isPaid) {
    try {
      const paymentWithLesson = await prisma.payment.findUnique({
        where: { id },
        include: {
          lesson: {
            include: {
              student: { select: { name: true } }
            }
          }
        }
      })
      
      const studentName = paymentWithLesson?.lesson?.student?.name || 'Aluno'
      const amountFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)
      
      await createNotification(
        session.user.id,
        'finance',
        'Pagamento recebido',
        `O pagamento de ${amountFormatted} do(a) aluno(a) ${studentName} foi confirmado.`
      )
    } catch (err) {
      console.error('Erro ao gerar notificação de pagamento:', err)
    }
  }

  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard')
  return payment
}

// 4. Obter Todas as Despesas
export async function getExpenses() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.expense.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: 'desc',
    },
  })
}

// 5. Criar Despesa
export async function createExpense(data: ExpenseInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const parsedDate = new Date(data.date)

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      description: data.description,
      amount: Number(data.amount),
      date: parsedDate,
      category: data.category,
      notes: data.notes || null,
    },
  })

  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard')
  return expense
}

// 6. Deletar Despesa
export async function deleteExpense(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado')

  const expense = await prisma.expense.delete({
    where: { id },
  })

  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard')
  return expense
}
