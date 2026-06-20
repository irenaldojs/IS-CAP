import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudentById } from '@/actions/students'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, User, Calendar, Award } from 'lucide-react'
import { StudentDetailClient } from './student-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetalhesAlunoPage({ params }: PageProps) {
  const resolvedParams = await params
  const student = await getStudentById(resolvedParams.id)

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Aluno não encontrado</h2>
        <p className="text-slate-400 mb-6 max-w-sm">
          Não conseguimos encontrar as informações deste aluno. Ele pode ter sido removido ou o ID está incorreto.
        </p>
        <Link href="/dashboard/alunos" className={cn(buttonVariants({ variant: 'default' }), "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer")}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar para lista de alunos
        </Link>
      </div>
    )
  }

  // Mapeamos para bater exatamente com a tipagem esperada no Client Component
  const studentData = {
    ...student,
    // Garante que campos opcionais null viram null/undefined coerentes
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    email: student.email,
    phone: student.phone,
    school: student.school,
    age: student.age,
    gradeLevel: student.gradeLevel,
    notes: student.notes,
  }

  return (
    <div className="space-y-6">
      {/* Voltar e Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/alunos" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-slate-400 hover:text-white cursor-pointer w-fit")}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar para lista
        </Link>

        {student.active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-900/30 w-fit">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
            </span>
            Matrícula Ativa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-800 w-fit">
            <span className="size-1.5 rounded-full bg-slate-600"></span>
            Matrícula Inativa
          </span>
        )}
      </div>

      {/* Perfil Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-900 shadow-lg">
            <User className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{student.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {student.gradeLevel ? `${student.gradeLevel}` : 'Sem série definida'}
              {student.school ? ` • ${student.school}` : ''}
            </p>
          </div>
        </div>
        <div>
          <Link
            href={`/dashboard/alunos/${student.id}/editar`}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              "border-slate-850 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-900 cursor-pointer"
            )}
          >
            Editar Perfil
          </Link>
        </div>
      </div>

      {/* Abas e Listagem Interativa */}
      <StudentDetailClient student={studentData} />
    </div>
  )
}
