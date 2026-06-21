"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Loader2, User, Key, Mail, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserProfile, updateUserProfile } from "@/actions/profile"
import { useRouter } from "next/navigation"

const profileFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().optional().or(z.literal("")),
  confirmNewPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.newPassword) {
    return !!data.currentPassword && !!data.confirmNewPassword
  }
  return true
}, {
  message: "Preencha a senha atual e a confirmação para alterar a senha",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false
  }
  return true
}, {
  message: "As novas senhas não coincidem",
  path: ["confirmNewPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length < 6) {
    return false
  }
  return true
}, {
  message: "A nova senha deve ter pelo menos 6 caracteres",
  path: ["newPassword"],
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface UserProfileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileDialog({ isOpen, onClose }: UserProfileDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  // Carregar os dados do perfil quando abrir a dialog
  useEffect(() => {
    if (!isOpen) return

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getUserProfile()
        if (response.success && response.user) {
          reset({
            name: response.user.name,
            email: response.user.email,
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          })
          setShowPasswordFields(false)
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
  }, [isOpen, reset, onClose])

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

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await updateUserProfile(values)
      if (result.success) {
        toast.success("Perfil atualizado com sucesso!")
        onClose()
        router.refresh() // Forçar atualização do Next.js Server Components
      } else {
        toast.error(result.error || "Erro ao atualizar perfil.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro ao salvar as alterações.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-955/80 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Dialog Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="size-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-white">Editar Perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Carregando dados do usuário...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {/* Nome */}
              <div className="space-y-1">
                <Label htmlFor="profile-name" className="text-slate-300">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="size-4" />
                  </span>
                  <Input
                    id="profile-name"
                    placeholder="Seu nome"
                    className="bg-slate-950 border-slate-800 text-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="profile-email" className="text-slate-300">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="size-4" />
                  </span>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    className="bg-slate-950 border-slate-800 text-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Checkbox Alterar Senha */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPasswordFields}
                    onChange={(e) => {
                      setShowPasswordFields(e.target.checked)
                      if (!e.target.checked) {
                        reset({
                          ...errors,
                          currentPassword: "",
                          newPassword: "",
                          confirmNewPassword: "",
                        } as any)
                      }
                    }}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-300">Alterar senha de acesso</span>
                </label>
              </div>

              {/* Seção Alterar Senha */}
              {showPasswordFields && (
                <div className="space-y-4 border-t border-slate-800/60 pt-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Senha Atual */}
                  <div className="space-y-1">
                    <Label htmlFor="profile-current-password" className="text-slate-300">
                      Senha Atual <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Key className="size-4" />
                      </span>
                      <Input
                        id="profile-current-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-950 border-slate-800 text-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                        {...register("currentPassword")}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="text-xs text-red-400 mt-1">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  {/* Nova Senha */}
                  <div className="space-y-1">
                    <Label htmlFor="profile-new-password" className="text-slate-300">
                      Nova Senha <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Key className="size-4" />
                      </span>
                      <Input
                        id="profile-new-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="bg-slate-950 border-slate-800 text-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                        {...register("newPassword")}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div className="space-y-1">
                    <Label htmlFor="profile-confirm-new-password" className="text-slate-300">
                      Confirmar Nova Senha <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Key className="size-4" />
                      </span>
                      <Input
                        id="profile-confirm-new-password"
                        type="password"
                        placeholder="Repita a nova senha"
                        className="bg-slate-950 border-slate-800 text-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                        {...register("confirmNewPassword")}
                      />
                    </div>
                    {errors.confirmNewPassword && (
                      <p className="text-xs text-red-400 mt-1">{errors.confirmNewPassword.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-955/40 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
