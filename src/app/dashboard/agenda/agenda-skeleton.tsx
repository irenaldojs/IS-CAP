import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function AgendaListSkeleton() {
  return (
    <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md animate-pulse">
      <CardHeader className="pb-6">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-850 rounded-lg"></div>
          <div className="h-4 w-24 bg-slate-850/60 rounded-lg"></div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b border-slate-800 px-6 py-4 flex gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 bg-slate-850 rounded"></div>
          ))}
        </div>
        <div className="divide-y divide-slate-800/60 px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-5 flex gap-4 items-center">
              <div className="h-4 w-20 bg-slate-850/80 rounded"></div>
              <div className="h-4 w-28 bg-slate-850/70 rounded"></div>
              <div className="h-4 flex-1 bg-slate-850/80 rounded"></div>
              <div className="h-4 w-20 bg-slate-850/60 rounded"></div>
              <div className="h-4 w-20 bg-slate-850/60 rounded"></div>
              <div className="h-4 w-20 bg-slate-850/60 rounded"></div>
              <div className="h-6 w-20 bg-slate-850/80 rounded-full"></div>
              <div className="h-7 w-28 bg-slate-850/80 rounded-lg"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AgendaCalendarSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      {/* Calendário Mensal */}
      <Card className="lg:col-span-2 border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-850 rounded"></div>
            <div className="h-4 w-64 bg-slate-850/60 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-slate-850 rounded-lg"></div>
            <div className="h-8 w-8 bg-slate-850 rounded-lg"></div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-slate-800/40">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-850 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-850/40 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lateral Sidebar */}
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader className="pb-4 border-b border-slate-800/40">
          <div className="h-5 w-24 bg-slate-850 rounded"></div>
          <div className="h-3 w-40 bg-slate-850/60 mt-1.5 rounded"></div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-slate-850 rounded"></div>
                <div className="h-4 w-20 bg-slate-850 rounded"></div>
              </div>
              <div className="h-5 w-3/4 bg-slate-850 rounded"></div>
              <div className="h-4 w-full bg-slate-850/60 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
