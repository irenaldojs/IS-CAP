import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSubjects } from '@/actions/lessons'
import { MateriaisClient } from './materiais-client'
import { MateriaisGrid } from './materiais-grid'
import { MateriaisGridSkeleton } from './materiais-skeleton'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{
    subjectId?: string
    q?: string
  }>
}

export default async function MateriaisPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const selectedSubjectId = resolvedParams.subjectId || 'all'
  const searchQuery = resolvedParams.q || ''

  // Busca as matérias necessárias para carregar a sidebar lateral rapidamente
  const subjects = await getSubjects()

  const suspenseKey = `${selectedSubjectId}_${searchQuery}`

  return (
    <MateriaisClient
      subjects={subjects}
      selectedSubjectId={selectedSubjectId}
      searchQuery={searchQuery}
    >
      <Suspense key={suspenseKey} fallback={<MateriaisGridSkeleton />}>
        <MateriaisGrid
          selectedSubjectId={selectedSubjectId}
          searchQuery={searchQuery}
        />
      </Suspense>
    </MateriaisClient>
  )
}

