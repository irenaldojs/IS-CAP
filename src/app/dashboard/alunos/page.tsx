import Link from 'next/link'
import { Suspense } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from './search-input'
import { AlunosTable } from './alunos-table'
import { AlunosTableSkeleton } from './alunos-table-skeleton'
import { UserPlus } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AlunosPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''

  return (
    <div className="alunos-page-container flex flex-col h-full space-y-6 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Alunos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie, acompanhe e visualize todos os seus alunos de aulas particulares.
          </p>
        </div>
        <Link href="/dashboard/alunos/novo" className={cn(buttonVariants({ size: 'lg' }), "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15")}>
          <UserPlus className="mr-2 size-4" />
          Novo Aluno
        </Link>
      </div>

      {/* Tabela de Alunos */}
      <Card className="flex-1 min-h-0 flex flex-col border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 shrink-0">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-200">Lista de Alunos</CardTitle>
          </div>
          <SearchInput />
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
          <Suspense key={query} fallback={<AlunosTableSkeleton />}>
            <AlunosTable query={query} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

