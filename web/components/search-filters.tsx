"use client"

import { useState } from "react"
import { Search, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export interface SearchFiltersState {
  direccion: string
  precioMin: number
  precioMax: number
  ambientes: number
  tipoOperacion: string
}

const BARRIOS_CABA = ["Palermo", "Recoleta", "Belgrano", "Caballito", "Núñez", "Villa Urquiza", "Colegiales", "Villa Crespo", "Almagro", "San Telmo", "Puerto Madero", "Barracas", "La Boca", "Flores", "Villa Devoto", "CABA"]

export function SearchFilters({ onSearch, onClear }: { onSearch: any, onClear: any }) {
  const [direccion, setDireccion] = useState("")
  const [precioRange, setPrecioRange] = useState([50000, 300000])
  const [ambientes, setAmbientes] = useState<number>(0)
  const [tipoOperacion, setTipoOperacion] = useState("alquiler")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handleSearch = () => {
    if (direccion.trim() !== "") {
      const searchLower = direccion.toLowerCase()
      const isValidCABA = BARRIOS_CABA.some(b => searchLower.includes(b.toLowerCase()))
      
      if (!isValidCABA) {
        setLocationError("La cobertura es exclusiva para CABA. Por favor ingresa una ubicación válida.")
        return 
      }
    }

    setLocationError(null)
    onSearch({ direccion, precioMin: precioRange[0], precioMax: precioRange[1], ambientes, tipoOperacion })
  }

  const handleClear = () => {
    setDireccion("")
    setPrecioRange([50000, 300000])
    setAmbientes(0)
    setLocationError(null)
    onClear()
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Buscar Inmuebles</h2>
        <button onClick={handleClear} className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
          Limpiar
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <Button variant={tipoOperacion === "alquiler" ? "default" : "ghost"} size="sm" onClick={() => setTipoOperacion("alquiler")} className={`flex-1 rounded-md ${tipoOperacion === 'alquiler' ? 'shadow-sm bg-primary text-white hover:bg-primary/90' : 'text-slate-600'}`}>Alquiler</Button>
        <Button variant={tipoOperacion === "venta" ? "default" : "ghost"} size="sm" onClick={() => setTipoOperacion("venta")} className={`flex-1 rounded-md ${tipoOperacion === 'venta' ? 'shadow-sm bg-primary text-white hover:bg-primary/90' : 'text-slate-600'}`}>Venta</Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Barrio o Dirección</Label>
        <div className="relative">
          <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${locationError ? 'text-destructive' : 'text-slate-400'}`} />
          <Input 
            placeholder="Ej: Palermo, CABA..." 
            value={direccion} 
            onChange={(e) => {
              setDireccion(e.target.value)
              if (locationError) setLocationError(null)
            }} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            className={cn(
              "pl-9 bg-white transition-colors",
              locationError ? "border-destructive focus-visible:ring-destructive" : "border-slate-200"
            )} 
          />
        </div>
        {locationError && (
          <p className="text-xs text-destructive font-medium mt-1">{locationError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Ambientes</Label>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((num) => (
            <Button key={num} variant={ambientes === num ? "default" : "outline"} size="sm" onClick={() => setAmbientes(num)} className={`flex-1 border-slate-200 ${ambientes === num ? 'bg-primary text-primary-foreground' : 'text-slate-600'}`}>
              {num === 0 ? "Todos" : num === 4 ? "4+" : num}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <Label className="text-sm font-semibold text-slate-700">Precio mensual</Label>
        <div className="px-2 mt-4 mb-2">
           <Slider 
              value={precioRange} 
              max={1000000} 
              step={10000} 
              onValueChange={setPrecioRange} 
            />
        </div>
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-500">${precioRange[0].toLocaleString()}</span>
          <span className="text-slate-700">${precioRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="border-t border-slate-100 pt-4">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 w-full">
          <Search className="h-4 w-4" /> Filtros avanzados
          <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
           <p className="text-xs text-slate-400">Más opciones próximamente...</p>
        </CollapsibleContent>
      </Collapsible>

      <Button onClick={handleSearch} className="w-full h-11 text-base font-semibold shadow-md" size="lg">
        Buscar inmuebles
      </Button>
    </div>
  )
}