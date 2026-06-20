"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Map, UserCircle, Scale, Heart, CheckCircle2, Info, Shield, Building, Bell, Trash2, XCircle } from "lucide-react"
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
  const [systemRole, setSystemRole] = useState<string>("Usuario")
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  const [detailProperty, setDetailProperty] = useState<any | null>(null)
  const [showProfileConfig, setShowProfileConfig] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<LifestyleProfile | null>(null)

  const [comparingIds, setComparingIds] = useState<string[]>([])
  const [showCompareView, setShowCompareView] = useState(false)

  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [showFavoritesView, setShowFavoritesView] = useState(false)
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string, type: "success" | "info" | "error"} | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotis, setShowNotis] = useState(false)

  useEffect(() => {
    const fetchInmuebles = async () => {
      try {
        const url = currentProfile ? `${process.env.NEXT_PUBLIC_API_URL}/api/inmuebles?perfil=${currentProfile}&t=${Date.now()}` : `${process.env.NEXT_PUBLIC_API_URL}/api/inmuebles?t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setDbProperties(data)
        }
      } catch (error) {
        console.warn("Backend offline")
      }
    }
    fetchInmuebles()
  }, [currentProfile])

  useEffect(() => {
    if (!selectedProperty) { setNearbyPois([]); return; }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/inmuebles/${selectedProperty}/analisis${currentProfile ? `?perfil=${currentProfile}` : ''}`
    fetch(url).then(res => res.json()).then(data => setNearbyPois(data.poisReales || [])).catch(err => console.error(err))
  }, [selectedProperty, currentProfile])

  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}/perfil`)
      if (res.status === 200) setCurrentProfile(await res.text() as LifestyleProfile)
      else setCurrentProfile(null)
    } catch (e) { setCurrentProfile(null) }
  }

  const fetchFavorites = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/${userId}`)
      if (res.ok) setFavoriteIds(await res.json())
    } catch (e) {}
  }

  const fetchNotis = async (email: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${email}?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) setNotifications(await res.json())
    } catch (e) {}
  }

  const handleReadNoti = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${id}/leer`, { method: 'PUT' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      router.push('/admin')
    } catch (e) {}
  }

  const handleDeleteNoti = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {}
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          try {
            const resUsuarios = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/usuarios`)
            if (resUsuarios.ok) {
              const users = await resUsuarios.json()
              const me = users.find((u: any) => u.email === session.user.email)
              if (me) {
                const rolNormalizado = (me.rol === "Agente Inmobiliario") ? "Inmobiliaria" : me.rol;
                setSystemRole(rolNormalizado);
              }
            }
          } catch (e) {}

          await Promise.all([
            fetchUserProfile(session.user.id),
            fetchFavorites(session.user.id),
            fetchNotis(session.user.email || "")
          ])
        }
      } finally { setIsLoadingSession(false) }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchNotis(session.user.email || "")
      } else {
        setUser(null)
        setSystemRole("Usuario")
        setNotifications([])
      }
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  const unreadNotis = notifications.filter(n => !n.leida).length;

  const showToast = (title: string, desc: string, type: "success" | "info" | "error" = "success") => {
    setToastMsg({ title, desc, type }); setTimeout(() => setToastMsg(null), 3500)
  }

  const handleToggleFavorite = async (propertyId: string, propertyTitle: string = "Inmueble") => {
    if (!user) return router.push('/login');
    const isAdding = !favoriteIds.includes(propertyId);
    setFavoriteIds(prev => isAdding ? [...prev, propertyId] : prev.filter(id => id !== propertyId));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, inmuebleId: propertyId })
      })

      if (res.ok) {
        const result = await res.json()
        if (result.accion === "agregado") showToast("Agregado a favoritos", `Se guardó "${propertyTitle}".`, "success")
        else showToast("Removido de favoritos", `Se eliminó "${propertyTitle}".`, "info")
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

    return dbProperties.filter(p => {
      if (p.tipoOperacion.toLowerCase() !== filters.tipoOperacion.toLowerCase()) return false;
      if (p.precio > filters.precioMax) return false;

      if (filters.ambientes && filters.ambientes !== 'Todos') {
        const ambReq = filters.ambientes;
        if (ambReq.includes('+')) {
          const minAmb = parseInt(ambReq.replace('+', ''));
          if (p.ambientes < minAmb) return false;
        } else {
          if (p.ambientes !== parseInt(ambReq)) return false;
        }
      }

      if (filters.ubicacion && filters.ubicacion.trim() !== '') {
        const searchWords = filters.ubicacion.toLowerCase().trim().split(/[\s,]+/);
        const fullAddress = `${p.direccion || ''} ${p.barrio || ''}`.toLowerCase();
        const matchesAllWords = searchWords.every(word => fullAddress.includes(word));

        if (!matchesAllWords) return false;
      }

      return true;
    });
  }, [filters, dbProperties])

  const filteredPoisForMap = useMemo(() => {
    if (!currentProfile || nearbyPois.length === 0) return nearbyPois;
    const mapping: Record<string, string> = { "estudiante": "educacion", "fitness": "deporte", "salud": "salud", "movilidad": "transporte" };
    return nearbyPois.filter(poi => poi.categoria?.toLowerCase() === mapping[currentProfile]);
  }, [nearbyPois, currentProfile])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-start gap-3 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-top-5">
          {toastMsg.type === "error" ? <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" /> : toastMsg.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex flex-col gap-1"><span className="text-sm font-semibold">{toastMsg.title}</span><span className="text-xs opacity-90">{toastMsg.desc}</span></div>
        </div>
      )}

      {showProfileConfig && (
        <div className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm overflow-auto p-6 flex items-start justify-center">
          <LifestyleProfileForm
            currentProfile={currentProfile}
            onCancel={() => setShowProfileConfig(false)}
            onSave={async (profile) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/perfil`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id, profile })
                })

                if(res.ok) {
                  setCurrentProfile(profile)
                  setShowProfileConfig(false)
                  showToast("Perfil actualizado", "Preferencias guardadas en la base de datos.", "success")
                } else {
                  showToast("No se pudo guardar", "Verificá que el backend esté corriendo.", "error")
                }
              } catch (e) {
                showToast("Error de red", "No se pudo contactar al servidor de Java.", "error")
              }
            }}
          />
        </div>
      )}

      {detailProperty && (
        <PropertyDetailView property={detailProperty} isRegisteredUser={!!user} userProfile={currentProfile} onClose={() => setDetailProperty(null)} />
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
                <div className="flex items-center gap-3 relative">

                  <div className="relative">
                    <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100 rounded-full" onClick={() => setShowNotis(!showNotis)}>
                       <Bell className="h-5 w-5" />
                       {unreadNotis > 0 && <span className="absolute top-1 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                    </Button>

                    {showNotis && (
                       <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-3 bg-slate-50 border-b font-bold text-sm text-slate-800 flex justify-between items-center">
                            Notificaciones {unreadNotis > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{unreadNotis}</span>}
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                             {notifications.length === 0 ? (
                               <div className="p-6 text-xs text-slate-500 text-center">No hay novedades por ahora.</div>
                             ) : (
                                notifications.map(n => (
                                   <div key={n.id} onClick={() => handleReadNoti(n.id)} className={`p-4 border-b text-xs cursor-pointer transition-colors hover:bg-slate-50 flex justify-between items-start gap-3 ${n.leida ? 'opacity-70 bg-white' : 'bg-blue-50/40 font-medium'}`}>
                                      <div className="flex-1">
                                        {n.mensaje}
                                        <div className="text-[10px] text-slate-400 mt-1">{new Date(n.fecha).toLocaleDateString()}</div>
                                      </div>
                                      {/* Tacho de basura siempre visible */}
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0" onClick={(e) => handleDeleteNoti(e, n.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                   </div>
                                ))
                             )}
                          </div>
                       </div>
                    )}
                  </div>

                  <span className="text-sm font-medium text-slate-600 hidden md:block border-l pl-3 ml-1">{user.email}</span>

                  {systemRole === 'Administrador' && (
                    <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-primary/10" onClick={() => router.push('/admin/dashboard')}>
                      <Shield className="h-4 w-4" /> Panel Admin
                    </Button>
                  )}

                  {systemRole === 'Inmobiliaria' && (
                    <Button variant="outline" size="sm" className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => router.push('/admin')}>
                      <Building className="h-4 w-4" /> Publicar Inmuebles
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => {setShowFavoritesView(true); setShowCompareView(false);}}>
                    <Heart className="h-4 w-4" fill={favoriteIds.length > 0 ? "currentColor" : "none"} /> Favoritos
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowProfileConfig(true)}>
                    <UserCircle className="h-4 w-4" /> Mi Perfil
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {supabase.auth.signOut(); setUser(null); setSystemRole("Usuario");}} className="text-slate-600">
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
             userProfile={currentProfile}
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
               <SearchFilters
                 onSearch={setFilters}
                 onClear={() => setFilters(null)}
                 availableProperties={dbProperties}
               />
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