import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function FinanceSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-slate-800 bg-slate-900/15 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-16 bg-slate-850 rounded"></div>
            <div className="size-8 bg-slate-850 rounded-lg"></div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-7 w-24 bg-slate-850 rounded-lg"></div>
            <div className="h-3 w-32 bg-slate-850/60 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function FinanceTableSkeleton() {
  return (
    <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md animate-pulse">
      <CardHeader className="pb-6">
        <div className="space-y-2">
          <div className="h-5 w-36 bg-slate-850 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-850/60 rounded-lg"></div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b border-slate-800 px-6 py-4 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 bg-slate-850 rounded"></div>
          ))}
        </div>
        <div className="divide-y divide-slate-800/60 px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-5 flex gap-4 items-center">
              <div className="h-4 flex-1 bg-slate-850/85 rounded"></div>
              <div className="h-4 w-24 bg-slate-850/70 rounded"></div>
              <div className="h-4 w-28 bg-slate-850/75 rounded"></div>
              <div className="h-4 w-20 bg-slate-850/60 rounded"></div>
              <div className="h-6 w-20 bg-slate-850/80 rounded-full"></div>
              <div className="h-4 w-20 bg-slate-850/60 rounded"></div>
              <div className="h-7 w-24 bg-slate-850/80 rounded-lg"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
