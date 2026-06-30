import prisma from '@/lib/prisma'
import { LessonDialogWrapper } from './lesson-dialog-wrapper'

interface LessonDialogFetcherProps {
  id: string
  students: any[]
  subjects: any[]
  onCloseUrl: string
  defaultHourlyRate: number
}

export async function LessonDialogFetcher({
  id,
  students,
  subjects,
  onCloseUrl,
  defaultHourlyRate,
}: LessonDialogFetcherProps) {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  })

  if (!lesson) return null

  // Mapeia datas do Prisma para Date antes de passar para o Client Component
  // E também mapeia o array de subjects selecionados
  const subjectIds = lesson.subjects ? lesson.subjects.map((ls: any) => ls.subjectId) : []
  const serializedLesson = {
    ...lesson,
    date: new Date(lesson.date),
    startTime: new Date(lesson.startTime),
    subjectIds,
  }

  return (
    <LessonDialogWrapper
      lesson={serializedLesson}
      students={students}
      subjects={subjects}
      onCloseUrl={onCloseUrl}
      defaultHourlyRate={defaultHourlyRate}
    />
  )
}
