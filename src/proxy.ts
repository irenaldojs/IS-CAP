import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Ignorar chamadas de API do NextAuth ou rotas gerais de API
  if (pathname.startsWith('/api')) {
    return
  }

  // Páginas públicas de autenticação
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  // Se for página de login/registro e já estiver logado, manda para o dashboard
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Se não estiver logado e não for página de autenticação, redireciona para login
  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  // Protege todas as rotas exceto arquivos estáticos, imagens e APIs
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
