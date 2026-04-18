'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

interface RequestPasswordResetProps {
  onSubmit: (email: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function RequestPasswordReset({ onSubmit, onCancel, isLoading = false }: RequestPasswordResetProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isFormValid = isValidEmail && email.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    if (!isFormValid) {
      setError('Por favor ingresá un correo electrónico válido')
      return
    }

    onSubmit(email)
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-border/50">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresá el correo asociado a tu cuenta. Te enviaremos un enlace para restablecerla.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    onBlur={() => { setTouched(true); setError(''); }}
                    disabled={isLoading}
                    className="pl-10 h-11 bg-background rounded-lg"
                    autoComplete="email"
                  />
                </div>
                {touched && !isValidEmail && email.length > 0 && (
                  <p className="text-xs text-destructive mt-1">Formato de correo inválido</p>
                )}
                {error && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1 p-2 bg-destructive/5 rounded border border-destructive/20">
                    ⚠ {error}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full h-11 text-base" disabled={!isFormValid || isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar enlace'}
              </Button>

              <Button type="button" variant="outline" className="w-full h-11" disabled={isLoading} onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a inicio de sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        ¿No tenés cuenta?{' '}
        <Link href="/registrarse" className="text-primary hover:underline font-medium">Regístrate acá</Link>
      </p>
    </div>
  )
}