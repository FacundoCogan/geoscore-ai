'use client'

import { useState, useEffect } from 'react'
import { Map } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { RequestPasswordReset } from '@/components/request-password-reset'
import { ResetPasswordForm } from '@/components/reset-password-form'
import { PasswordResetSuccess } from '@/components/password-reset-success'

type RecoveryStep = 'request' | 'email-sent' | 'reset' | 'success'

export default function RecuperarContrasenaPage() {
  const [step, setStep] = useState<RecoveryStep>('request')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // CU-05: Detectar si el usuario viene del enlace del correo
  useEffect(() => {
    // 1. Verificación manual por si viene en el hash de la URL (Fallback)
    if (window.location.hash.includes('type=recovery')) {
    setStep('reset')
    }

    // 2. El método oficial de Supabase: Escuchar el evento de recuperación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('reset')
      }
    })

    // Limpiamos el listener cuando el componente se desmonta
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // CU-05: Solicitar envío de email
  const handleRequestReset = async (requestEmail: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(requestEmail, {
      redirectTo: `${window.location.origin}/recuperar-contrasena`,
    })
    setIsLoading(false)

    if (error) {
      alert("Hubo un error: " + error.message)
      return
    }
    
    setEmail(requestEmail)
    setStep('email-sent') // Agregamos este paso intermedio
  }

  // CU-05: Actualizar la contraseña en la base de datos
  const handleResetPassword = async (newPassword: string) => {
    setIsLoading(true)
    // Como el usuario entró por el link, Supabase lo logueó temporalmente para hacer este cambio
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setIsLoading(false)

    if (error) {
      alert("Error al actualizar: " + error.message)
      return
    }

    // Una vez cambiada la contraseña, cerramos la sesión temporal para que se loguee bien
    await supabase.auth.signOut()
    setStep('success')
  }

  const handleCancel = () => {
    setStep('request')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">GeoScore AI</span>
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {step === 'request' && (
            <RequestPasswordReset onSubmit={handleRequestReset} onCancel={handleCancel} isLoading={isLoading} />
          )}

          {step === 'email-sent' && (
            <div className="text-center space-y-4 bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-lg">
              <h2 className="text-2xl font-bold">Revisá tu correo</h2>
              <p className="text-muted-foreground">
                Enviamos un enlace de recuperación a <strong>{email}</strong>. 
                Hacé clic en el enlace del correo para continuar.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                (Si estás probando y no te llega el mail, podés buscar el enlace de recuperación directamente en el dashboard de Supabase).
              </p>
            </div>
          )}

          {step === 'reset' && (
            <ResetPasswordForm onSubmit={(password) => handleResetPassword(password)} onCancel={handleCancel} isLoading={isLoading} />
          )}

          {step === 'success' && (
            <PasswordResetSuccess />
          )}
        </div>
      </div>
    </div>
  )
}