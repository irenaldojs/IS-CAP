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
    hourlyRate: student.hourlyRate,
    promotion: student.promotion,
    fixedScheduleActive: student.fixedScheduleActive,
    fixedScheduleDay: student.fixedScheduleDay,
    fixedScheduleTime: student.fixedScheduleTime,
    fixedSchedulePrice: student.fixedSchedulePrice,
    fixedScheduleTemporarilyDisabled: student.fixedScheduleTemporarilyDisabled,
    subjectIds: student.subjects.map(s => s.subjectId),
    recurringSchedules: student.recurringSchedules.map(r => ({
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      value: r.value,
      subjectId: r.subjectId
    })),
  }

  return <StudentEditForm student={studentData} />
}
