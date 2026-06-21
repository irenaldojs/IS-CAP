import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Limpar dados anteriores em ordem para evitar erros de chaves estrangeiras
  await prisma.grade.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.package.deleteMany()
  await prisma.recurringSchedule.deleteMany()
  await prisma.studentSubject.deleteMany()
  await prisma.student.deleteMany()
  await prisma.material.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.user.deleteMany()

  // Criar professor
  const passwordHash = await bcrypt.hash('24160704', 10)
  const teacher = await prisma.user.create({
    data: {
      name: 'Marcelle Lemos',
      email: 'marcellelemos.mrl@gmail.com',
      passwordHash,
    },
  })

  console.log(`Usuário criado: ${teacher.name} (${teacher.email})`)

  // Criar disciplinas padrão
  const subjects = [
    { name: 'Matemática', color: '#3b82f6' }, // Blue
    { name: 'Física', color: '#ef4444' },      // Red
    { name: 'Química', color: '#10b981' },     // Green
    { name: 'Português', color: '#f59e0b' },   // Amber
    { name: 'História', color: '#8b5cf6' },    // Violet
  ]

  for (const subject of subjects) {
    await prisma.subject.create({
      data: {
        userId: teacher.id,
        name: subject.name,
        color: subject.color,
      },
    })
  }

  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Conexão do adapter é fechada internamente no fim do processo ou garbage collected
  })
