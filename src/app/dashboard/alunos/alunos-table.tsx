import { getStudents } from '@/actions/students'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleStatusButton } from './toggle-status-button'
import { Eye, School, GraduationCap, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface AlunosTableProps {
  query: string
}

export async function AlunosTable({ query }: AlunosTableProps) {
  const students = await getStudents(query)

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <User className="size-12 text-slate-700 mb-3" />
        <h3 className="font-semibold text-slate-300">Nenhum aluno encontrado</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">
          {query
            ? 'Nenhum resultado corresponde à sua pesquisa. Tente buscar por outros termos.'
            : 'Comece adicionando seu primeiro aluno clicando no botão acima.'}
        </p>
      </div>
    )
  }

  return (
    <Table>
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
        {students.map((student) => (
          <TableRow
            key={student.id}
            className="border-slate-800 hover:bg-slate-900/40 transition-colors"
          >
            {/* Nome do Aluno */}
            <TableCell className="pl-2 py-1 font-medium text-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-950/50 text-indigo-400 border border-indigo-900/50">
                  <User className="size-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{student.name}</p>
                  {student.email && (
                    <p className="text-xs text-slate-400">{student.email}</p>
                  )}
                </div>
              </div>
            </TableCell>

            {/* Série/Ano */}
            <TableCell className="py-1 text-slate-300">
              {student.gradeLevel ? (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-slate-400" />
                  <span>{student.gradeLevel}</span>
                </div>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </TableCell>

            {/* Escola */}
            <TableCell className="py-1 text-slate-300">
              {student.school ? (
                <div className="flex items-center gap-1.5">
                  <School className="size-4 text-slate-400" />
                  <span className="truncate max-w-[180px]">{student.school}</span>
                </div>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </TableCell>

            {/* Telefone dos Pais */}
            <TableCell className="py-1 text-slate-300 font-mono text-sm">
              {student.parentPhone ? (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-4 text-slate-400" />
                  <span>{student.parentPhone}</span>
                </div>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </TableCell>

            {/* Status */}
            <TableCell className="py-1">
              {student.active ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-900/30">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                  </span>
                  Ativo
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-800">
                  <span className="size-1.5 rounded-full bg-slate-600"></span>
                  Inativo
                </div>
              )}
            </TableCell>

            {/* Ações */}
            <TableCell className="pr-2 py-1 text-right">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/dashboard/alunos/${student.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "gap-1.5")}
                >
                  <Eye className="size-3.5 text-slate-400" />
                  Perfil
                </Link>
                <ToggleStatusButton id={student.id} active={student.active} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
