"use client"

import React, { useState, useEffect } from "react"
import { X, Loader2, User, Mail, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserProfile } from "@/actions/profile"

interface UserProfileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileDialog({ isOpen, onClose }: UserProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<{ name: string; email: string; createdAt: Date | string } | null>(null)

  // Carregar os dados do perfil quando abrir a dialog
  useEffect(() => {
    if (!isOpen) return

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getUserProfile()
        if (response.success && response.user) {
          setUserData({
            name: response.user.name,
            email: response.user.email,
            createdAt: response.user.createdAt,
          })
        } else {
          toast.error(response.error || "Erro ao carregar perfil.")
          onClose()
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error)
        toast.error("Erro ao carregar perfil.")
        onClose()
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [isOpen, onClose])

  // Suporte a fechar modal com tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Format date helper
  const formatDate = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return ""
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Invisible backdrop to catch clicks outside the popover */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />

      {/* Popover Panel */}
      <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-slate-200 z-50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-955/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <User className="size-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-white">Meu Perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-indigo-500" />
            <span className="text-xs font-medium">Carregando perfil...</span>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Visual Header */}
            <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-slate-800/40">
              <div className="flex size-12 items-center justify-center rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-lg font-bold shadow-inner mb-2">
                {userData?.name ? userData.name.substring(0, 2).toUpperCase() : <User className="size-6" />}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">{userData?.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{userData?.email}</p>
            </div>

            <div className="space-y-3">
              {/* Nome */}
              <div className="space-y-1">
                <Label htmlFor="profile-name" className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  Nome do Usuário
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="size-3.5" />
                  </span>
                  <Input
                    id="profile-name"
                    value={userData?.name || ""}
                    disabled
                    className="bg-slate-950/40 border-slate-800/80 text-slate-300 pl-9 pr-3 py-1 h-8 text-xs cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="profile-email" className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  Endereço de E-mail
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="size-3.5" />
                  </span>
                  <Input
                    id="profile-email"
                    value={userData?.email || ""}
                    disabled
                    className="bg-slate-950/40 border-slate-800/80 text-slate-300 pl-9 pr-3 py-1 h-8 text-xs cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Membro Desde */}
              {userData?.createdAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 pl-0.5">
                  <Calendar className="size-3.5 text-slate-500" />
                  <span>Conta criada em {formatDate(userData.createdAt)}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end border-t border-slate-800/60 pt-3 mt-1">
              <Button
                type="button"
                onClick={onClose}
                size="sm"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer w-full text-xs h-8"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
