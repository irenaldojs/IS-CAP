'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', Object.fromEntries(formData))
    return undefined
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciais inválidas. Verifique seu email e senha.'
        default:
          return 'Ocorreu um erro no login. Tente novamente.'
      }
    }
    throw error
  }
}

export async function registerUser(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!name || !email || !password || !confirmPassword) {
      return { error: 'Preencha todos os campos obrigatórios.' }
    }

    if (password !== confirmPassword) {
      return { error: 'As senhas não coincidem.' }
    }

    if (password.length < 6) {
      return { error: 'A senha deve ter pelo menos 6 caracteres.' }
    }

    // Verificar se o email já está cadastrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'Este e-mail já está cadastrado.' }
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar o usuário
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Erro no registro:', error)
    return { error: 'Ocorreu um erro no cadastro. Tente novamente.' }
  }
}

