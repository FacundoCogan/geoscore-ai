"use client"

import { useState } from "react"
import { BookOpen, Dumbbell, Heart, Bus, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type LifestyleProfile = "estudiante" | "fitness" | "salud" | "movilidad"

const PROFILES = [
  {
    id: "estudiante",
    title: "Estudiante",
    icon: BookOpen,
    description: "Prioriza inmuebles cercanos a la red de universidades de la Ciudad.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    activeBorder: "border-blue-500 ring-1 ring-blue-500",
    benefits: [
      "Cercanía a instituciones educativas",
      "Reducción de tiempos de viaje a la facultad",
      "Entorno académico y estudiantil"
    ],
    pois: ["Universidades Públicas", "Universidades Privadas"]
  },
  {
    id: "fitness",
    title: "Fitness",
    icon: Dumbbell,
    description: "Busca ubicaciones con fácil acceso a la red de espacios verdes públicos para entrenar.",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    activeBorder: "border-green-500 ring-1 ring-green-500",
    benefits: [
      "Proximidad a parques y plazas",
      "Espacios seguros y abiertos para correr",
      "Entornos saludables para recreación"
    ],
    pois: ["Parques", "Plazas", "Espacios Verdes"]
  },
  {
    id: "salud",
    title: "Salud",
    icon: Heart,
    description: "Enfocado en inmuebles con acceso directo a la red de hospitales públicos de la Ciudad.",
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    activeBorder: "border-rose-500 ring-1 ring-rose-500",
    benefits: [
      "Cercanía a hospitales de agudos",
      "Acceso rápido a emergencias médicas",
      "Seguridad sanitaria en el entorno"
    ],
    pois: ["Hospitales Públicos", "Centros de Salud"]
  },
  {
    id: "movilidad",
    title: "Movilidad",
    icon: Bus,
    description: "Prioriza inmuebles con excelente acceso a la red de transporte subterráneo.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    activeBorder: "border-yellow-500 ring-1 ring-yellow-500",
    benefits: [
      "Proximidad a bocas de Subte",
      "Conexión rápida con toda la red",
      "Zonas con alto flujo de transporte público"
    ],
    pois: ["Estaciones de Subte", "Red Ferroviaria"]
  }
]

interface LifestyleProfileFormProps {
  currentProfile: LifestyleProfile | null
  onCancel: () => void
  onSave: (profile: LifestyleProfile) => Promise<void>
}

export function LifestyleProfileForm({ currentProfile, onCancel, onSave }: LifestyleProfileFormProps) {
  const [selected, setSelected] = useState<LifestyleProfile | null>(currentProfile)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!selected) return
    setIsSaving(true)
    try {
      await onSave(selected)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border">
      
      {/* Cabecera */}
      <div className="p-8 border-b bg-slate-50/50">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Mi Perfil de Estilo de Vida</h2>
        <p className="text-slate-600 max-w-3xl leading-relaxed">
          Selecciona tu perfil predominante para personalizar las búsquedas de inmuebles. El sistema priorizará los Puntos de Interés (POIs) reales de BA Data según tu preferencia.
        </p>
      </div>

      {/* Grilla de Opciones */}
      <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
        {PROFILES.map((profile) => {
          const Icon = profile.icon
          const isSelected = selected === profile.id

          return (
            <div 
              key={profile.id}
              onClick={() => setSelected(profile.id as LifestyleProfile)}
              className={cn(
                "relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected ? profile.activeBorder : "border-slate-100 hover:border-slate-300"
              )}
            >
              {/* Check de seleccionado */}
              {isSelected && (
                <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              
              {/* Encabezado Tarjeta */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-2.5 rounded-xl", profile.bgColor)}>
                  <Icon className={cn("h-6 w-6", profile.color)} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{profile.title}</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-5">{profile.description}</p>
              
              <div className="mb-5 flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Beneficios:</h4>
                <ul className="space-y-2">
                  {profile.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", profile.bgColor, profile.color.replace('text-', 'bg-'))} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">POIs Priorizados:</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.pois.map((poi, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {poi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer de Acciones */}
      <div className="p-6 border-t bg-slate-50 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSaving} className="gap-2">
          <X className="h-4 w-4" /> Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!selected || isSaving} className="min-w-[140px]">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...
            </>
          ) : (
            "Guardar Perfil"
          )}
        </Button>
      </div>
    </div>
  )
}