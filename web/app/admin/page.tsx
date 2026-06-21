"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Shield, ArrowLeft, Users, Map as MapIcon, Database, Building, UploadCloud, FileText, PieChart, Save, Loader2, CheckCircle2, XCircle, Plus, Trash2, Home, MapPin, Image as ImageIcon, Edit, Check, X, AlertTriangle, Eye, Send, MapPinOff, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

interface Inmueble {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  superficie: number;
  barrio: string;
  direccion: string;
  telefono: string;
  ambientes: number;
  tipoOperacion: string;
  imagenes: string[];
  estadoAprobacion: string;
  ubicacion?: { x: number, y: number };
}

const barriosCABA = [
  "Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos", "Monte Castro", "Montserrat", "Nueva Pompeya", "Núñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Chas", "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal", "San Nicolás", "San Telmo", "Vélez Sársfield", "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto", "Villa General Mitre", "Villa Lugano", "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real", "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza"
]

export default function GestionInmueblesPage() {
  const [activeTab, setActiveTab] = useState<"mis_publicaciones" | "manual" | "masiva" | "moderacion">("mis_publicaciones")
  const [systemRole, setSystemRole] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [isLoadingRole, setIsLoadingRole] = useState(true)
  const [toast, setToast] = useState<{title: string, desc: string, type: "error" | "success"} | null>(null)

  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [isLoadingInmuebles, setIsLoadingInmuebles] = useState(false)

  const defaultForm = { id: null, titulo: "", descripcion: "", precio: "", ambientes: "", superficie: "", barrio: "", direccion: "", telefono: "", imagenes: [], tipoOperacion: "venta", latitud: "", longitud: "" }
  const [formData, setFormData] = useState<any>(defaultForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)

  const [previewInmueble, setPreviewInmueble] = useState<Inmueble | null>(null)
  const [previewImgIndex, setPreviewImgIndex] = useState(0)
  const [rejectingInmueble, setRejectingInmueble] = useState<Inmueble | null>(null)
  const [motivoRechazo, setMotivoRechazo] = useState("")

  const [logs, setLogs] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) {
          window.location.href = '/login'
          return
        }

        setUserId(session.user.id)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/usuarios?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const users = await res.json()
          const me = users.find((u: any) => u.email === session.user.email)
          if (me) {
            const rolNormalizado = (me.rol === "Agente Inmobiliario") ? "Inmobiliaria" : me.rol;
            if (rolNormalizado === 'Usuario') {
              window.location.href = '/'
              return
            }
            setSystemRole(rolNormalizado)
            if (rolNormalizado === 'Administrador') {
              setActiveTab('moderacion')
              fetchInmueblesAdmin()
            } else {
              fetchMisInmuebles(session.user.id)
            }
          }
        }
      } catch (e) {
        console.warn("Backend offline")
      } finally {
        setIsLoadingRole(false)
      }
    }
    init()
  }, [])

  const fetchMisInmuebles = async (propietarioId: string) => {
    setIsLoadingInmuebles(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles/propietario/${propietarioId}?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) setInmuebles(await res.json())
    } catch (e) {} finally { setIsLoadingInmuebles(false) }
  }

  const fetchInmueblesAdmin = async () => {
    setIsLoadingInmuebles(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles/todos?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) setInmuebles(await res.json())
    } catch (e) {} finally { setIsLoadingInmuebles(false) }
  }

  const showToast = (title: string, desc: string, type: "error" | "success") => {
    setToast({ title, desc, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Archivo muy grande", `El archivo ${file.name} supera el límite de 2MB.`, "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({
          ...prev,
          imagenes: [...prev.imagenes, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleValidarDireccion = async () => {
    if (!formData.barrio || !formData.direccion) {
      showToast("Datos incompletos", "Completá la Dirección y seleccioná el Barrio primero.", "error")
      return;
    }
    
    setIsValidatingAddress(true)
    try {
      const query = encodeURIComponent(`${formData.direccion}, ${formData.barrio}, Ciudad Autónoma de Buenos Aires, Argentina`)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      const data = await res.json()

      if (data && data.length > 0) {
        setFormData({ ...formData, latitud: data[0].lat, longitud: data[0].lon })
        showToast("Dirección Validada", "Se encontraron las coordenadas exactas en el mapa.", "success")
      } else {
        showToast("Error de Geocodificación", "La dirección ingresada no existe en ese barrio de CABA.", "error")
        setFormData({ ...formData, latitud: "", longitud: "" })
      }
    } catch (e) {
      showToast("Error de API", "El servicio de mapas no responde. Intentá de nuevo.", "error")
    } finally {
      setIsValidatingAddress(false)
    }
  }

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.latitud || !formData.longitud) {
       showToast("Ubicación pendiente", "Hacé clic en 'Validar' antes de publicar.", "error")
       return;
    }

    setIsSaving(true)
    try {
      const payload = { ...formData, propietarioId: userId, rol: systemRole }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const isEdit = formData.id !== null;
        const msgInmo = isEdit ? "Tu inmueble ha sido pausado y enviado a moderación." : "Tu inmueble ha sido enviado para revisión.";
        showToast("Publicación exitosa", systemRole === 'Administrador' ? "Inmueble publicado y aprobado." : msgInmo, "success")
        
        setFormData(defaultForm)
        systemRole === 'Administrador' ? fetchInmueblesAdmin() : fetchMisInmuebles(userId)
        setActiveTab(systemRole === 'Administrador' ? "moderacion" : "mis_publicaciones")
      } else {
        const err = await res.json()
        showToast("Error", err.error || "Fallo en la base de datos.", "error")
      }
    } catch (e) {
      showToast("Error de red", "No se pudo conectar con el servidor.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (inmueble: Inmueble) => {
    setFormData({
      id: inmueble.id,
      titulo: inmueble.titulo || "",
      descripcion: inmueble.descripcion || "",
      precio: inmueble.precio || "",
      ambientes: inmueble.ambientes || "",
      superficie: inmueble.superficie || "",
      barrio: inmueble.barrio || "",
      direccion: inmueble.direccion || "",
      telefono: inmueble.telefono || "",
      imagenes: inmueble.imagenes || [],
      tipoOperacion: inmueble.tipoOperacion || "venta",
      latitud: inmueble.ubicacion?.y || "",
      longitud: inmueble.ubicacion?.x || ""
    })
    setActiveTab("manual")
  }

  const handleDelete = async (inmuebleId: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar permanentemente este inmueble? Esta acción no se puede deshacer.")) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles/${inmuebleId}?rol=${systemRole}&userId=${userId}`, { method: 'DELETE', cache: 'no-store' })
      if (res.ok) {
        showToast("Operación exitosa", "El inmueble ha sido eliminado de la plataforma.", "success")
        systemRole === 'Administrador' ? fetchInmueblesAdmin() : fetchMisInmuebles(userId)
        setPreviewInmueble(null)
      }
    } catch (e) { showToast("Error", "No se pudo procesar la solicitud.", "error") }
  }

  const handleAprobar = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles/${id}/aprobar`, { method: 'PUT', cache: 'no-store' })
      if (res.ok) {
          fetchInmueblesAdmin();
          setPreviewInmueble(null);
      }
    } catch (e) {}
  }

  const handleOpenRechazo = (inmueble: Inmueble) => {
    setMotivoRechazo("")
    setRejectingInmueble(inmueble)
    setPreviewInmueble(null)
  }

  const handleConfirmRechazo = async () => {
    if (!rejectingInmueble || !motivoRechazo.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles/${rejectingInmueble.id}/rechazar`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo: motivoRechazo }),
          cache: 'no-store' 
      })
      if (res.ok) {
          showToast("Inmueble Fue Rechazado", "Se ha notificado al agente inmobiliario.", "success")
          fetchInmueblesAdmin()
          setRejectingInmueble(null)
      }
    } catch (e) { showToast("Error", "No se pudo procesar el rechazo.", "error") }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setLogs(prev => [...prev, `> Iniciando carga del archivo: ${file.name}...`])

    // Armamos el paquete con el archivo y el rol para mandarlo al backend
    const formData = new FormData()
    formData.append("file", file)
    formData.append("rol", systemRole)
    formData.append("userId", userId)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inmuebles/upload`, {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      })

      if (res.ok) {
        const data = await res.json()
        setLogs(prev => [...prev, data.mensaje || `[OK] Archivo procesado correctamente.`])
        
        // Refrescamos los datos para que aparezcan enseguida
        if (systemRole === 'Administrador') {
          fetchInmueblesAdmin()
        } else {
          fetchMisInmuebles(userId)
        }
      } else {
        const err = await res.json()
        setLogs(prev => [...prev, `[ERROR] ${err.error || "Fallo en la sincronización"}`])
        showToast("Error en carga masiva", err.error || "Fallo al procesar el archivo.", "error")
      }
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] No se pudo conectar con el servidor.`])
      showToast("Error de red", "Verificá que el backend esté corriendo.", "error")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = "" // Resetea el input
    }
  }

  const handleTabChange = (tab: "mis_publicaciones" | "manual" | "masiva" | "moderacion") => {
    setActiveTab(tab)
    if (tab === "moderacion" || tab === "mis_publicaciones") {
      systemRole === 'Administrador' ? fetchInmueblesAdmin() : fetchMisInmuebles(userId)
    }
  }

  if (isLoadingRole) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const pendingCount = inmuebles.filter(i => i.estadoAprobacion === "Pendiente" || i.estadoAprobacion === "Pausado").length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
      
      {rejectingInmueble && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b bg-red-50">
              <h3 className="font-bold text-lg text-red-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600"/> Rechazar Publicación</h3>
              <Button variant="ghost" size="icon" onClick={() => setRejectingInmueble(null)} className="text-red-900 hover:bg-red-100"><X className="h-5 w-5"/></Button>
            </div>
            <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                    Estás a punto de rechazar la propiedad <strong>{rejectingInmueble.titulo}</strong>. <br/>
                    Por favor, indicá el motivo para que el Agente Inmobiliario pueda corregirlo. Se le notificará inmediatamente.
                </p>
                <textarea 
                    className="w-full border rounded-xl p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="Ej: Las fotos no tienen la resolución adecuada / La dirección no concuerda con el barrio..."
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                />
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectingInmueble(null)}>Cancelar</Button>
              <Button disabled={!motivoRechazo.trim()} className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleConfirmRechazo}>
                  <Send className="h-4 w-4"/> Enviar Rechazo
              </Button>
            </div>
          </div>
        </div>
      )}

      {previewInmueble && !rejectingInmueble && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="font-bold text-lg text-slate-900">Detalle de Inmueble</h3>
              <Button variant="ghost" size="icon" onClick={() => { setPreviewInmueble(null); setPreviewImgIndex(0); }}><X className="h-5 w-5"/></Button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="w-full h-64 relative bg-slate-950 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
                  {previewInmueble.imagenes && previewInmueble.imagenes.length > 0 ? (
                    <>
                      <img src={previewInmueble.imagenes[previewImgIndex]} alt="Inmueble" className="w-full h-full object-cover" />
                      {previewInmueble.imagenes.length > 1 && (
                        <>
                          <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={() => setPreviewImgIndex(previewImgIndex === 0 ? previewInmueble.imagenes.length - 1 : previewImgIndex - 1)}><ChevronLeft className="h-4 w-4"/></Button>
                          <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={() => setPreviewImgIndex(previewImgIndex === previewInmueble.imagenes.length - 1 ? 0 : previewImgIndex + 1)}><ChevronRight className="h-4 w-4"/></Button>
                        </>
                      )}
                    </>
                  ) : <div className="flex flex-col items-center justify-center text-slate-400"><ImageIcon className="h-10 w-10 mb-2 opacity-50" /><span className="text-sm font-medium">Sin imagen cargada</span></div>}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{previewInmueble.titulo}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">{previewInmueble.tipoOperacion}</span>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border"><MapPin className="h-3 w-3"/> {previewInmueble.direccion}, {previewInmueble.barrio}</span>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border">{previewInmueble.ambientes} Ambientes</span>
                    {previewInmueble.superficie && <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border">{previewInmueble.superficie} m²</span>}
                </div>
                <div className="mb-6"><p className="text-3xl font-extrabold text-slate-900">${previewInmueble.precio?.toLocaleString('es-AR')}</p></div>
                <div className="mb-6"><h4 className="font-bold text-slate-900 mb-2">Descripción</h4><p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{previewInmueble.descripcion}</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h4 className="font-bold text-slate-900 mb-2 text-sm flex items-center gap-2"><MapIcon className="h-4 w-4"/> Coordenadas</h4><p className="text-slate-600 text-sm font-mono">Lat: {previewInmueble.ubicacion?.y} | Lng: {previewInmueble.ubicacion?.x}</p></div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              {systemRole === 'Administrador' && (previewInmueble.estadoAprobacion === 'Pendiente' || previewInmueble.estadoAprobacion === 'Pausado') ? (
                  <>
                      <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleOpenRechazo(previewInmueble)}><X className="h-4 w-4 mr-2"/> Rechazar</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAprobar(previewInmueble.id)}><Check className="h-4 w-4 mr-2"/> Aprobar Publicación</Button>
                  </>
              ) : (
                  <Button variant="outline" onClick={() => { setPreviewInmueble(null); setPreviewImgIndex(0); }}>Cerrar</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#111111] text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-4 min-w-[450px] animate-in slide-in-from-top-5">
          {toast.type === 'error' ? <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />}
          <div className="flex flex-col"><span className="font-bold text-[15px]">{toast.title}</span><span className="text-[13px] text-slate-300 mt-1">{toast.desc}</span></div>
        </div>
      )}

      <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"><ArrowLeft className="h-4 w-4" /> Volver al Inicio de GeoScore</Link>
          <div className="flex items-center gap-2 opacity-80">
            {systemRole === 'Inmobiliaria' ? <><Building className="h-5 w-5 text-emerald-600" /><span className="font-bold text-slate-900 tracking-tight">Portal Inmobiliario</span></> : <><Shield className="h-5 w-5 text-primary" /><span className="font-bold text-slate-900 tracking-tight">Panel de Administración</span></>}
          </div>
        </div>
      </div>

      <div className="flex flex-1 w-full">
        <aside className="w-64 border-r bg-white p-6 hidden md:block shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{systemRole === 'Inmobiliaria' ? 'Portal de Gestión' : 'Módulos del Sistema'}</div>
          <nav className="flex flex-col gap-2">
            {systemRole === 'Administrador' && (
              <>
                <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors"><PieChart className="h-5 w-5" /> Dashboard</Link>
                <Link href="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors"><Users className="h-5 w-5" /> Gestión de Usuarios</Link>
                <Link href="/admin/geo" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors"><MapIcon className="h-5 w-5" /> Datos Geográficos</Link>
              </>
            )}
            <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${systemRole === 'Inmobiliaria' ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/10 text-primary'}`}><Building className="h-5 w-5" /> {systemRole === 'Inmobiliaria' ? 'Mis Inmuebles' : 'Inmuebles'}</Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${systemRole === 'Inmobiliaria' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}><Database className="h-8 w-8" /></div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{systemRole === 'Inmobiliaria' ? 'Publicación de Inmuebles' : 'Gestión y Moderación de Catálogo'}</h2>
                    <p className="text-sm text-slate-500">{systemRole === 'Inmobiliaria' ? 'Gestioná tu cartera de propiedades y publicá nuevos avisos.' : 'Aprobá, rechazá o creá nuevos inmuebles en la plataforma.'}</p>
                  </div>
                </div>
                <Button onClick={() => { setFormData(defaultForm); handleTabChange("manual"); }} className={`gap-2 ${systemRole === 'Inmobiliaria' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600'}`}><Plus className="h-4 w-4" /> Nuevo Inmueble</Button>
              </div>

              <div className="flex gap-6 border-b mb-8 overflow-x-auto whitespace-nowrap pb-2">
                {systemRole === 'Administrador' && (
                  <button className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'moderacion' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('moderacion')}>
                    Moderación Pendiente {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount}</span>}
                  </button>
                )}
                <button className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'mis_publicaciones' ? (systemRole === 'Inmobiliaria' ? 'border-emerald-600 text-emerald-700' : 'border-primary text-primary') : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('mis_publicaciones')}>{systemRole === 'Inmobiliaria' ? 'Mis Publicaciones' : 'Catálogo Completo'}</button>
                <button className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'manual' ? (systemRole === 'Inmobiliaria' ? 'border-emerald-600 text-emerald-700' : 'border-primary text-primary') : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('manual')}>Formulario Manual</button>
                <button className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'masiva' ? (systemRole === 'Inmobiliaria' ? 'border-emerald-600 text-emerald-700' : 'border-primary text-primary') : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => handleTabChange('masiva')}>Carga Masiva</button>
              </div>

              {activeTab === 'moderacion' && systemRole === 'Administrador' && (
                <div className="animate-in fade-in duration-300">
                  {inmuebles.filter(i => i.estadoAprobacion === "Pendiente" || i.estadoAprobacion === "Pausado").length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50"><CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" /><h3 className="font-bold text-slate-700 mb-2">Todo al día</h3><p className="text-sm text-slate-500">No hay publicaciones pendientes de revisión.</p></div>
                  ) : (
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b"><tr><th className="px-6 py-4">Inmueble</th><th className="px-6 py-4">Contexto</th><th className="px-6 py-4 text-right">Moderación</th></tr></thead>
                        <tbody>
                          {inmuebles.filter(i => i.estadoAprobacion === "Pendiente" || i.estadoAprobacion === "Pausado").map((p) => (
                            <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                {p.imagenes && p.imagenes.length > 0 ? <img src={p.imagenes[0]} alt="thumb" className="w-10 h-10 rounded object-cover border" /> : <div className="w-10 h-10 rounded bg-slate-100 border flex items-center justify-center text-slate-400"><Home className="h-4 w-4"/></div>}
                                <div><p className="font-bold max-w-[200px] truncate">{p.titulo}</p><p className="text-xs text-slate-500">${p.precio?.toLocaleString('es-AR')}</p></div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center w-max gap-1 ${p.estadoAprobacion === 'Pausado' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{p.estadoAprobacion === 'Pausado' ? <><AlertTriangle className="h-3 w-3"/> Edición (Pausado)</> : 'Nueva Publicación'}</span>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <Button size="sm" variant="secondary" className="gap-2" onClick={() => setPreviewInmueble(p)}><Eye className="h-4 w-4"/> Revisar</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mis_publicaciones' && (
                <div className="animate-in fade-in duration-300">
                  {isLoadingInmuebles ? (
                     <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
                  ) : inmuebles.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50"><Home className="h-12 w-12 text-slate-300 mx-auto mb-4" /><h3 className="font-bold text-slate-700 mb-2">No hay publicaciones</h3><Button onClick={() => handleTabChange("manual")} variant="outline" className="gap-2 font-semibold">Empezar ahora</Button></div>
                  ) : (
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b"><tr><th className="px-6 py-4">Inmueble</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
                        <tbody>
                          {inmuebles.map((p) => {
                            let badgeClass = "bg-green-100 text-green-700";
                            if (p.estadoAprobacion === "Pendiente") badgeClass = "bg-blue-100 text-blue-700";
                            if (p.estadoAprobacion === "Pausado") badgeClass = "bg-amber-100 text-amber-700";
                            if (p.estadoAprobacion === "Rechazado") badgeClass = "bg-slate-100 text-slate-500 line-through";

                            return (
                              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                  {p.imagenes && p.imagenes.length > 0 ? <img src={p.imagenes[0]} alt="thumb" className="w-12 h-12 rounded object-cover border" /> : <div className="w-12 h-12 rounded bg-slate-100 border flex items-center justify-center text-slate-400"><Home className="h-5 w-5"/></div>}
                                  <div>
                                    <p className="font-bold line-clamp-1 max-w-[250px]">{p.titulo}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3"/> {p.direccion} - ${p.precio?.toLocaleString('es-AR')}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeClass}`}>{p.estadoAprobacion || "Aprobado"}</span></td>
                                <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setPreviewInmueble(p)}><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'manual' && (
                <div className="bg-slate-50 border rounded-2xl p-8 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Building className={`h-5 w-5 ${systemRole === 'Inmobiliaria' ? 'text-emerald-600' : 'text-primary'}`} /> {formData.id ? 'Editar Publicación' : 'Alta de Inmueble'}
                  </h3>
                  
                  {systemRole === 'Inmobiliaria' && formData.id && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <p><strong>Aviso:</strong> Al guardar los cambios, esta propiedad quedará <strong>Pausada</strong> (oculta del mapa) hasta que el Administrador valide la edición.</p>
                    </div>
                  )}

                  <form onSubmit={handleManualSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Título de la publicación</label>
                      <Input placeholder="Ej: Departamento 3 ambientes luminoso" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Descripción completa</label>
                      <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Barrio</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required value={formData.barrio} onChange={e => {setFormData({...formData, barrio: e.target.value, latitud: "", longitud: ""})}}>
                        <option value="" disabled>Seleccione un barrio de CABA...</option>
                        {barriosCABA.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">Dirección (Calle y Número)</label>
                      <div className="flex gap-2">
                         <Input placeholder="Ej: Av. Santa Fe 3200" required value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value, latitud: "", longitud: ""})} />
                         <Button type="button" variant="secondary" onClick={handleValidarDireccion} disabled={isValidatingAddress} className="whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200">
                           {isValidatingAddress ? <Loader2 className="h-4 w-4 animate-spin"/> : <MapPin className="h-4 w-4 mr-2"/>} Validar
                         </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Precio (USD/ARS)</label>
                      <Input type="number" placeholder="Ej: 150000" required value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Tipo de Operación</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.tipoOperacion} onChange={e => setFormData({...formData, tipoOperacion: e.target.value})}>
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Ambientes</label>
                      <Input type="number" placeholder="Ej: 3" required value={formData.ambientes} onChange={e => setFormData({...formData, ambientes: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Superficie Total (m²)</label>
                      <Input type="number" placeholder="Ej: 60" required value={formData.superficie} onChange={e => setFormData({...formData, superficie: e.target.value})} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">WhatsApp de Contacto del Agente</label>
                      <Input placeholder="Ej: 5491143211234 (Solo números)" required value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                    </div>

                    {/* GALERÍA MULTI-IMAGEN COMPLETA */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Galería de Imágenes (Múltiples)</label>
                      <div className="flex flex-col gap-4">
                        <Input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={handleMultipleImages} className="cursor-pointer" />
                        
                        {formData.imagenes && formData.imagenes.length > 0 && (
                          <div className="flex gap-3 overflow-x-auto p-3 bg-white border rounded-xl shadow-inner min-h-[90px]">
                             {formData.imagenes.map((img: string, idx: number) => (
                               <div key={idx} className="relative shrink-0 group">
                                 <img src={img} alt={`Preview ${idx}`} className="h-16 w-16 object-cover rounded-lg shadow-sm border" />
                                 <button type="button" onClick={() => setFormData({...formData, imagenes: formData.imagenes.filter((_: any, i: number) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"><X className="h-3 w-3"/></button>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl md:col-span-2 grid grid-cols-2 gap-4">
                      <div className="col-span-2 text-xs font-bold text-slate-500 mb-1 flex items-center gap-2">
                          {formData.latitud ? <CheckCircle2 className="h-4 w-4 text-emerald-500"/> : <MapPinOff className="h-4 w-4 text-rose-500"/>} Coordenadas Exactas de Mapa
                      </div>
                      <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Latitud</label><Input value={formData.latitud} readOnly className="bg-white/50 text-slate-500 font-mono" placeholder="Esperando validación..." /></div>
                      <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Longitud</label><Input value={formData.longitud} readOnly className="bg-white/50 text-slate-500 font-mono" placeholder="Esperando validación..." /></div>
                    </div>

                    <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t">
                      <Button 
                        type="submit" 
                        disabled={isSaving || !formData.latitud} 
                        className={`gap-2 h-11 px-8 font-bold ${
                          systemRole === 'Inmobiliaria' 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin"/> : <Save className="h-5 w-5" />} 
                        {formData.id ? 'Guardar Cambios' : 'Publicar Inmueble'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'masiva' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                  <div className="lg:col-span-1">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <input type="file" accept=".csv,.json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                      <UploadCloud className="h-10 w-10 text-slate-400 mb-4" />
                      <h3 className="font-bold text-slate-900 mb-2">Arrastrá tu archivo</h3>
                      <Button variant="outline" size="sm" disabled={isUploading}>{isUploading ? "Cargando..." : "Examinar equipo"}</Button>
                    </div>
                  </div>
                  <div className="lg:col-span-2 border rounded-2xl overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-slate-50 border-b px-4 py-3 text-xs font-bold text-slate-700 flex gap-2"><FileText className="h-4 w-4"/> Logs de Operación</div>
                    <div className="p-5 font-mono text-[13px] text-slate-600 h-[250px] overflow-y-auto">
                      {logs.length === 0 ? "Esperando archivo..." : logs.map((l, i) => <div key={i} className="mb-2">{l}</div>)}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}