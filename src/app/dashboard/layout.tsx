import React from 'react'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Se por acaso passar do middleware e não estiver logado, redireciona de fallback
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground dark">
      {/* Barra Lateral (Sidebar) */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar / Header */}
        <Header />

        {/* Corpo da página com scroll independente */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
