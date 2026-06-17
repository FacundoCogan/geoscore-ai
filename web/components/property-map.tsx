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
  nearbyPois?: any[]; 
}

export function PropertyMap({ properties, selectedProperty, onPropertySelect, nearbyPois = [] }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [L, setL] = useState<any>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

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

  // Cambiamos flyTo por panTo para deslizar y centrar sin alterar el zoom del usuario
  useEffect(() => {
    if (mapInstance && selectedProperty) {
      const selectedPropObj = properties.find(p => p.id === selectedProperty);
      if (selectedPropObj && selectedPropObj.lat && selectedPropObj.lng) {
        mapInstance.panTo([selectedPropObj.lat, selectedPropObj.lng], { animate: true, duration: 1.2 });
      }
    }
  }, [selectedProperty, mapInstance, properties]);

  if (!isMounted || !L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
      </div>
    )
  }

  const createPoiIcon = (categoria: string) => {
    let color = '#3b82f6'; 
    const cat = categoria?.toLowerCase() || '';
    
    if(cat === 'salud') color = '#ef4444'; 
    if(cat === 'transporte') color = '#eab308'; 
    if(cat === 'deporte' || cat === 'fitness') color = '#22c55e'; 

    return L.divIcon({
      className: 'custom-poi',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })
  }

  const centerLat = properties.length > 0 && properties[0].lat ? properties[0].lat : -34.6037;
  const centerLng = properties.length > 0 && properties[0].lng ? properties[0].lng : -58.3816;

  return (
    <MapContainer 
      center={[centerLat, centerLng]} 
      zoom={12} 
      className="w-full h-full rounded-xl z-0"
      ref={setMapInstance}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Pines de los Inmuebles */}
      {properties.map((prop) => {
        if (!prop.lat || !prop.lng) return null;
        return (
          <Marker key={prop.id} position={[prop.lat, prop.lng]} eventHandlers={{ click: () => onPropertySelect(prop.id) }}>
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800">{prop.titulo}</span>
                <span className="text-sm text-primary font-bold">US$ {prop.precio?.toLocaleString("es-AR")}</span>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Pines de los POIs */}
      {selectedProperty && nearbyPois.map((poi, idx) => {
        if (!poi.lat || !poi.lng) return null; 
        return (
          <Marker key={`poi-${idx}`} position={[poi.lat, poi.lng]} icon={createPoiIcon(poi.categoria)}>
            <Popup>
              <div className="text-xs">
                <span className="font-bold">{poi.nombre}</span><br/>
                <span className="text-muted-foreground capitalize">{poi.categoria} {poi.distancia ? `(${Math.round(poi.distancia)}m)` : ''}</span>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}