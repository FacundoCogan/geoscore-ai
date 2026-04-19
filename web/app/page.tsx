"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchFilters, type SearchFiltersState } from "@/components/search-filters"
import { PropertyCard, type Property } from "@/components/property-card"
import { PropertyMap } from "@/components/property-map"
import { EmptyResults } from "@/components/empty-results"
import { supabase } from "@/lib/supabase"

const MOCK_PROPERTIES: Property[] = [
  // Lo pasé a "alquiler" para que haga match con el botón activo por defecto del buscador
  { id: "1", titulo: "Depto luminoso", direccion: "Av. Santa Fe 2500", barrio: "Palermo", precio: 180000, ambientes: 2, banos: 1, superficie: 55, imagen: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=60", tipoOperacion: "alquiler", destacado: true, geoScore: 92 },
  { id: "2", titulo: "PH Reciclado", direccion: "Av. Cabildo 3800", barrio: "Belgrano", precio: 320000, ambientes: 4, banos: 2, superficie: 120, imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=60", tipoOperacion: "venta", geoScore: 85 },
]

export default function BuscadorPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFiltersState | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [mapError, setMapError] = useState(false) 
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const filteredProperties = useMemo(() => {
    if (!filters) return MOCK_PROPERTIES

    return MOCK_PROPERTIES.filter(p => {
      if (p.precio < filters.precioMin || p.precio > filters.precioMax) return false
      if (p.tipoOperacion !== filters.tipoOperacion) return false
      if (filters.ambientes > 0 && p.ambientes !== filters.ambientes) return false

      if (filters.direccion) {
        const searchLower = filters.direccion.toLowerCase()
        const matchBarrio = p.barrio.toLowerCase().includes(searchLower)
        const matchDir = p.direccion.toLowerCase().includes(searchLower)
        if (!matchBarrio && !matchDir) return false
      }

      return true
    })
  }, [filters])

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setUser(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
             <div className="text-primary">
                <Map className="h-6 w-6" />
             </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">GeoScore AI</span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Navegación corregida: Sin "Buscar" duplicado */}
             <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 mr-4">
                <span className="cursor-pointer text-slate-900 font-bold border-b-2 border-primary pb-1">Inicio</span>
                <span className="cursor-pointer hover:text-primary">Publicar</span>
                <span className="cursor-pointer hover:text-primary">Contacto</span>
             </nav>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 hidden sm:block">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600">Cerrar Sesión</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="font-semibold text-slate-700" onClick={() => router.push('/login')}>
                  Ingresar
                </Button>
              )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-[320px] flex-shrink-0">
            <SearchFilters onSearch={(f) => { setFilters(f); setHasSearched(true); }} onClear={() => { setFilters(null); setHasSearched(false); }} />
          </aside>

          <div className="flex-1 flex flex-col gap-8">
            <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2">
              <PropertyMap properties={filteredProperties} selectedProperty={selectedProperty} onPropertySelect={setSelectedProperty} hasError={mapError} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {hasSearched ? `${filteredProperties.length} inmuebles encontrados` : "Inmuebles destacados"}
              </h2>

              {filteredProperties.length === 0 ? (
                <EmptyResults />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((p) => (
                    <PropertyCard key={p.id} property={p} isSelected={selectedProperty === p.id} onClick={() => setSelectedProperty(p.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}