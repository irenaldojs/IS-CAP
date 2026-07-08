import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-64 rounded-lg bg-slate-800/50 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-slate-800/30 animate-pulse mt-2" />
        </div>
        <div className="h-4 w-32 rounded-md bg-slate-800/30 animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-slate-800/50 animate-pulse" />
              <div className="size-8 rounded-lg bg-slate-800/40 animate-pulse" />
            </div>
            <div className="h-8 w-16 rounded-md bg-slate-800/50 animate-pulse mt-3" />
            <div className="h-3 w-32 rounded bg-slate-800/30 animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Bottom cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-slate-800/50 animate-pulse" />
                <div className="h-4 w-20 rounded bg-slate-800/30 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded bg-slate-800/40 animate-pulse" />
                    <div>
                      <div className="h-4 w-28 rounded bg-slate-800/50 animate-pulse" />
                      <div className="h-3 w-20 rounded bg-slate-800/30 animate-pulse mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 rounded bg-slate-800/50 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-slate-800/30 animate-pulse mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
