'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const LessonDialog = dynamic(() => import('./lesson-dialog').then(mod => mod.LessonDialog), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="size-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  ),
})

interface LessonDialogWrapperProps {
  lesson: any
  students: any[]
  subjects: any[]
  onCloseUrl: string
  defaultHourlyRate: number
}

export function LessonDialogWrapper({
  lesson,
  students,
  subjects,
  onCloseUrl,
  defaultHourlyRate,
}: LessonDialogWrapperProps) {
  const router = useRouter()

  const handleClose = () => {
    router.push(onCloseUrl)
  }

  return (
    <LessonDialog
      isOpen={true}
      onClose={handleClose}
      students={students}
      subjects={subjects}
      editingLesson={lesson}
      defaultHourlyRate={defaultHourlyRate}
    />
  )
}
