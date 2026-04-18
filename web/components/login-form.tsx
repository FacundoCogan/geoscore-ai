'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSuccess?: () => void
  isModal?: boolean
  onClose?: () => void
}

type ErrorType = null | 'invalid_credentials' | 'account_suspended' | 'validation'

export function LoginForm({ onSuccess, isModal = false, onClose }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorType>(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Validar formato de email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validar que los campos no estén vacíos
  const canSubmit = email.trim() && password.trim() && isValidEmail(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrorMessage('')

    // Validaciones locales
    if (!email.trim() || !password.trim()) {
      setError('validation')
      setErrorMessage('Por favor completa todos los campos')
      return
    }

    if (!isValidEmail(email)) {
      setError('validation')
      setErrorMessage('Por favor ingresa un correo electrónico válido')
      return
    }

    setIsLoading(true)

    try {
      // 1. Llamada real a Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // 2. Manejo de errores de Supabase
      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('invalid_credentials')
          setErrorMessage('Usuario o contraseña incorrectos')
        } else {
          // Si es otro tipo de error (ej. cuenta bloqueada por muchos intentos)
          setError('account_suspended')
          setErrorMessage(authError.message)
        }
        return // Cortamos la ejecución acá
      }

      // 3. ¡Éxito! Tenemos el token
      console.log("Token para Java:", data.session?.access_token)
      
      // Guardamos la sesión como pedía tu código original
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email)
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/')
      }

    } catch (err) {
      setError('validation')
      setErrorMessage('Ocurrió un error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Le agregamos fondo de tarjeta, bordes redondeados grandes (xl), sombra suave y borde sutil
    <div className="w-full bg-card p-8 sm:p-10 rounded-2xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="space-y-8">
        
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-sm text-muted-foreground">
            Ingresá a tu cuenta para acceder a los datos de GeoScore
          </p>
        </div>

        {/* Mostrar errores (queda igual, muy bien resuelto) */}
        {error && (
          <div
            className={cn(
              'rounded-xl border p-4 flex gap-3',
              error === 'invalid_credentials'
                ? 'border-destructive/50 bg-destructive/5'
                : 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20'
            )}
          >
            <AlertCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', error === 'invalid_credentials' ? 'text-destructive' : 'text-amber-600')} />
            <div>
              <p className={cn('text-sm font-medium', error === 'invalid_credentials' ? 'text-destructive' : 'text-amber-800 dark:text-amber-200')}>
                {error === 'invalid_credentials' && 'Credenciales inválidas'}
                {error === 'account_suspended' && 'Cuenta suspendida'}
                {error === 'validation' && 'Error de validación'}
              </p>
              <p className={cn('text-xs mt-1', error === 'invalid_credentials' ? 'text-destructive/80' : 'text-amber-700 dark:text-amber-300')}>
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              disabled={isLoading}
              className="h-11 rounded-lg bg-background"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Contraseña
              </label>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-primary" asChild>
                <Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                disabled={isLoading}
                className="h-11 pr-10 rounded-lg bg-background"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full h-11 text-base font-medium transition-all rounded-lg"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Validando...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Ingresar a GeoScore
              </>
            )}
          </Button>
        </form>

        {/* Enlace a registro */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            ¿No tenés una cuenta?{' '}
            <Button variant="link" size="sm" className="h-auto p-0 font-medium text-primary" asChild>
              <Link href="/registrarse">Solicitá acceso</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
