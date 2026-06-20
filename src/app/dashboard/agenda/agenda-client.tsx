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
  children: React.ReactNode
}

export function AgendaClient({
  students,
  subjects,
  view,
  period,
  date,
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Agenda de Aulas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus agendamentos, horários de aulas e status das sessões pedagógicas.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15"
        >
          <Plus className="mr-2 size-4" />
          Agendar Aula
        </Button>
      </div>

      {/* Barra de Filtros e Visualização */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
        
        {/* Filtros de Período */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => handlePeriodChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas as Aulas
          </button>
          <button
            onClick={() => handlePeriodChange('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'today'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'week'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => handlePeriodChange('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'upcoming'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Próximas
          </button>
        </div>

        {/* Toggle Modo Visualização */}
        <div className="flex items-center gap-1 border border-slate-800 bg-slate-950 p-1 rounded-lg self-end sm:self-auto">
          <button
            onClick={() => handleViewChange('list')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              view === 'list'
                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            title="Visualização em Lista"
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => handleViewChange('calendar')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              view === 'calendar'
                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            title="Visualização em Calendário"
          >
            <CalendarIcon className="size-4" />
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
      />
    </div>
  )
}
