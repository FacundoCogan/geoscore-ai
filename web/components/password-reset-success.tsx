'use client'

import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PasswordResetSuccess() {
  return (
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-border/50 text-center">
      <CardHeader className="space-y-4 pb-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold tracking-tight">¡Contraseña actualizada!</CardTitle>
          <CardDescription className="mt-2">
            Tu clave ha sido restablecida exitosamente.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-left">
          <h3 className="font-medium text-foreground mb-2">Próximos pasos:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Iniciá sesión con tu nueva contraseña.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Accedé a tu perfil y personalizá tus métricas.
            </li>
          </ul>
        </div>

        <Button asChild className="w-full h-11 text-base">
          <Link href="/login" className="flex items-center justify-center">
            Ir a Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}