"use client"

import { useState } from "react"
import {
  MapPin, Bed, Bath, Square, Heart, ChevronLeft, ChevronRight,
  Calendar, Building, Compass, Car, Wifi, Wind, Flame,
  ImageOff, AlertCircle, Share2, TrendingUp, Map as MapIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
  geoScore?: number // Agregamos el GeoScore para la UI
}

interface PropertyDetailProps {
  property: PropertyDetail
  isRegisteredUser: boolean
  onClose: () => void
  onCalculateScore: () => void
}

export function PropertyDetailView({
  property,
  isRegisteredUser,
  onClose,
  onCalculateScore,
}: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD", // Ajustado a USD como en el buscador
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? property.imagenes.length - 1 : prev - 1)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => prev === property.imagenes.length - 1 ? 0 : prev + 1)
  }

  // Atajador real para el Camino Alternativo A2 (Error de imágenes)
  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const allImagesError = property.imagenes.every((_, idx) => imageErrors[idx])

  // CU-02 Camino Alternativo A1: Propiedad no disponible
  if (!property.disponible) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Propiedad no disponible
            </h3>
            <p className="text-slate-500 mb-6">
              La propiedad seleccionada ya fue reservada o dada de baja de nuestro catálogo.
            </p>
            <Button onClick={onClose} className="w-full h-11">Volver al buscador</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-auto font-sans">
      {/* Header Fijo */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Button variant="ghost" onClick={onClose} className="gap-2 text-slate-600 hover:text-slate-900">
            <ChevronLeft className="h-5 w-5" />
            Volver a resultados
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Share2 className="h-5 w-5" />
            </Button>
            {isRegisteredUser && (
              <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-destructive text-destructive" : "text-slate-500")} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Galería de Imágenes */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-200 mb-8 shadow-sm border border-slate-200">
            {allImagesError ? (
              // CU-02 Camino Alternativo A2: Renderizado
              <div className="h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-slate-100">
                <ImageOff className="h-16 w-16 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No se pudieron cargar las imágenes</p>
                <p className="text-sm text-slate-400">Por favor, intente nuevamente más tarde</p>
              </div>
            ) : (
              <>
                <div className="h-[400px] md:h-[500px] relative">
                  {imageErrors[currentImageIndex] ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                      <ImageOff className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">Error al cargar imagen</p>
                    </div>
                  ) : (
                    <img
                      src={property.imagenes[currentImageIndex]}
                      alt={`${property.titulo} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(currentImageIndex)}
                    />
                  )}
                </div>

                {property.imagenes.length > 1 && (
                  <>
                    <Button variant="secondary" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 shadow-md h-10 w-10" onClick={handlePrevImage}>
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button variant="secondary" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 shadow-md h-10 w-10" onClick={handleNextImage}>
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white tracking-widest">
                      {currentImageIndex + 1} / {property.imagenes.length}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Badges Flotantes */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-primary hover:bg-primary text-white shadow-md capitalize px-3 py-1 text-sm">
                {property.tipoOperacion}
              </Badge>
              {property.destacado && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-800 shadow-md">
                  Destacado
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Información */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-3 text-balance">
                  {property.titulo}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin className="h-5 w-5" />
                  <span>{property.direccion}, {property.barrio}, CABA</span>
                </div>
              </div>

              {/* Tarjetas de características rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <Bed className="h-6 w-6 text-primary mb-2" />
                  <p className="font-bold text-slate-800">{property.ambientes}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Ambientes</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <Bath className="h-6 w-6 text-primary mb-2" />
                  <p className="font-bold text-slate-800">{property.banos}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Baños</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <Square className="h-6 w-6 text-primary mb-2" />
                  <p className="font-bold text-slate-800">{property.superficie} m²</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Totales</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <Calendar className="h-6 w-6 text-primary mb-2" />
                  <p className="font-bold text-slate-800">{property.antiguedad === 0 ? "Nuevo" : `${property.antiguedad} años`}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Antigüedad</p>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Descripción</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {property.descripcion}
                </p>
              </div>

              <Separator className="bg-slate-200" />

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Ficha Técnica</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2"><Square className="h-4 w-4" /> Superficie total</span>
                    <span className="font-semibold text-slate-800">{property.superficie} m²</span>
                  </div>
                  {property.superficieCubierta && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-2"><Building className="h-4 w-4" /> Cubierta</span>
                      <span className="font-semibold text-slate-800">{property.superficieCubierta} m²</span>
                    </div>
                  )}
                  {property.pisos && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-2"><Building className="h-4 w-4" /> Piso</span>
                      <span className="font-semibold text-slate-800">{property.pisos}</span>
                    </div>
                  )}
                  {property.orientacion && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-2"><Compass className="h-4 w-4" /> Orientación</span>
                      <span className="font-semibold text-slate-800">{property.orientacion}</span>
                    </div>
                  )}
                  {property.cochera !== undefined && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-2"><Car className="h-4 w-4" /> Cochera</span>
                      <span className="font-semibold text-slate-800">{property.cochera ? "Sí" : "No"}</span>
                    </div>
                  )}
                </div>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities y Servicios</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="gap-2 px-3 py-1.5 bg-white text-slate-700 border-slate-200">
                        {amenity === "WiFi" && <Wifi className="h-3.5 w-3.5 text-slate-400" />}
                        {amenity === "Aire acondicionado" && <Wind className="h-3.5 w-3.5 text-slate-400" />}
                        {amenity === "Calefacción" && <Flame className="h-3.5 w-3.5 text-slate-400" />}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Panel de Acción */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Panel de Precio */}
                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-6">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Valor de la propiedad</p>
                    <CardTitle className="text-4xl font-extrabold text-slate-900">
                      {formatPrice(property.precio)}
                      {property.tipoOperacion === "alquiler" && <span className="text-lg font-normal text-slate-500 ml-1">/mes</span>}
                    </CardTitle>
                    {property.expensas && (
                      <p className="text-sm font-medium text-slate-500 mt-2">
                        + {formatPrice(property.expensas)} expensas
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    
                    {/* Tarjeta exclusiva GeoScore AI */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="bg-primary p-2 rounded-lg text-white">
                             <MapIcon className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-primary uppercase tracking-wider">GeoScore AI</p>
                             <p className="text-sm font-medium text-slate-700">Calidad de Entorno</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-2xl font-black text-primary">{property.geoScore || "-"}</span>
                          <span className="text-xs text-slate-500">/100</span>
                       </div>
                    </div>

                    <Button className="w-full h-12 text-base font-bold shadow-md" onClick={onCalculateScore}>
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Ver Análisis Detallado
                    </Button>

                    <Separator className="my-4" />

                    <Button variant="outline" className="w-full h-11 font-semibold text-slate-700">
                       Contactar Anunciante
                    </Button>

                    {isRegisteredUser ? (
                      <Button variant="ghost" className="w-full h-11 text-slate-500 hover:text-slate-900" onClick={() => setIsFavorite(!isFavorite)}>
                        <Heart className={cn("h-4 w-4 mr-2 transition-colors", isFavorite && "fill-destructive text-destructive")} />
                        {isFavorite ? "Quitar de favoritos" : "Guardar para después"}
                      </Button>
                    ) : (
                      <p className="text-xs text-center text-slate-500 mt-4">
                        <a href="/login" className="font-semibold text-primary hover:underline">Iniciá sesión</a> para guardar en favoritos.
                      </p>
                    )}
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