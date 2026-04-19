"use client"

import { useRef, useState } from "react"
import { MapPin, ZoomIn, ZoomOut, Locate, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Property } from "./property-card"

const BARRIO_COORDS: Record<string, { lat: number; lng: number }> = {
  "Palermo": { lat: -34.5875, lng: -58.4250 },
  "Belgrano": { lat: -34.5550, lng: -58.4550 },
}

export function PropertyMap({ properties, selectedProperty, onPropertySelect, center = { lat: -34.6037, lng: -58.3816 }, hasError = false }: any) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(12)

  const getPropertyPosition = (property: Property) => {
    return BARRIO_COORDS[property.barrio] || center
  }

  const latLngToPixel = (lat: number, lng: number) => {
    if (!mapRef.current) return { x: 0, y: 0 }
    const mapWidth = mapRef.current.offsetWidth
    const mapHeight = mapRef.current.offsetHeight
    const scale = Math.pow(2, zoom - 10) * 100
    return { 
      x: mapWidth / 2 + (lng - center.lng) * scale, 
      y: mapHeight / 2 - (lat - center.lat) * scale 
    }
  }

  if (hasError) {
    return <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">Error cargando mapa</div>
  }

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden">
      {/* Fondo de cuadrícula estilo diseño */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Líneas principales de la cuadrícula */}
       <div className="absolute inset-0 opacity-30 pointer-events-none flex flex-col justify-evenly">
          <div className="w-full h-[1px] bg-slate-400"></div>
          <div className="w-full h-[1px] bg-slate-400"></div>
       </div>
       <div className="absolute inset-0 opacity-30 pointer-events-none flex justify-evenly">
          <div className="h-full w-[1px] bg-slate-400"></div>
          <div className="h-full w-[1px] bg-slate-400"></div>
       </div>

      <div ref={mapRef} className="absolute inset-0">
        {properties.map((property: any) => {
          const coords = getPropertyPosition(property)
          const pos = latLngToPixel(coords.lat, coords.lng)
          const isSelected = selectedProperty === property.id

          return (
            <div key={property.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
               {/* Círculo tenue detrás del pin seleccionado */}
               {isSelected && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-100/50 rounded-full border border-blue-200"></div>
               )}
              <button 
                onClick={() => onPropertySelect?.(property.id)}
                className={cn(
                  "absolute flex items-center justify-center rounded-full transition-all -translate-x-1/2 -translate-y-1/2",
                  isSelected ? "bg-primary border-2 border-white w-8 h-8 z-10 shadow-md" : "bg-white border-2 border-primary w-6 h-6 hover:scale-110 shadow-sm"
                )}
              >
                <MapPin className={cn("h-4 w-4", isSelected ? "text-white" : "text-primary")} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button size="icon" variant="outline" onClick={() => setZoom(z => z + 1)} className="bg-white/80 backdrop-blur-sm shadow-sm h-8 w-8 text-slate-600"><ZoomIn className="h-4 w-4" /></Button>
        <Button size="icon" variant="outline" onClick={() => setZoom(z => z - 1)} className="bg-white/80 backdrop-blur-sm shadow-sm h-8 w-8 text-slate-600"><ZoomOut className="h-4 w-4" /></Button>
        <Button size="icon" variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm h-8 w-8 text-slate-600"><Locate className="h-4 w-4" /></Button>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border border-slate-200 flex items-center gap-2 text-xs font-medium text-slate-600">
           <Layers className="h-3.5 w-3.5" /> Mapa
        </div>
      </div>
    </div>
  )
}