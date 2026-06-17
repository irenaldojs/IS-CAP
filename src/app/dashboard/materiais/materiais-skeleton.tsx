import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function MateriaisGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
          <CardHeader className="flex flex-row items-start gap-4 pb-3">
            <div className="size-12 bg-slate-850 rounded-xl shrink-0"></div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-slate-850 rounded"></div>
                <div className="h-4 w-20 bg-slate-850/60 rounded"></div>
              </div>
              <div className="h-5 w-3/4 bg-slate-850 rounded"></div>
              <div className="h-3 w-1/2 bg-slate-850/60 rounded"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <div className="h-12 w-full bg-slate-950/40 rounded p-2"></div>
            <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
              <div className="h-4 w-16 bg-slate-850 rounded"></div>
              <div className="flex gap-2">
                <div className="size-8 bg-slate-850 rounded-md"></div>
                <div className="h-8 w-24 bg-slate-850 rounded-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
