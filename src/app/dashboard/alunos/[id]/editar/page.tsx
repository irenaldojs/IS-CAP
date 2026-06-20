import { notFound } from 'next/navigation'
import { getStudentById } from '@/actions/students'
import { StudentEditForm } from './student-edit-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAlunoPage({ params }: PageProps) {
  const resolvedParams = await params
  const student = await getStudentById(resolvedParams.id)

  if (!student) {
    notFound()
  }

  // Mapeamos para passar tipos primitivos limpos para o Client Component
  const studentData = {
    id: student.id,
    name: student.name,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    email: student.email,
    phone: student.phone,
    school: student.school,
    age: student.age,
    gradeLevel: student.gradeLevel,
    notes: student.notes,
    fixedScheduleActive: student.fixedScheduleActive,
    fixedScheduleDay: student.fixedScheduleDay,
    fixedScheduleTime: student.fixedScheduleTime,
    fixedSchedulePrice: student.fixedSchedulePrice,
    fixedScheduleTemporarilyDisabled: student.fixedScheduleTemporarilyDisabled,
  }

  return <StudentEditForm student={studentData} />
}
