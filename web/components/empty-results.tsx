"use client"

import { SearchX, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyResultsProps {
  onClearFilters?: () => void
}

export function EmptyResults({ onClearFilters }: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <SearchX className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">
        No encontramos inmuebles
      </h3>
      <p className="text-slate-500 max-w-sm mb-6">
        Ninguna propiedad coincide con estos filtros. Probá flexibilizar el rango de precio o cambiar de barrio.
      </p>
      <Button onClick={onClearFilters} variant="outline" className="gap-2 font-medium text-slate-700">
        <FilterX className="h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  )
}