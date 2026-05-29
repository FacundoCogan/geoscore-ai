"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Property } from "@/components/property-card"
import { Loader2 } from "lucide-react"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

import "leaflet/dist/leaflet.css"

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: string | null;
  onPropertySelect: (id: string) => void;
  nearbyPois?: any[]; // Recibimos los POIs
}

export function PropertyMap({ properties, selectedProperty, onPropertySelect, nearbyPois = [] }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    import("leaflet").then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(leaflet)
    })
  }, [])

  if (!isMounted || !L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
      </div>
    )
  }

  // Función para crear pines de colores para los POIs
  const createPoiIcon = (categoria: string) => {
    let color = '#3b82f6'; // Educación (Azul)
    if(categoria === 'Salud') color = '#ef4444'; // Rojo
    if(categoria === 'Transporte') color = '#eab308'; // Amarillo
    if(categoria === 'Deporte') color = '#22c55e'; // Verde

    return L.divIcon({
      className: 'custom-poi',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })
  }

  const defaultCenter: [number, number] = [-34.6037, -58.3816]

  return (
    <MapContainer center={defaultCenter} zoom={12} className="w-full h-full rounded-xl z-0">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Dibujamos los Inmuebles (Pines Azules Grandes) */}
      {properties.map((prop) => {
        if (!prop.lat || !prop.lng) return null;
        return (
          <Marker key={prop.id} position={[prop.lat, prop.lng]} eventHandlers={{ click: () => onPropertySelect(prop.id) }}>
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800">{prop.titulo}</span>
                <span className="text-sm text-primary font-bold">${prop.precio.toLocaleString("es-AR")}</span>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Dibujamos los POIs Reales (Puntitos de colores) solo si hay una propiedad seleccionada */}
      {nearbyPois.map((poi, idx) => (
        <Marker key={`poi-${idx}`} position={[poi.lat, poi.lng]} icon={createPoiIcon(poi.categoria)}>
          <Popup>
            <div className="text-xs">
              <span className="font-bold">{poi.nombre}</span><br/>
              <span className="text-muted-foreground">{poi.tipo} ({Math.round(poi.distancia)}m)</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}