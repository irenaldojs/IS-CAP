'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().optional().or(z.literal('')),
  confirmNewPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  // Se preencher a nova senha, precisa preencher a atual e a confirmação
  if (data.newPassword) {
    return !!data.currentPassword && !!data.confirmNewPassword
  }
  return true
}, {
  message: 'Preencha a senha atual e a confirmação para alterar a senha',
  path: ['currentPassword'],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false
  }
  return true
}, {
  message: 'As novas senhas não coincidem',
  path: ['confirmNewPassword'],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length < 6) {
    return false
  }
  return true
}, {
  message: 'A nova senha deve ter pelo menos 6 caracteres',
  path: ['newPassword'],
})

export async function getUserProfile() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado.' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { error: 'Usuário não encontrado.' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return { error: 'Erro interno do servidor.' }
  }
}

export async function updateUserProfile(formData: z.infer<typeof profileUpdateSchema>) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return { error: 'Não autorizado.' }
    }

    // Validar os dados
    const validatedData = profileUpdateSchema.safeParse(formData)
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message }
    }

    const { name, email, currentPassword, newPassword } = validatedData.data
    const userId = session.user.id

    // Buscar usuário atual no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: 'Usuário não encontrado.' }
    }

    // Verificar se o e-mail mudou e já existe
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser) {
        return { error: 'Este e-mail já está em uso.' }
      }
    }

    const updateData: { name: string; email: string; passwordHash?: string } = {
      name,
      email,
    }

    // Se estiver atualizando a senha
    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isPasswordValid) {
        return { error: 'A senha atual está incorreta.' }
      }

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10)
      updateData.passwordHash = await bcrypt.hash(newPassword, salt)
    }

    // Salvar alterações
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error)
    return { error: 'Erro ao salvar alterações.' }
  }
}
