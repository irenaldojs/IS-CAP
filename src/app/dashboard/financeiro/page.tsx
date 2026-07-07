import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { FinanceiroClient } from './financeiro-client'
import { FinanceSummaryCards } from './finance-summary-cards'
import { FinanceDataView } from './finance-data-view'
import { FinanceSummarySkeleton, FinanceTableSkeleton } from './finance-skeletons'
import { Suspense } from 'react'
import prisma from '@/lib/prisma'

interface PageProps {
  searchParams: Promise<{
    tab?: 'mensal' | 'geral'
    subTab?: 'receitas' | 'despesas'
    month?: string
    year?: string
  }>
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const tab = resolvedParams.tab || 'mensal'
  const subTab = resolvedParams.subTab || 'receitas'

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const month = resolvedParams.month ? parseInt(resolvedParams.month) : currentMonth
  const year = resolvedParams.year ? parseInt(resolvedParams.year) : currentYear

  // Busca o valor base da hora de aula do perfil do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { defaultHourlyRate: true },
  })
  const defaultHourlyRate = user?.defaultHourlyRate || 80

  const showSummaryCards = tab === 'mensal'
  const summaryKey = `summary-mensal-${month}-${year}`

  return (
    <FinanceiroClient
      tab={tab}
      subTab={subTab}
      month={month}
      year={year}
      defaultHourlyRate={defaultHourlyRate}
      summaryCards={
        showSummaryCards ? (
          <Suspense key={summaryKey} fallback={<FinanceSummarySkeleton />}>
            <FinanceSummaryCards month={month} year={year} />
          </Suspense>
        ) : null
      }
    >
      <Suspense key={`${tab}-${subTab}-${month}-${year}`} fallback={<FinanceTableSkeleton />}>
        <FinanceDataView tab={tab === 'geral' ? 'geral' : subTab} month={month} year={year} />
      </Suspense>
    </FinanceiroClient>
  )
}

