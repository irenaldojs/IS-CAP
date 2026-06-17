"use client"

import React, { useState, useRef, useEffect } from "react"
import { Bell, Check, Trash2, BellOff, Info, Calendar, DollarSign, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "calendar" | "finance" | "material"
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Novo aluno cadastrado",
    description: "Ana Carolina completou a matrícula hoje.",
    time: "5 min atrás",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "Aula agendada",
    description: "Aula experimental com Carlos amanhã às 14h.",
    time: "2 horas atrás",
    type: "calendar",
    read: false,
  },
  {
    id: "3",
    title: "Pagamento recebido",
    description: "Mensalidade de Letícia foi confirmada.",
    time: "1 dia atrás",
    type: "finance",
    read: true,
  },
  {
    id: "4",
    title: "Material atualizado",
    description: "Novos slides de Álgebra foram adicionados.",
    time: "2 dias atrás",
    type: "material",
    read: true,
  },
]

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const toggleDropdown = () => setIsOpen(!isOpen)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "calendar":
        return <Calendar className="size-4 text-blue-500" />
      case "finance":
        return <DollarSign className="size-4 text-green-500" />
      case "material":
        return <BookOpen className="size-4 text-purple-500" />
      default:
        return <Info className="size-4 text-amber-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className={cn(
          "relative rounded-full h-9 w-9 transition-colors",
          isOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Notificações"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl border border-border bg-popover text-popover-foreground shadow-lg focus:outline-none z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold text-sm">Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Check className="size-3.5" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border scrollbar-thin">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group/item",
                    !n.read && "bg-muted/20"
                  )}
                >
                  {/* Icon Wrapper */}
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border shadow-xs">
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1 pr-6">
                    <div className="flex items-start justify-between">
                      <p className={cn("text-xs font-semibold leading-none text-foreground", !n.read && "font-bold text-primary")}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                  </div>

                  {/* Actions (hover) */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="text-muted-foreground hover:text-destructive h-7 w-7 rounded-md"
                      title="Excluir"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {/* Dot status indicator */}
                  {!n.read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <BellOff className="size-8 stroke-1 mb-2 text-muted-foreground/60" />
                <p className="text-xs font-medium">Nenhuma notificação</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">Tudo limpo por aqui!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 text-center bg-muted/10 rounded-b-xl">
            <span className="text-[10px] text-muted-foreground">
              Você tem {unreadCount} {unreadCount === 1 ? "alerta pendente" : "alertas pendentes"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
