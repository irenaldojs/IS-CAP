import { FinanceSummarySkeleton, FinanceTableSkeleton } from './finance-skeletons'

export default function FinanceiroLoading() {
  return (
    <div className="space-y-4">
      <FinanceSummarySkeleton />
      <FinanceTableSkeleton />
    </div>
  )
}
