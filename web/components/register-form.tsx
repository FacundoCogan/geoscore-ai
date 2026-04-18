"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase" // <-- Importamos Supabase
import { Eye, EyeOff, Check, X, Mail, User, Lock, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RegisterFormProps {
  onRegisterSuccess?: (user: { name: string; email: string }) => void
  onNavigateToLogin?: () => void
  onCancel?: () => void
}

interface FormData {
  nombre: string
  email: string
  password: string
  confirmPassword: string
}

interface ValidationState {
  nombre: { valid: boolean; message: string }
  email: { valid: boolean; message: string }
  password: { valid: boolean; message: string; requirements: PasswordRequirements }
  confirmPassword: { valid: boolean; message: string }
}

interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
}

// Validar formato de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar requisitos de contraseña
function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
}

function isPasswordValid(requirements: PasswordRequirements): boolean {
  return requirements.minLength && requirements.hasUppercase && requirements.hasNumber
}

export function RegisterForm({
  onRegisterSuccess,
  onNavigateToLogin,
  onCancel,
}: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    nombre: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Validación en tiempo real
  const validation: ValidationState = {
    nombre: {
      valid: formData.nombre.trim().length >= 2,
      message: formData.nombre.trim().length === 0 ? "El nombre es requerido" : formData.nombre.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
    },
    email: {
      valid: isValidEmail(formData.email),
      message: formData.email.length === 0 ? "El correo electrónico es requerido" : !isValidEmail(formData.email) ? "Formato inválido" : "",
    },
    password: {
      valid: isPasswordValid(checkPasswordRequirements(formData.password)),
      message: formData.password.length === 0 ? "La contraseña es requerida" : "",
      requirements: checkPasswordRequirements(formData.password),
    },
    confirmPassword: {
      valid: formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword,
      message: formData.confirmPassword.length === 0 ? "Debe confirmar la contraseña" : formData.password !== formData.confirmPassword ? "Las contraseñas no coinciden" : "",
    },
  }

  const isFormValid = validation.nombre.valid && validation.email.valid && validation.password.valid && validation.confirmPassword.valid

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }, [])

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({
      nombre: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (!isFormValid) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // 1. Llamada real a Supabase para registrar usuario
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nombre, // Guardamos el nombre en los metadatos de Supabase
          }
        }
      })

      if (signUpError) {
        // Manejo de errores comunes de Supabase
        if (signUpError.message.includes('already registered') || signUpError.status === 422) {
          setSubmitError("El correo electrónico ya está en uso")
        } else {
          setSubmitError(signUpError.message)
        }
        setIsSubmitting(false)
        return
      }

      // Registro exitoso
      setIsSubmitting(false)
      onRegisterSuccess?.({ name: formData.nombre, email: formData.email })

    } catch (err) {
      setSubmitError("Ocurrió un error al intentar conectar con el servidor.")
      setIsSubmitting(false)
    }
  }

  // Componente de indicador de validación
  const ValidationIndicator = ({ isValid, show }: { isValid: boolean; show: boolean }) => {
    if (!show) return null
    return isValid ? (
      <Check className="h-4 w-4 text-primary" />
    ) : (
      <X className="h-4 w-4 text-destructive" />
    )
  }

  // Componente de requisito de contraseña
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={cn("flex items-center gap-2 text-xs", met ? "text-primary" : "text-muted-foreground")}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  )

  return (
    <Card className="w-full max-w-md mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-border/50">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-2xl font-semibold tracking-tight">Crear Cuenta</CardTitle>
        <CardDescription>
          Ingresá tus datos para acceder a GeoScore AI
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {submitError && (
            <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">{submitError}</p>
                {submitError.includes("ya está en uso") && (
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-primary hover:underline mt-1 font-medium"
                  >
                    Ir a Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium leading-none">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                className={cn("pl-10 pr-10 h-11 bg-background rounded-lg", touched.nombre && !validation.nombre.valid && "border-destructive focus-visible:ring-destructive")}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationIndicator isValid={validation.nombre.valid} show={touched.nombre && formData.nombre.length > 0} />
              </div>
            </div>
            {touched.nombre && !validation.nombre.valid && <p className="text-xs text-destructive">{validation.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={cn("pl-10 pr-10 h-11 bg-background rounded-lg", touched.email && !validation.email.valid && "border-destructive focus-visible:ring-destructive")}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationIndicator isValid={validation.email.valid} show={touched.email && formData.email.length > 0} />
              </div>
            </div>
            {touched.email && !validation.email.valid && <p className="text-xs text-destructive">{validation.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={cn("pl-10 pr-20 h-11 bg-background rounded-lg", touched.password && !validation.password.valid && "border-destructive focus-visible:ring-destructive")}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <ValidationIndicator isValid={validation.password.valid} show={touched.password && formData.password.length > 0} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting} className="p-1 hover:bg-muted rounded text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {(touched.password || formData.password.length > 0) && (
              <div className="space-y-1.5 mt-3 p-3 bg-muted/30 border border-border/50 rounded-lg">
                <p className="text-xs font-medium text-foreground/80 mb-2">Requisitos de seguridad:</p>
                <PasswordRequirement met={validation.password.requirements.minLength} text="Mínimo 8 caracteres" />
                <PasswordRequirement met={validation.password.requirements.hasUppercase} text="Al menos una mayúscula" />
                <PasswordRequirement met={validation.password.requirements.hasNumber} text="Al menos un número" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirmar contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repetí tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                className={cn("pl-10 pr-20 h-11 bg-background rounded-lg", touched.confirmPassword && !validation.confirmPassword.valid && "border-destructive focus-visible:ring-destructive")}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <ValidationIndicator isValid={validation.confirmPassword.valid} show={touched.confirmPassword && formData.confirmPassword.length > 0} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isSubmitting} className="p-1 hover:bg-muted rounded text-muted-foreground">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {touched.confirmPassword && !validation.confirmPassword.valid && <p className="text-xs text-destructive">{validation.confirmPassword.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" className="w-full h-11 text-base font-medium rounded-lg" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
            ) : "Crear Cuenta"}
          </Button>

          <div className="flex items-center justify-between w-full text-sm pt-2">
            <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Volver
            </button>
            <button type="button" onClick={onNavigateToLogin} className="text-primary hover:underline font-medium">
              Ya tengo cuenta
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}