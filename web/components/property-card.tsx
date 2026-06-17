"use client"

import { MapPin, Bed, Square, Heart, Eye, TrendingUp, Scale, Building } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Property {
  id: string
  titulo: string
  direccion: string
  barrio: string
  precio: number
  ambientes: number
  banos: number
  superficie: number
  imagen?: string
  imagenes?: string[]
  tipoOperacion: "alquiler" | "venta"
  destacado?: boolean
  geoScore?: number
}

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  isComparing?: boolean;
  isFavorite?: boolean;
  onCompare?: () => void;
  onToggleFavorite?: (id: string) => void;
  onClick?: () => void;
  onViewDetail?: () => void;
}

export function PropertyCard({ property, isSelected, isComparing, isFavorite, onCompare, onToggleFavorite, onClick, onViewDetail }: PropertyCardProps) {
  const formatPrice = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
  
  // RESCATE INTELIGENTE DE IMAGEN (Soporta inmuebles nuevos y viejos)
  const mainImage = (property.imagenes && property.imagenes.length > 0) ? property.imagenes[0] : property.imagen;

  return (
    <Card className={cn("overflow-hidden cursor-pointer transition-all hover:shadow-xl group border-border/50 flex flex-col", isSelected && "ring-2 ring-primary bg-primary/[0.02]")} onClick={onClick}>
      <div className="relative">
        {mainImage ? (
          <img src={mainImage} alt={property.titulo} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-52 bg-slate-100 flex items-center justify-center text-slate-300"><Building className="h-12 w-12 opacity-50" /></div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="capitalize shadow-sm">{property.tipoOperacion}</Badge>
          {property.geoScore && <Badge variant="outline" className="bg-background/90 backdrop-blur-sm border-primary/20 text-primary font-bold bg-white/90"><TrendingUp className="h-3 w-3 mr-1" /> {property.geoScore}</Badge>}
        </div>
        <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background rounded-full shadow-sm" onClick={(e) => { e.stopPropagation(); if (onToggleFavorite) onToggleFavorite(property.id); }}>
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite && "fill-destructive text-destructive")} />
        </Button>
      </div>
      
      <CardContent className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-foreground line-clamp-1 text-lg mb-2">{property.titulo}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{property.direccion ? `${property.direccion}, ${property.barrio || ''}` : (property.barrio || 'Sin dirección')}</span>
        </div>
        <div className="flex items-center justify-between mb-4"><span className="font-extrabold text-2xl text-primary tracking-tight">{formatPrice(property.precio)}</span></div>
        <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.ambientes || "-"} amb</div>
            <div className="flex items-center gap-1"><Square className="h-3.5 w-3.5" /> {property.superficie || "-"} m²</div>
          </div>
          <div className="flex items-center gap-2">
            {onCompare && <Button variant={isComparing ? "default" : "outline"} size="sm" className={cn("gap-1 h-8 rounded-lg font-semibold", isComparing && "bg-primary text-primary-foreground")} onClick={(e) => { e.stopPropagation(); onCompare(); }}><Scale className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{isComparing ? "Seleccionado" : "Comparar"}</span></Button>}
            {onViewDetail && <Button variant="secondary" size="sm" className="gap-1 h-8 rounded-lg font-semibold" onClick={(e) => { e.stopPropagation(); onViewDetail(); }}><Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Ver Ficha</span></Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}