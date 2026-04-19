"use client"

import { SearchX, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyResultsProps {
  onAdjustFilters?: () => void
}

export function EmptyResults({ onAdjustFilters }: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        No encontramos inmuebles
      </h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        Ninguna propiedad coincide con estos filtros. Probá flexibilizar el rango de precio o cambiar de barrio.
      </p>
      <Button onClick={onAdjustFilters} variant="outline" className="gap-2 h-11 px-6">
        <SlidersHorizontal className="h-4 w-4" />
        Ajustar filtros
      </Button>
    </div>
  )
}