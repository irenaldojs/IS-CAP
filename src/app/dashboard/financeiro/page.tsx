import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { FinanceiroClient } from './financeiro-client'
import { FinanceSummaryCards } from './finance-summary-cards'
import { FinanceDataView } from './finance-data-view'
import { FinanceSummarySkeleton, FinanceTableSkeleton } from './finance-skeletons'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{
    tab?: 'receitas' | 'despesas'
  }>
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const tab = resolvedParams.tab || 'receitas'

  return (
    <FinanceiroClient
      tab={tab}
      summaryCards={
        <Suspense fallback={<FinanceSummarySkeleton />}>
          <FinanceSummaryCards />
        </Suspense>
      }
    >
      <Suspense key={tab} fallback={<FinanceTableSkeleton />}>
        <FinanceDataView tab={tab} />
      </Suspense>
    </FinanceiroClient>
  )
}

