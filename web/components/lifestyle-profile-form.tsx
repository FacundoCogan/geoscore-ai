'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, BookOpen, Dumbbell, Heart, Navigation, CheckCircle2, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export type LifestyleProfile = 'student' | 'fitness' | 'health' | 'mobility'

interface LifestyleProfileFormProps {
  currentProfile?: LifestyleProfile | null
  onSave?: (profile: LifestyleProfile) => Promise<void> | void
  onCancel?: () => void
}

const profiles = {
  student: {
    name: 'Estudiante',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-300',
    description: 'Prioriza inmuebles cercanos a universidades, bibliotecas y espacios de estudio.',
    benefits: [
      'Cercanía a instituciones educativas',
      'Acceso a transportes universitarios',
      'Zonas seguras y tranquilas',
      'Proximidad a cafeterías y espacios sociales',
    ],
    pois: ['Universidades', 'Bibliotecas', 'Escuelas', 'Centros de estudio'],
  },
  fitness: {
    name: 'Fitness',
    icon: Dumbbell,
    color: 'bg-red-100 text-red-700',
    borderColor: 'border-red-300',
    description: 'Busca ubicaciones con fácil acceso a gimnasios, parques y espacios para entrenar.',
    benefits: [
      'Proximidad a gimnasios y estudios de fitness',
      'Parques y zonas verdes para ejercicio',
      'Espacios seguros para correr',
      'Acceso a piscinas y complejos deportivos',
    ],
    pois: ['Gimnasios', 'Parques', 'Piscinas', 'Canchas deportivas'],
  },
  health: {
    name: 'Salud',
    icon: Heart,
    color: 'bg-pink-100 text-pink-700',
    borderColor: 'border-pink-300',
    description: 'Enfocado en inmuebles con acceso a servicios médicos, farmacias y espacios de bienestar.',
    benefits: [
      'Cercanía a hospitales y clínicas',
      'Acceso rápido a farmacias',
      'Espacios verdes para bienestar',
      'Servicios de salud integral',
    ],
    pois: ['Hospitales', 'Clínicas', 'Farmacias', 'Centros de salud'],
  },
  mobility: {
    name: 'Movilidad',
    icon: Navigation,
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-300',
    description: 'Prioriza inmuebles con excelente acceso a transporte público y opciones de desplazamiento.',
    benefits: [
      'Proximidad a estaciones de transporte',
      'Múltiples opciones de colectivos',
      'Acceso a estaciones de tren/subte',
      'Zonas con buen flujo de tránsito',
    ],
    pois: ['Estaciones', 'Paradas de colectivo', 'Ciclovías', 'Estacionamientos'],
  },
}

export function LifestyleProfileForm({
  currentProfile,
  onSave,
  onCancel,
}: LifestyleProfileFormProps) {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<LifestyleProfile | null>(currentProfile || null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    if (!selectedProfile) return

    setIsLoading(true)
    
    try {
      if (onSave) {
        await onSave(selectedProfile)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
      
      setShowSuccess(true)
      
      setTimeout(() => {
        if (onCancel) onCancel() // Cerramos el formulario si es un modal
        router.push('/')
      }, 1500)
      
    } catch (error) {
      console.error("Error al guardar el perfil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil de Estilo de Vida</h1>
        <p className="text-muted-foreground">
          Selecciona tu perfil predominante para personalizar las búsquedas de inmuebles. El sistema priorizará los Puntos de Interés (POIs) según tu preferencia.
        </p>
      </div>

      {currentProfile && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            Tu perfil actual es <strong>{profiles[currentProfile].name}</strong>. Puedes cambiar esta configuración en cualquier momento.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(profiles) as [LifestyleProfile, typeof profiles[LifestyleProfile]][]).map(
          ([key, profile]) => {
            const Icon = profile.icon
            const isSelected = selectedProfile === key
            const isCurrent = currentProfile === key

            return (
              <div
                key={key}
                onClick={() => setSelectedProfile(key)}
                className={`cursor-pointer transition-all ${
                  isSelected || isCurrent ? 'ring-2 ring-primary' : ''
                }`}
              >
                <Card
                  className={`h-full hover:shadow-lg transition-shadow ${
                    isCurrent ? `border-2 ${profile.borderColor}` : ''
                  } ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${profile.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-xl">{profile.name}</CardTitle>
                        </div>
                        {isCurrent && (
                          <Badge className="w-fit">Perfil Actual</Badge>
                        )}
                      </div>
                      {isSelected && (
                        <div className="text-primary">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {profile.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">
                        Beneficios:
                      </p>
                      <ul className="space-y-1">
                        {profile.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">
                        POIs Priorizados:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {profile.pois.map((poi) => (
                          <Badge key={poi} variant="secondary" className="text-xs">
                            {poi}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          }
        )}
      </div>

      {showSuccess && (
        <Alert className="border-green-200 bg-green-50 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            ¡Perfil actualizado exitosamente! Redirigiéndote a la búsqueda de inmuebles...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!selectedProfile || isLoading || showSuccess}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Perfil'
          )}
        </Button>
      </div>
    </div>
  )
}