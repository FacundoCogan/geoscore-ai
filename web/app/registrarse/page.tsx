"use client"

import { useState, useEffect } from "react" 
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Map, CheckCircle, ArrowRight } from "lucide-react"
import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase" 

export default function RegistrarsePage() {
  const router = useRouter()
  const [registeredUser, setRegisteredUser] = useState<{ name: string; email: string } | null>(null)

  // Verificamos si ya está logueado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/") 
      }
    }
    checkSession()
  }, [router])

  // CU-03 Paso 8: Registro exitoso - mostrar confirmación y redirigir a perfil
  const handleRegisterSuccess = (user: { name: string; email: string }) => {
    setRegisteredUser(user)
  }

  // CU-03 A0: Cancelar y volver al inicio
  const handleCancel = () => {
    router.push("/")
  }

  // Navegar a login
  const handleNavigateToLogin = () => {
    router.push("/login")
  }

  // Continuar a configuración de perfil (CU-06)
  const handleContinueToProfile = () => {
    // Por ahora redirige al login para que el usuario inicie sesión por primera vez
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col">
      {/* Header minimalista tipo glassmorphism */}
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
      <main className="flex-1 flex items-center justify-center p-4">
        {registeredUser ? (
          // Pantalla de éxito post-registro
          <Card className="w-full max-w-md mx-auto shadow-xl text-center border-border/50">
            <CardHeader className="space-y-4 pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                ¡Cuenta creada exitosamente!
              </CardTitle>
              <CardDescription className="text-base">
                Bienvenido/a, {registeredUser.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Tu cuenta ha sido registrada con el correo{" "}
                <span className="font-medium text-foreground">{registeredUser.email}</span>
              </p>

              <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-left">
                <h3 className="font-medium mb-2">Próximos pasos:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    Configurá tu perfil de vida para métricas personalizadas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Guardá tus ubicaciones favoritas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    Explorá el mapa y calculá el score de entorno
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleContinueToProfile} className="w-full h-11">
                  Ir a Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Formulario de registro
          <div className="w-full max-w-md">
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onNavigateToLogin={handleNavigateToLogin}
              onCancel={handleCancel}
            />

            {/* Beneficios de registrarse */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p className="mb-3">Al registrarte en GeoScore podrás:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-background border border-border/50 shadow-sm rounded-full text-xs">Guardar favoritos</span>
                <span className="px-3 py-1 bg-background border border-border/50 shadow-sm rounded-full text-xs">Historial de análisis</span>
                <span className="px-3 py-1 bg-background border border-border/50 shadow-sm rounded-full text-xs">Perfil predictivo</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer simple */}
      <div className="py-6 text-center text-xs text-muted-foreground/60">
        <p>© 2026 GeoScore AI. Trabajo de Campo - Ingeniería Informática.</p>
      </div>
    </div>
  )
}