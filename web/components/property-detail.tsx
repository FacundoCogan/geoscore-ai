"use client"

import { useState } from "react"
import { MapPin, Bed, Bath, Square, Heart, ChevronLeft, ChevronRight, X, Calendar, Building, Compass, Car, Wifi, Wind, Flame, ImageOff, AlertCircle, Share2, TrendingUp, Map as MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { InteractiveMapView } from "./interactive-map"
import { EnvironmentScoreView } from "./environment-score"

export interface PropertyDetail {
  id: string
  titulo: string
  direccion: string
  barrio: string
  precio: number
  ambientes: number
  banos: number
  superficie: number
  superficieCubierta?: number
  imagenes: string[]
  tipoOperacion: "alquiler" | "venta"
  destacado?: boolean
  descripcion: string
  antiguedad: number
  pisos?: number
  orientacion?: string
  cochera?: boolean
  amenities?: string[]
  expensas?: number
  disponible: boolean
}

interface PropertyDetailProps {
  property: PropertyDetail
  isRegisteredUser: boolean
  userProfile?: string | null 
  onClose: () => void
}

export function PropertyDetailView({ property, isRegisteredUser, userProfile = null, onClose }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [showInteractiveMap, setShowInteractiveMap] = useState(false)
  const [showEnvironmentScore, setShowEnvironmentScore] = useState(false)

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value)
  }

  const handlePrevImage = () => setCurrentImageIndex((prev) => prev === 0 ? property.imagenes.length - 1 : prev - 1)
  const handleNextImage = () => setCurrentImageIndex((prev) => prev === property.imagenes.length - 1 ? 0 : prev + 1)

  // Abrimos el Score pasándole el Perfil
  if (showEnvironmentScore) {
    return (
      <div className="fixed inset-0 z-[80] bg-background">
        <EnvironmentScoreView 
          propertyId={property.id}
          propertyAddress={property.direccion}
          propertyBarrio={property.barrio}
          isRegisteredUser={isRegisteredUser}
          userProfile={userProfile} // <-- ACÁ SE LO PASA AL SCORE
          onClose={() => setShowEnvironmentScore(false)} 
        />
      </div>
    )
  }

  if (showInteractiveMap) {
    return (
      <div className="fixed inset-0 z-[60] bg-background">
        <InteractiveMapView propertyAddress={property.direccion} propertyBarrio={property.barrio} pois={[]} onClose={() => setShowInteractiveMap(false)} />
      </div>
    )
  }

  if (!property.disponible) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Propiedad no disponible</h3>
            <p className="text-slate-500 mb-6">La propiedad seleccionada ya no está disponible.</p>
            <Button onClick={onClose} className="w-full h-11">Volver al buscador</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-auto font-sans">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ChevronLeft className="h-5 w-5" /> Volver a resultados
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* GALERÍA DE IMÁGENES */}
          <div className="relative rounded-2xl overflow-hidden bg-muted mb-8 aspect-[21/9]">
            <img src={property.imagenes[currentImageIndex]} alt={property.titulo} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="default" className="capitalize">{property.tipoOperacion}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-3 text-balance">{property.titulo}</h1>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <MapPin className="h-5 w-5" />
                  <span>{property.direccion}, {property.barrio}, CABA</span>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-slate-50 border-b pb-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Valor de la propiedad</p>
                    <CardTitle className="text-4xl font-extrabold">{formatPrice(property.precio)}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    
                    <Button className="w-full h-12 text-base font-bold shadow-md" onClick={() => setShowEnvironmentScore(true)}>
                      <Compass className="h-5 w-5 mr-2" /> Consultar Score de Entorno
                    </Button>

                    <Button variant="secondary" className="w-full h-11 font-semibold text-primary mt-2" onClick={() => setShowInteractiveMap(true)}>
                      <MapIcon className="h-4 w-4 mr-2" /> Ver en Mapa Interactivo
                    </Button>

                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}