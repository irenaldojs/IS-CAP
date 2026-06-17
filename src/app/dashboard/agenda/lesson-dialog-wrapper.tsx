'use client'

import { LessonDialog } from './lesson-dialog'
import { useRouter } from 'next/navigation'

interface LessonDialogWrapperProps {
  lesson: any
  students: any[]
  subjects: any[]
  onCloseUrl: string
}

export function LessonDialogWrapper({
  lesson,
  students,
  subjects,
  onCloseUrl,
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
    />
  )
}
