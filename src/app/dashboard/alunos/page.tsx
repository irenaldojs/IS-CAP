import Link from 'next/link'
import { Suspense } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    <div className="alunos-page-container flex flex-col h-full space-y-2 overflow-hidden">
      {/* Tabela de Alunos */}
      <Card className="flex-1 min-h-0 flex flex-col border-slate-800 bg-slate-900/20 backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-3 gap-4 shrink-0">
          <div className="flex-1 max-w-sm">
            <SearchInput />
          </div>
          <Link
            href="/dashboard/alunos/novo"
            className={cn(
              buttonVariants({ size: 'default' }),
              "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15 shrink-0"
            )}
          >
            <UserPlus className="mr-2 size-4" />
            Novo Aluno
          </Link>
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

