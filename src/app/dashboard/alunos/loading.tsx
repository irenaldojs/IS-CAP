import { AlunosTableSkeleton } from './alunos-table-skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AlunosLoading() {
  return (
    <div className="alunos-page-container flex flex-col h-full space-y-2 overflow-hidden">
      <Card className="flex-1 min-h-0 flex flex-col border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-3 gap-4 shrink-0">
          <div className="flex-1 max-w-sm">
            <div className="h-9 w-full rounded-md bg-slate-800/40 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-md bg-indigo-600/30 animate-pulse" />
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
          <AlunosTableSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}
