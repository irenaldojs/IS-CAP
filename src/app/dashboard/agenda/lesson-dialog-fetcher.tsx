import prisma from '@/lib/prisma'
import { LessonDialogWrapper } from './lesson-dialog-wrapper'

interface LessonDialogFetcherProps {
  id: string
  students: any[]
  subjects: any[]
  onCloseUrl: string
}

export async function LessonDialogFetcher({
  id,
  students,
  subjects,
  onCloseUrl,
}: LessonDialogFetcherProps) {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
  })

  if (!lesson) return null

  // Mapeia datas do Prisma para Date antes de passar para o Client Component
  const serializedLesson = {
    ...lesson,
    date: new Date(lesson.date),
    startTime: new Date(lesson.startTime),
  }

  return (
    <LessonDialogWrapper
      lesson={serializedLesson}
      students={students}
      subjects={subjects}
      onCloseUrl={onCloseUrl}
    />
  )
}
