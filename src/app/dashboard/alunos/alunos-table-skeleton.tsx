import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function AlunosTableSkeleton() {
  return (
    <Table className="animate-pulse">
      <TableHeader className="bg-slate-950/40 border-b border-slate-800">
        <TableRow className="border-slate-800">
          <TableHead className="pl-2 py-1 text-slate-400 font-medium">Nome</TableHead>
          <TableHead className="py-1 text-slate-400 font-medium">Série</TableHead>
          <TableHead className="py-1 text-slate-400 font-medium">Escola</TableHead>
          <TableHead className="py-1 text-slate-400 font-medium">Telefone dos Pais</TableHead>
          <TableHead className="py-1 text-slate-400 font-medium">Status</TableHead>
          <TableHead className="pr-2 py-1 text-right text-slate-400 font-medium">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} className="border-slate-800">
            {/* Nome */}
            <TableCell className="pl-2 py-1">
              <div className="flex items-center gap-3">
                <div className="size-9 bg-slate-850 rounded-lg shrink-0"></div>
                <div className="space-y-1.5 flex-1 max-w-[150px]">
                  <div className="h-4 bg-slate-850 rounded"></div>
                  <div className="h-3 w-3/4 bg-slate-850/60 rounded"></div>
                </div>
              </div>
            </TableCell>

            {/* Série */}
            <TableCell className="py-1">
              <div className="h-4 w-24 bg-slate-850 rounded"></div>
            </TableCell>

            {/* Escola */}
            <TableCell className="py-1">
              <div className="h-4 w-32 bg-slate-850 rounded"></div>
            </TableCell>

            {/* Telefone */}
            <TableCell className="py-1">
              <div className="h-4 w-28 bg-slate-850 rounded"></div>
            </TableCell>

            {/* Status */}
            <TableCell className="py-1">
              <div className="h-6 w-16 bg-slate-850 rounded-full"></div>
            </TableCell>

            {/* Ações */}
            <TableCell className="pr-2 py-1">
              <div className="flex justify-end gap-2">
                <div className="h-8 w-16 bg-slate-850 rounded-lg"></div>
                <div className="h-8 w-20 bg-slate-850 rounded-lg"></div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
