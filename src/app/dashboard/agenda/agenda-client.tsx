'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LessonDialog } from './lesson-dialog'
import {
  Calendar as CalendarIcon,
  List,
  Plus,
} from 'lucide-react'

interface Student {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
  color: string
}

interface AgendaClientProps {
  students: Student[]
  subjects: Subject[]
  view: 'list' | 'calendar'
  period: 'all' | 'today' | 'week' | 'upcoming'
  date: string
  defaultHourlyRate: number
  children: React.ReactNode
}

export function AgendaClient({
  students,
  subjects,
  view,
  period,
  date,
  defaultHourlyRate,
  children,
}: AgendaClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const hasCreateDate = searchParams ? searchParams.has('createDate') : false

  // Abre o modal de criação se os parâmetros de slot estiverem na URL
  useEffect(() => {
    if (hasCreateDate) {
      setIsDialogOpen(true)
    }
  }, [hasCreateDate])

  const handlePeriodChange = (newPeriod: string) => {
    router.push(`/dashboard/agenda?view=${view}&period=${newPeriod}&date=${date}`)
  }

  const handleViewChange = (newView: string) => {
    router.push(`/dashboard/agenda?view=${newView}&period=${period}&date=${date}`)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    // Limpa os parâmetros de criação e edição da URL para evitar reabertura acidental
    router.push(`/dashboard/agenda?view=${view}&period=${period}&date=${date}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Agenda de Aulas</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Gerencie seus agendamentos, horários de aulas e status das sessões pedagógicas.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15 text-xs h-9"
        >
          <Plus className="mr-1.5 size-3.5" />
          Agendar Aula
        </Button>
      </div>

      {/* Barra de Filtros e Visualização */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 p-2 rounded-xl border border-slate-800/80 backdrop-blur-md">
        
        {/* Abas */}
        <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800/40 w-full sm:w-auto">
          <button
            onClick={() => {
              router.push(`/dashboard/agenda?view=list&period=today&date=${date}`)
            }}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              period === 'today' && view === 'list'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => {
              router.push(`/dashboard/agenda?view=calendar&period=week&date=${date}`)
            }}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              period === 'week' && view === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Calendário
          </button>
          <button
            onClick={() => {
              router.push(`/dashboard/agenda?view=list&period=upcoming&date=${date}`)
            }}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              period === 'upcoming' && view === 'list'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Próximas
          </button>
        </div>

      </div>

      {/* ÁREA PRINCIPAL: LISTA OU CALENDÁRIO */}
      {children}

      {/* MODAL DIALOG PARA CRIAR NOVA AULA */}
      <LessonDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        students={students}
        subjects={subjects}
        editingLesson={null}
        defaultHourlyRate={defaultHourlyRate}
      />
    </div>
  )
}
