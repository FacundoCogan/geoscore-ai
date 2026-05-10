'use client'

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, ZoomIn, ZoomOut, Locate, MapPin, GraduationCap, Dumbbell, 
  Bus, Heart, Home, AlertTriangle, List, Map, Info, Layers
} from "lucide-react"

interface POI {
  id: string
  nombre: string
  categoria: 'educacion' | 'deporte' | 'transporte' | 'salud'
  distancia: number
  lat: number
  lng: number
}

interface InteractiveMapProps {
  propertyAddress: string
  propertyBarrio: string
  propertyLat?: number
  propertyLng?: number
  pois: POI[]
  onClose: () => void
  hasMapError?: boolean // Atajador real para el Camino A1
}

const CATEGORY_CONFIG = {
  educacion: { label: 'Educación', color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50', icon: GraduationCap },
  deporte: { label: 'Deporte', color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50', icon: Dumbbell },
  transporte: { label: 'Transporte', color: 'bg-amber-500', textColor: 'text-amber-600', bgLight: 'bg-amber-50', icon: Bus },
  salud: { label: 'Salud', color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-50', icon: Heart },
}

function MapMarker({ poi, isSelected, onClick, mapZoom, centerLat, centerLng }: any) {
  const config = CATEGORY_CONFIG[poi.categoria as keyof typeof CATEGORY_CONFIG]
  const Icon = config.icon
  const scale = mapZoom / 14
  const offsetX = (poi.lng - centerLng) * 8000 * scale
  const offsetY = (centerLat - poi.lat) * 10000 * scale
  
  const clampedX = Math.max(-45, Math.min(45, offsetX))
  const clampedY = Math.max(-40, Math.min(40, offsetY))
  
  return (
    <button
      onClick={onClick}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}`}
      style={{ left: `calc(50% + ${clampedX}%)`, top: `calc(50% + ${clampedY}%)` }}
      title={poi.nombre}
    >
      <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
        <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center shadow-lg border-2 border-white`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {isSelected && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />}
      </div>
    </button>
  )
}

function POIPopup({ poi, onClose }: { poi: POI; onClose: () => void }) {
  const config = CATEGORY_CONFIG[poi.categoria]
  const Icon = config.icon
  
  return (
    <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
      <Card className="w-64 shadow-xl">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bgLight}`}>
              <Icon className={`h-5 w-5 ${config.textColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">{poi.nombre}</h4>
              <Badge variant="secondary" className="mt-1 text-xs">{config.label}</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Distancia: <strong>{poi.distancia < 1000 ? `${poi.distancia}m` : `${(poi.distancia/1000).toFixed(1)}km`}</strong>
              </p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function POIListView({ pois, propertyAddress }: { pois: POI[]; propertyAddress: string }) {
  const groupedPOIs = pois.reduce((acc, poi) => {
    if (!acc[poi.categoria]) acc[poi.categoria] = []
    acc[poi.categoria].push(poi)
    return acc
  }, {} as Record<string, POI[]>)

  return (
    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
        <Home className="h-4 w-4" />
        <span>Distancias desde: <strong className="text-foreground">{propertyAddress}</strong></span>
      </div>
      
      {Object.entries(groupedPOIs).map(([categoria, items]) => {
        const config = CATEGORY_CONFIG[categoria as keyof typeof CATEGORY_CONFIG]
        const Icon = config.icon
        return (
          <div key={categoria}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded ${config.bgLight}`}><Icon className={`h-4 w-4 ${config.textColor}`} /></div>
              <h4 className="font-medium text-sm">{config.label}</h4>
              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
            </div>
            <div className="space-y-1 pl-7">
              {items.sort((a, b) => a.distancia - b.distancia).map((poi) => (
                <div key={poi.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{poi.nombre}</span>
                  <span className="font-medium tabular-nums">
                    {poi.distancia < 1000 ? `${poi.distancia}m` : `${(poi.distancia/1000).toFixed(1)}km`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function InteractiveMapView({
  propertyAddress,
  propertyBarrio,
  propertyLat = -34.5875,
  propertyLng = -58.4365,
  pois,
  onClose,
  hasMapError = false // Por defecto asumimos que carga bien
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(14)
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null)
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(['educacion', 'deporte', 'transporte', 'salud'])
  )
  const [showLegend, setShowLegend] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev + 1, 18)), [])
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 1, 10)), [])
  const handleRecenter = useCallback(() => { setZoom(14); setSelectedPOI(null); }, [])

  const toggleCategory = useCallback((category: string) => {
    setVisibleCategories(prev => {
      const next = new Set(prev)
      next.has(category) ? next.delete(category) : next.add(category)
      return next
    })
  }, [])

  const visiblePOIs = pois.filter(poi => visibleCategories.has(poi.categoria))
  const radiusSize = 180 * (zoom / 14)
  const isA2Empty = pois.length === 0 // Atajador real Camino A2

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold text-foreground">Mapa Interactivo</h1>
              <p className="text-xs text-muted-foreground">{propertyAddress}, {propertyBarrio}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" /> Cerrar mapa
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        {/* CU-08 A1: Error en carga del mapa */}
        {hasMapError ? (
          <div className="absolute inset-0 z-40 bg-background flex flex-col">
            <div className="p-4 bg-destructive/10 border-b border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">No se pudo cargar el mapa interactivo</p>
                  <p className="text-sm text-muted-foreground">El servicio de mapas no está disponible. Mostrando POIs en formato lista.</p>
                </div>
              </div>
            </div>
            <POIListView pois={pois} propertyAddress={propertyAddress} />
          </div>
        ) : (
          /* Camino Normal */
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                backgroundSize: `${30 * zoom / 14}px ${30 * zoom / 14}px`,
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-0 right-0 h-px bg-muted-foreground" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted-foreground" />
                <div className="absolute top-3/4 left-0 right-0 h-px bg-muted-foreground" />
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-muted-foreground" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-muted-foreground" />
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-muted-foreground" />
              </div>

              {/* Radio de influencia de 2km */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/40 bg-primary/5"
                style={{ width: `${radiusSize}px`, height: `${radiusSize}px` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  Radio 2km
                </div>
              </div>

              {/* Marcador Inmueble */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                    <Home className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
                </div>
              </div>

              {/* CU-08 A2: Sin POIs */}
              {isA2Empty && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">No se encontraron puntos de interés en el radio de 2km</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Marcadores POIs */}
              {!isA2Empty && viewMode === 'map' && visiblePOIs.map((poi) => (
                <MapMarker
                  key={poi.id}
                  poi={poi}
                  isSelected={selectedPOI?.id === poi.id}
                  onClick={() => setSelectedPOI(selectedPOI?.id === poi.id ? null : poi)}
                  mapZoom={zoom}
                  centerLat={propertyLat}
                  centerLng={propertyLng}
                />
              ))}

              {selectedPOI && <POIPopup poi={selectedPOI} onClose={() => setSelectedPOI(null)} />}
            </div>

            {/* Controles de mapa */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-1">
              <Button variant="secondary" size="icon" className="h-9 w-9 shadow-md" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
              <Button variant="secondary" size="icon" className="h-9 w-9 shadow-md" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
              <Button variant="secondary" size="icon" className="h-9 w-9 shadow-md mt-2" onClick={handleRecenter}><Locate className="h-4 w-4" /></Button>
            </div>

            <div className="absolute top-4 right-4 z-30">
              <Button variant="secondary" size="sm" className="shadow-md gap-2" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
                {viewMode === 'map' ? <><List className="h-4 w-4" /> Ver lista</> : <><Map className="h-4 w-4" /> Ver mapa</>}
              </Button>
            </div>

            <div className="absolute bottom-4 left-4 z-30 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md text-xs text-muted-foreground">
              Zoom: {zoom}x
            </div>

            {/* Leyenda */}
            {!isA2Empty && showLegend && viewMode === 'map' && (
              <div className="absolute bottom-4 right-4 z-30">
                <Card className="shadow-lg">
                  <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Layers className="h-4 w-4" /> Categorías</CardTitle>
                    <button onClick={() => setShowLegend(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const isActive = visibleCategories.has(key)
                      const count = pois.filter(p => p.categoria === key).length
                      if(count === 0) return null; // Solo muestra categorías que existen en el array
                      return (
                        <button
                          key={key}
                          onClick={() => toggleCategory(key)}
                          className={`flex items-center gap-2 w-full text-left text-sm py-1 px-2 rounded transition-colors ${isActive ? 'bg-muted' : 'opacity-50 hover:opacity-75'}`}
                        >
                          <div className={`w-5 h-5 rounded-full ${config.color} flex items-center justify-center`}><config.icon className="h-3 w-3 text-white" /></div>
                          <span className="flex-1">{config.label}</span>
                          <Badge variant="outline" className="text-xs h-5">{count}</Badge>
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {!showLegend && !isA2Empty && viewMode === 'map' && (
              <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 z-30 shadow-md" onClick={() => setShowLegend(true)}>
                <Layers className="h-4 w-4 mr-2" /> Leyenda
              </Button>
            )}

            {viewMode === 'list' && (
              <div className="absolute inset-0 z-40 bg-background overflow-auto pt-16">
                <POIListView pois={pois} propertyAddress={propertyAddress} />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t bg-card p-3">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {pois.length} puntos de interés</span>
            <span className="hidden sm:inline">Radio de búsqueda: 2km</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>Volver a la ficha</Button>
        </div>
      </footer>
    </div>
  )
}