import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSubjects } from '@/actions/lessons'
import { getStudents } from '@/actions/students'
import { AgendaClient } from './agenda-client'
import { LessonsDataView } from './agenda-data-view'
import { LessonDialogFetcher } from './lesson-dialog-fetcher'
import { AgendaListSkeleton, AgendaCalendarSkeleton } from './agenda-skeleton'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{
    view?: 'list' | 'calendar'
    period?: 'all' | 'today' | 'week' | 'upcoming'
    date?: string
    editLessonId?: string
  }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const view = resolvedParams.view || 'list'
  const period = resolvedParams.period || 'all'
  const dateStr = resolvedParams.date || new Date().toISOString().split('T')[0]
  const editLessonId = resolvedParams.editLessonId

  // Busca apenas metadados rápidos necessários para os dialogs no servidor de forma concorrente
  const [students, subjects] = await Promise.all([
    getStudents(),
    getSubjects(),
  ])

  const suspenseKey = `${view}_${period}_${dateStr}`
  const onCloseUrl = `/dashboard/agenda?view=${view}&period=${period}&date=${dateStr}`

  return (
    <AgendaClient
      view={view}
      period={period}
      date={dateStr}
      students={students}
      subjects={subjects}
    >
      <Suspense
        key={suspenseKey}
        fallback={view === 'list' ? <AgendaListSkeleton /> : <AgendaCalendarSkeleton />}
      >
        <LessonsDataView
          view={view}
          period={period}
          date={dateStr}
        />
      </Suspense>

      {/* Renderiza a dialog de edição no servidor sob demanda apenas quando ativada pela URL */}
      {editLessonId && (
        <Suspense fallback={null}>
          <LessonDialogFetcher
            id={editLessonId}
            students={students}
            subjects={subjects}
            onCloseUrl={onCloseUrl}
          />
        </Suspense>
      )}
    </AgendaClient>
  )
}

