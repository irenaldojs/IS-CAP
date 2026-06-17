"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { LogOut, User, Loader2 } from "lucide-react"
import NotificationBell from "./notification-bell"
import { Button } from "@/components/ui/button"

export default function Header() {
  const { data: session, status } = useSession()

  // Nome do professor ou fallback para "Professor"
  const professorName = session?.user?.name || "Professor"
  const professorEmail = session?.user?.email || "professor@is-cap.com.br"

  // Obter iniciais para o Avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-xs select-none">
      {/* Seção Esquerda (Placeholder de título da página / Breadcrumb) */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground hidden sm:inline-block">
          Área do Professor
        </h2>
      </div>

      {/* Seção Direita */}
      <div className="flex items-center gap-4">
        {/* Componente do Sino de Notificações */}
        <NotificationBell />

        <div className="h-6 w-px bg-border" />

        {/* Perfil do Professor */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="flex items-center justify-center size-8 rounded-full border border-border">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Avatar do Usuário */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-xs">
                {session?.user?.name ? (
                  getInitials(session.user.name)
                ) : (
                  <User className="size-4" />
                )}
              </div>

              {/* Informações de Texto */}
              <div className="hidden flex-col text-left md:flex">
                <span className="text-xs font-semibold text-foreground leading-tight">
                  {professorName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  {professorEmail}
                </span>
              </div>
            </div>
          )}

          {/* Botão de Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-full transition-colors ml-1"
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
