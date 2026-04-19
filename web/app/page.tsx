"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchFilters, type SearchFiltersState } from "@/components/search-filters"
import { PropertyCard, type Property } from "@/components/property-card"
import { PropertyMap } from "@/components/property-map"
import { EmptyResults } from "@/components/empty-results"
import { PropertyDetailView } from "@/components/property-detail"
import { supabase } from "@/lib/supabase"

// Expandimos los Mocks para que tengan los datos que pide la Ficha de Detalle
const MOCK_PROPERTIES: any[] = [
  { 
    id: "1", titulo: "Depto luminoso", direccion: "Av. Santa Fe 2500", barrio: "Palermo", precio: 180000, ambientes: 2, banos: 1, superficie: 55, 
    imagen: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=60", 
    tipoOperacion: "alquiler", destacado: true, geoScore: 92,
    descripcion: "Excelente departamento de 2 ambientes al frente. Muy luminoso, con balcón corrido. Pisos de madera hidrolaqueados. Cocina integrada con barra desayunadora.",
    antiguedad: 5, pisos: 4, disponible: true, imagenes: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=60", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60"],
    amenities: ["Aire acondicionado", "Balcón", "Seguridad 24hs"]
  },
  { 
    id: "2", titulo: "PH Reciclado", direccion: "Av. Cabildo 3800", barrio: "Belgrano", precio: 320000, ambientes: 4, banos: 2, superficie: 120, 
    imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=60", 
    tipoOperacion: "venta", geoScore: 85,
    descripcion: "Hermoso PH totalmente reciclado a nuevo. Sin expensas. Cuenta con patio interno, terraza propia con parrilla y lavadero independiente.",
    antiguedad: 30, disponible: true, imagenes: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=60"],
    amenities: ["Parrilla", "Terraza", "Lavadero"]
  },
]

export default function BuscadorPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFiltersState | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [mapError, setMapError] = useState(false) 
  const [user, setUser] = useState<any>(null)

  // Maneja qué propiedad se está viendo en detalle
  const [detailProperty, setDetailProperty] = useState<any | null>(null)

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
      
      {/* OVERLAY DEL DETALLE (CU-02) */}
      {detailProperty && (
        <PropertyDetailView 
          property={detailProperty}
          isRegisteredUser={!!user}
          onClose={() => setDetailProperty(null)}
          onCalculateScore={() => alert("Acá se abriría el análisis completo del GeoScore AI")}
        />
      )}

      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
             <div className="text-primary">
                <Map className="h-6 w-6" />
             </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">GeoScore AI</span>
          </div>
          
          <div className="flex items-center gap-4">
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
                <EmptyResults onClearFilters={() => { setFilters(null); setHasSearched(false); }} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((p) => (
                    <PropertyCard 
                      key={p.id} 
                      property={p} 
                      isSelected={selectedProperty === p.id} 
                      onClick={() => setSelectedProperty(p.id)} 
                      onViewDetail={() => setDetailProperty(p)} 
                    />
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