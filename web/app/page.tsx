"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Map, UserCircle, Scale, Heart, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchFilters, type SearchFiltersState } from "@/components/search-filters"
import { PropertyCard, type Property } from "@/components/property-card"
import { PropertyMap } from "@/components/property-map"
import { EmptyResults } from "@/components/empty-results"
import { PropertyDetailView } from "@/components/property-detail"
import { LifestyleProfileForm, type LifestyleProfile } from "@/components/lifestyle-profile-form"
import { CompareProperties } from "@/components/compare-properties"
import { FavoritesView } from "@/components/favorites-view"
import { supabase } from "@/lib/supabase"

export default function BuscadorPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFiltersState | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  
  const [dbProperties, setDbProperties] = useState<Property[]>([])
  const [nearbyPois, setNearbyPois] = useState<any[]>([])
  
  const [user, setUser] = useState<any>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  
  const [detailProperty, setDetailProperty] = useState<any | null>(null)
  const [showProfileConfig, setShowProfileConfig] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<LifestyleProfile | null>(null)
  
  const [comparingIds, setComparingIds] = useState<string[]>([])
  const [showCompareView, setShowCompareView] = useState(false)
  
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [showFavoritesView, setShowFavoritesView] = useState(false)
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string, type: "success" | "info"} | null>(null)

  // 1. Ahora actualizamos la lista si el usuario cambia de perfil para recalcular los scores
  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const url = currentProfile 
          ? `http://localhost:8080/api/inmuebles?perfil=${currentProfile}` 
          : 'http://localhost:8080/api/inmuebles';
        const res = await fetch(url)
        if (res.ok) setDbProperties(await res.json())
      } catch (error) { console.error("Error cargando inmuebles:", error) }
    }
    fetchInmuebles()
  }, [currentProfile])

  // 2. Extraemos los POIs del mapa enviándole el perfil actual
  useEffect(() => {
    if (!selectedProperty) {
      setNearbyPois([])
      return
    }
    const url = `http://localhost:8080/api/inmuebles/${selectedProperty}/analisis${currentProfile ? `?perfil=${currentProfile}` : ''}`
    
    fetch(url)
      .then(res => res.json())
      .then(data => setNearbyPois(data.poisReales || []))
      .catch(err => console.error(err))
  }, [selectedProperty, currentProfile])

  const fetchUserProfile = async (userId: string, token: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`, { headers: { 'Authorization': `Bearer ${token}` }})
      if (res.status === 200) setCurrentProfile(await res.text() as LifestyleProfile)
      else setCurrentProfile(null) 
    } catch (e) { setCurrentProfile(null) }
  }

  const fetchFavorites = async (userId: string, token: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/favoritos/${userId}`, { headers: { 'Authorization': `Bearer ${token}` }})
      if (res.ok) setFavoriteIds(await res.json())
    } catch (e) {}
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await Promise.all([
            fetchUserProfile(session.user.id, session.access_token),
            fetchFavorites(session.user.id, session.access_token)
          ])
        }
      } finally { setIsLoadingSession(false) }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          setUser(session.user)
          await Promise.all([
            fetchUserProfile(session.user.id, session.access_token),
            fetchFavorites(session.user.id, session.access_token)
          ])
        } else {
          setUser(null)
          setCurrentProfile(null)
          setFavoriteIds([])
        }
      } finally { setIsLoadingSession(false) }
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  const showToast = (title: string, desc: string, type: "success" | "info" = "success") => {
    setToastMsg({ title, desc, type })
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleToggleFavorite = async (propertyId: string, propertyTitle: string = "Inmueble") => {
    if (!user) return router.push('/login');
    const isAdding = !favoriteIds.includes(propertyId);
    setFavoriteIds(prev => isAdding ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('http://localhost:8080/api/favoritos/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user.id, inmuebleId: propertyId })
      })

      if (res.ok) {
        const result = await res.json()
        if (result.accion === "agregado") showToast("Agregado a favoritos", `Se guardó "${propertyTitle}" en tu lista.`, "success")
        else showToast("Removido de favoritos", `Se eliminó "${propertyTitle}" de tu lista.`, "info")
      } else {
        setFavoriteIds(prev => !isAdding ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
      }
    } catch (e) {
      setFavoriteIds(prev => !isAdding ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
    }
  }

  const handleToggleCompare = (propertyId: string) => {
    if (comparingIds.includes(propertyId)) {
      setComparingIds(comparingIds.filter(id => id !== propertyId))
      return
    }
    if (comparingIds.length === 1) {
      setComparingIds([...comparingIds, propertyId])
      setShowCompareView(true)
    } else if (comparingIds.length === 0) {
      setComparingIds([propertyId])
    }
  }

  const filteredProperties = useMemo(() => {
    if (!filters) return dbProperties
    return dbProperties.filter(p => p.precio >= filters.precioMin && p.precio <= filters.precioMax && p.tipoOperacion === filters.tipoOperacion)
  }, [filters, dbProperties])

  // 3. Filtro a prueba de balas para los POIs en el mapa (Sin problemas de mayúsculas o tildes)
  const filteredPoisForMap = useMemo(() => {
    if (!currentProfile || nearbyPois.length === 0) return nearbyPois;
    
    const mapping: Record<string, string> = {
      "estudiante": "educacion",
      "fitness": "deporte",
      "salud": "salud",
      "movilidad": "transporte"
    };
    
    const categoriaDeseada = mapping[currentProfile];
    return nearbyPois.filter(poi => poi.categoria?.toLowerCase() === categoriaDeseada);
  }, [nearbyPois, currentProfile])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-start gap-3 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-top-5">
          {toastMsg.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex flex-col gap-1"><span className="text-sm font-semibold">{toastMsg.title}</span><span className="text-xs opacity-90">{toastMsg.desc}</span></div>
        </div>
      )}

      {showProfileConfig && (
        <div className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm overflow-auto p-6 flex items-start justify-center">
          <LifestyleProfileForm 
            currentProfile={currentProfile}
            onCancel={() => setShowProfileConfig(false)}
            onSave={async (profile) => {
              const { data: { session } } = await supabase.auth.getSession()
              await fetch('http://localhost:8080/api/usuarios/perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ userId: user.id, profile })
              })
              setCurrentProfile(profile)
              setShowProfileConfig(false)
            }}
          />
        </div>
      )}

      {detailProperty && (
        <PropertyDetailView 
          property={detailProperty}
          isRegisteredUser={!!user}
          userProfile={currentProfile}
          onClose={() => setDetailProperty(null)}
        />
      )}

      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setShowCompareView(false); setShowFavoritesView(false);}}>
            <Map className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-xl text-slate-800">GeoScore AI</span>
          </div>
          
          <div className="flex items-center gap-4">
             {isLoadingSession ? (
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 hidden md:block">{user.email}</span>
                  <Button variant="ghost" size="sm" className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => {setShowFavoritesView(true); setShowCompareView(false);}}>
                    <Heart className="h-4 w-4" fill={favoriteIds.length > 0 ? "currentColor" : "none"} /> Mis Favoritos
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowProfileConfig(true)}>
                    <UserCircle className="h-4 w-4" /> Mi Perfil
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {supabase.auth.signOut(); setUser(null);}} className="text-slate-600">
                    Salir
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="font-semibold text-slate-700" onClick={() => router.push('/login')}>
                  Ingresar
                </Button>
              )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl relative">
        
        {comparingIds.length === 1 && !showCompareView && !showFavoritesView && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm">Seleccioná un segundo inmueble para comparar</span>
            <Button variant="outline" size="sm" className="h-7 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setComparingIds([])}>Cancelar</Button>
          </div>
        )}

        {showCompareView ? (
           <CompareProperties 
             property1={dbProperties.find(p => p.id === comparingIds[0])}
             property2={dbProperties.find(p => p.id === comparingIds[1])}
             userProfile={currentProfile} // <-- Pasamos el perfil al comparador
             onClose={() => { setShowCompareView(false); setComparingIds([]); }}
           />
        ) : showFavoritesView ? (
           <FavoritesView 
             properties={dbProperties.filter(p => favoriteIds.includes(p.id))}
             comparingIds={comparingIds}
             onClose={() => setShowFavoritesView(false)}
             onToggleFavorite={(id, title) => handleToggleFavorite(id, title)}
             onCompare={(id) => handleToggleCompare(id)}
             onViewDetail={(property) => setDetailProperty(property)}
           />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300">
            <aside className="w-full lg:w-[320px]">
               <SearchFilters onSearch={setFilters} onClear={() => setFilters(null)} />
            </aside>
            <div className="flex-1 flex flex-col gap-8">
              <div className="h-[400px] rounded-xl border bg-white overflow-hidden p-2 relative z-0">
                <PropertyMap 
                  properties={filteredProperties} 
                  selectedProperty={selectedProperty} 
                  onPropertySelect={setSelectedProperty} 
                  nearbyPois={filteredPoisForMap} 
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6">Catálogo de Inmuebles ({filteredProperties.length})</h2>
                {filteredProperties.length === 0 ? <EmptyResults onClearFilters={() => setFilters(null)} /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map(p => (
                      <PropertyCard 
                        key={p.id} 
                        property={p} 
                        isSelected={selectedProperty === p.id} 
                        isComparing={comparingIds.includes(p.id)}
                        isFavorite={favoriteIds.includes(p.id)} 
                        onCompare={() => handleToggleCompare(p.id)}
                        onToggleFavorite={() => handleToggleFavorite(p.id, p.titulo)} 
                        onClick={() => setSelectedProperty(p.id)} 
                        onViewDetail={() => setDetailProperty(p)} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}