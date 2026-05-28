"use client"

import { Heart, ArrowLeft, HeartCrack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard, type Property } from "@/components/property-card"

interface FavoritesViewProps {
  properties: Property[];
  comparingIds: string[];
  onClose: () => void;
  onToggleFavorite: (id: string, titulo: string) => void;
  onCompare: (id: string) => void;
  onViewDetail: (property: Property) => void;
}

export function FavoritesView({ 
  properties, 
  comparingIds,
  onClose, 
  onToggleFavorite,
  onCompare,
  onViewDetail
}: FavoritesViewProps) {
  return (
    <div className="w-full min-h-[600px] bg-background rounded-xl border shadow-sm p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-950 rounded-lg">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mis Favoritos</h2>
            <p className="text-sm text-muted-foreground">Gestioná los inmuebles que guardaste para comparar luego.</p>
          </div>
        </div>
        <Button variant="ghost" className="gap-2" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" /> Cerrar vista
        </Button>
      </div>

      {/* A1: Camino Alternativo - Lista Vacía */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <HeartCrack className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aún no tienes favoritos guardados</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Explorá el catálogo de inmuebles y tocá el ícono del corazón para guardar las propiedades que más te interesen.
          </p>
          <Button onClick={onClose}>Explorar inmuebles</Button>
        </div>
      ) : (
        /* Curso Normal: Grilla de favoritos reutilizando PropertyCard */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard 
              key={prop.id} 
              property={prop} 
              isFavorite={true} // Siempre es true en esta vista
              isComparing={comparingIds.includes(prop.id)}
              onToggleFavorite={() => onToggleFavorite(prop.id, prop.titulo)}
              onCompare={() => onCompare(prop.id)}
              onViewDetail={() => onViewDetail(prop)}
            />
          ))}
        </div>
      )}
    </div>
  )
}