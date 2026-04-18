"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Map } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()

  // Agregamos este bloque para verificar la sesión apenas carga la página
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Si ya hay sesión activa, lo mandamos al inicio
        router.push("/") 
      }
    }
    
    checkSession()
  }, [router])

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      
      {/* Header flotante tipo "glassmorphism" */}
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

      {/* Contenedor centrado */}
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)] p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="py-6 text-center text-xs text-muted-foreground/60">
        <p>© 2026 GeoScore AI. Trabajo de Campo - Ingeniería Informática.</p>
      </div>
    </div>
  )
}