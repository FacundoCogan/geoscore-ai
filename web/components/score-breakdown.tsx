'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Dumbbell, Bus, Heart, AlertTriangle, Info } from 'lucide-react'
import { calculateDynamicScore, type Profile, type Category } from '@/lib/geo-score-engine'

interface ScoreBreakdownProps {
  pois: any[]
  userProfile: Profile
}

const CATEGORY_UI = {
  educacion: { icon: GraduationCap, label: 'Educación', color: 'bg-blue-500', text: 'text-blue-500' },
  deporte: { icon: Dumbbell, label: 'Deporte', color: 'bg-green-500', text: 'text-green-500' },
  transporte: { icon: Bus, label: 'Transporte', color: 'bg-amber-500', text: 'text-amber-500' },
  salud: { icon: Heart, label: 'Salud', color: 'bg-red-500', text: 'text-red-500' },
}

export function ScoreBreakdown({ pois, userProfile }: ScoreBreakdownProps) {
  
  const result = useMemo(() => {
    return calculateDynamicScore(pois, userProfile)
  }, [pois, userProfile])

  // CU-09 A2: Reacción orgánica al error del motor (si el motor falla, devuelve finalScore 1)
  if (result.finalScore === 1) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3 opacity-80" />
          <p className="font-semibold text-destructive mb-1">Error de cálculo (CU-09)</p>
          <p className="text-sm text-muted-foreground">El sistema no pudo procesar los pesos dinámicos. Se ha asignado el puntaje base temporalmente.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-slate-800">Desglose del GeoScore</CardTitle>
          <div className="text-right">
            <span className="text-3xl font-black text-primary">{result.finalScore}</span>
            <span className="text-sm text-muted-foreground font-medium">/100</span>
          </div>
        </div>
        {/* CU-09 A1: Mensaje orgánico si el usuario es visitante (perfil null) */}
        {!userProfile && (
          <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            <Info className="h-4 w-4" />
            Ponderación neutra. Iniciá sesión y configurá tu perfil para resultados precisos.
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-5 space-y-5">
        {(Object.keys(CATEGORY_UI) as Category[]).map((cat) => {
          const ui = CATEGORY_UI[cat]
          const Icon = ui.icon
          const weight = result.weightsApplied[cat] * 100
          const score = result.weightedScores[cat]
          
          return (
            <div key={cat} className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md bg-slate-100`}>
                    <Icon className={`h-4 w-4 ${ui.text}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{ui.label}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Peso: {weight}% 
                      {weight > 25 && <span className="text-primary ml-1">(Prioridad)</span>}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  +{Math.round(score)} pts
                </span>
              </div>
              <Progress value={result.rawScores[cat]} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}