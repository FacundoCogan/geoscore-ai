"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface SearchFiltersState {
  ubicacion: string
  tipoOperacion: "alquiler" | "venta"
  ambientes: string
  precioMin: number
  precioMax: number
}

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersState | null) => void
  onClear: () => void
  availableProperties?: any[] 
}

export function SearchFilters({ onSearch, onClear, availableProperties = [] }: SearchFiltersProps) {
  const [ubicacion, setUbicacion] = useState("")
  const [tipoOperacion, setTipoOperacion] = useState<"alquiler" | "venta">("alquiler")
  const [ambientes, setAmbientes] = useState("Todos")
  const [precioMax, setPrecioMax] = useState(1000000)

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch({ ubicacion, tipoOperacion, ambientes, precioMin: 50000, precioMax })
    }, 150) 
    return () => clearTimeout(timeout)
  }, [ubicacion, tipoOperacion, ambientes, precioMax, onSearch])

  const handleUbicacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUbicacion(val)

    if (val.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const matches = new Set<string>()
    availableProperties.forEach(p => {
      if (p.direccion && p.direccion.toLowerCase().includes(val.toLowerCase())) {
        matches.add(`${p.direccion}, ${p.barrio}`)
      }
      if (p.barrio && p.barrio.toLowerCase().includes(val.toLowerCase())) {
        matches.add(p.barrio)
      }
    })

    setSuggestions(Array.from(matches).slice(0, 6)) 
    setShowSuggestions(true)
  }

  const handleClear = () => {
    setUbicacion("")
    setTipoOperacion("alquiler")
    setAmbientes("Todos")
    setPrecioMax(1000000)
    onClear()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">Buscar Inmuebles</h2>
        <button onClick={handleClear} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">Limpiar</button>
      </div>

      <div className="space-y-6">
        
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipoOperacion === 'alquiler' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setTipoOperacion("alquiler")}>Alquiler</button>
          <button className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tipoOperacion === 'venta' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setTipoOperacion("venta")}>Venta</button>
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Barrio o Dirección</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Ej: Av Caseros 3039..." 
              className="pl-9 h-11 bg-slate-50 border-slate-200"
              value={ubicacion}
              onChange={handleUbicacionChange}
              onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true) }}
            />
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowSuggestions(false)}></div>
              <ul className="absolute z-[9999] w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-64 overflow-y-auto left-0 top-full">
                {suggestions.map((s, i) => (
                  <li key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-100 last:border-0 flex items-start gap-2 transition-colors"
                      onClick={() => {
                        setUbicacion(s);
                        setShowSuggestions(false);
                      }}>
                    <MapPin className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <span className="text-slate-700 font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ambientes</label>
          <div className="flex gap-2">
            {['Todos', '1', '2', '3', '4+'].map((amb) => (
              <button key={amb} onClick={() => setAmbientes(amb)} className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${ambientes === amb ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                {amb}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Precio máximo</label>
            <span className="text-sm font-bold text-primary">US$ {precioMax.toLocaleString('es-AR')}</span>
          </div>
          <input type="range" min="5000" max="2000000" step="5000" value={precioMax} onChange={(e) => setPrecioMax(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>

        <Button onClick={() => setShowSuggestions(false)} className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700">
          Explorar Mapa
        </Button>
      </div>
    </div>
  )
}