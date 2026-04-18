'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Check, X, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

interface ResetPasswordFormProps {
  onSubmit: (password: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ResetPasswordForm({ onSubmit, onCancel, isLoading = false }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({ password: false, confirm: false })
  const [error, setError] = useState('')

  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isFormValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && !error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden')
      setTouched({ password: true, confirm: true })
      return
    }
    onSubmit(password)
  }

  return (
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-border/50">
      <CardHeader className="space-y-2 pb-6 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Establecer nueva contraseña</CardTitle>
        <CardDescription>Creá una contraseña fuerte para proteger tu cuenta en GeoScore AI.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  disabled={isLoading}
                  className="pl-10 pr-10 h-11 bg-background rounded-lg"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </FieldGroup>

          {touched.password && (
            <div className="space-y-1.5 p-3 bg-muted/30 border border-border/50 rounded-lg">
              <p className="text-xs font-medium text-foreground">Requisitos:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {hasMinLength ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className={hasMinLength ? 'text-foreground' : 'text-muted-foreground'}>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {hasUppercase ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className={hasUppercase ? 'text-foreground' : 'text-muted-foreground'}>Al menos una mayúscula</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {hasNumber ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className={hasNumber ? 'text-foreground' : 'text-muted-foreground'}>Al menos un número</span>
                </div>
              </div>
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirmar contraseña</FieldLabel>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  onBlur={() => setTouched({ ...touched, confirm: true })}
                  disabled={isLoading}
                  className="pl-10 pr-10 h-11 bg-background rounded-lg"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.confirm && confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive mt-1">Las contraseñas no coinciden</p>
              )}
            </Field>
          </FieldGroup>

          {error && <p className="text-xs text-destructive p-2 bg-destructive/5 rounded border border-destructive/20">⚠ {error}</p>}

          <div className="space-y-3 pt-2">
            <Button type="submit" className="w-full h-11" disabled={!isFormValid || isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : 'Actualizar contraseña'}
            </Button>
            <Button type="button" variant="outline" className="w-full h-11" disabled={isLoading} onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}