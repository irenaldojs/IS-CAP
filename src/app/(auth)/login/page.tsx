'use client'

import { useActionState } from 'react'
import { authenticate } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GraduationCap, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4">
      {/* Decorações do fundo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white">
            IS-CAP
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Sistema de Controle de Aulas Particulares
          </CardDescription>
        </CardHeader>

        <form action={dispatch}>
          <CardContent className="space-y-4 pt-4">
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Endereço de E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="professor@iscap.com"
                required
                className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Senha de Acesso
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-slate-950/50 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 py-6 text-sm font-semibold transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando no sistema...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <div className="text-xs text-slate-500 text-center">
              Acesso exclusivo para professores autorizados.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
