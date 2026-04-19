"use client"

import { useState } from "react"
import { MapPin, Bed, Bath, Square, Heart, Eye, TrendingUp } from "lucide-react"
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
  imagen: string
  tipoOperacion: "alquiler" | "venta"
  destacado?: boolean
  geoScore?: number // Agregamos GeoScore a la data
}

interface PropertyCardProps {
  property: Property
  isSelected?: boolean
  onClick?: () => void
  onViewDetail?: () => void
}

export function PropertyCard({ property, isSelected, onClick, onViewDetail }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD", // Generalmente propiedades en CABA se tasan en USD
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-xl group border-border/50",
        isSelected && "ring-2 ring-primary bg-primary/[0.02]"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={property.imagen}
          alt={property.titulo}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="capitalize shadow-sm">
            {property.tipoOperacion}
          </Badge>
          {property.geoScore && (
            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm border-primary/20 text-primary font-bold">
              <TrendingUp className="h-3 w-3 mr-1" />
              {property.geoScore}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background rounded-full shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite && "fill-destructive text-destructive")} />
        </Button>
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-foreground line-clamp-1 text-lg">
            {property.titulo}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{property.direccion}, {property.barrio}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
           <span className="font-extrabold text-2xl text-primary tracking-tight">
            {formatPrice(property.precio)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.ambientes} amb</div>
            <div className="flex items-center gap-1"><Square className="h-3.5 w-3.5" /> {property.superficie} m²</div>
          </div>
          {onViewDetail && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1 h-8 rounded-lg font-semibold"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetail()
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Ver Ficha
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}