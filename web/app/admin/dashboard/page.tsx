"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, ArrowLeft, Users, Map as MapIcon, Building, PieChart, FileSpreadsheet, Download, Activity, AlertCircle, XCircle, CheckCircle2, Loader2, ServerCrash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  hasData: boolean;
  perfiles?: { "Usuarios Estandar": number; "Inmobiliarias": number; "Administradores": number; };
  estilosVida?: { Salud: number; Estudiante: number; Movilidad: number; Fitness: number; Total: number; Divisor: number; };
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [inmuebles, setInmuebles] = useState<any[]>([])
  
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  
  const [toast, setToast] = useState<{title: string, desc: string, type: "error" | "success"} | null>(null)

  useEffect(() => {
    const initAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) {
          router.replace('/login')
          return
        }

        const resUsers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/usuarios?t=${Date.now()}`, { cache: 'no-store' })
        if (resUsers.ok) {
          const users = await resUsers.json()
          const me = users.find((u: any) => u.email === session.user.email)
          if (me) {
            const rolNormalizado = (me.rol === "Agente Inmobiliario") ? "Inmobiliaria" : me.rol;
            if (rolNormalizado !== 'Administrador') {
              router.replace(rolNormalizado === 'Inmobiliaria' ? '/admin' : '/')
              return
            }
          }
        }

        const [resStats, resInmuebles] = await Promise.all([
           fetch(`http://localhost:8080/api/admin/dashboard/stats?t=${Date.now()}`, { cache: 'no-store' }),
           fetch(`http://localhost:8080/api/admin/inmuebles/todos?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        if (resStats.ok) {
          setStats(await resStats.json())
        } else {
          setFetchError(true)
        }

        if (resInmuebles.ok) {
          setInmuebles(await resInmuebles.json())
        }

      } catch (e) {
        setFetchError(true)
      } finally {
        setIsLoadingStats(false)
      }
    }
    initAndFetch()
  }, [])

  const showToast = (title: string, desc: string, type: "error" | "success") => {
    setToast({ title, desc, type })
    setTimeout(() => setToast(null), 4500)
  }

  const handleGenerateReport = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/dashboard/export`)
      if (!res.ok) {
        showToast("Error en la descarga", "Ocurrió un error inesperado al generar el archivo.", "error")
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Reporte_GeoScore_${new Date().toISOString().split('T')[0]}.csv` 
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showToast("Descarga exitosa", "El reporte CSV se ha descargado en tu equipo.", "success")
    } catch (e) {
      showToast("Error de conexión", "No se pudo contactar al servidor en este momento.", "error")
    }
  }

  if (isLoadingStats) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /><p className="font-medium">Calculando métricas en vivo...</p></div>

  if (fetchError || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
        <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm"><ServerCrash className="h-8 w-8 text-slate-500" /></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Servicio no disponible</h2>
        <p className="text-slate-500 max-w-md mb-8">No pudimos cargar las estadísticas en este momento. Por favor, verificá tu conexión.</p>
        <Button onClick={() => window.location.reload()} className="h-11 px-8 font-semibold">Reintentar conexión</Button>
      </div>
    )
  }

  const divisor = stats?.estilosVida?.Divisor || 1;
  const totalPerfiles = stats?.estilosVida?.Total || 0;
  
  const pctMovilidad = Math.round(((stats?.estilosVida?.Movilidad || 0) / divisor) * 100);
  const pctEstudiante = Math.round(((stats?.estilosVida?.Estudiante || 0) / divisor) * 100);
  const pctFitness = Math.round(((stats?.estilosVida?.Fitness || 0) / divisor) * 100);
  const pctSalud = Math.round(((stats?.estilosVida?.Salud || 0) / divisor) * 100);

  const rawUsr = stats?.perfiles?.["Usuarios Estandar"] || 0;
  const rawInmo = stats?.perfiles?.["Inmobiliarias"] || 0;
  const rawAdm = stats?.perfiles?.["Administradores"] || 0;
  
  const sumUsuarios = rawUsr + rawInmo + rawAdm;
  const totalUsuariosSafe = sumUsuarios > 0 ? sumUsuarios : 1;

  const pctUsr = Math.round((rawUsr / totalUsuariosSafe) * 100);
  const pctInmo = Math.round((rawInmo / totalUsuariosSafe) * 100);
  const pctAdm = Math.round((rawAdm / totalUsuariosSafe) * 100);

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
      
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#111111] text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-4 min-w-[450px] animate-in slide-in-from-top-5">
          {toast.type === 'error' ? <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />}
          <div className="flex flex-col"><span className="font-bold text-[15px]">{toast.title}</span><span className="text-[13px] text-slate-300 mt-1">{toast.desc}</span></div>
        </div>
      )}

      <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          {/* BOTÓN VOLVER INMEDIATO */}
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" /> Volver al Inicio de GeoScore
          </Link>
          <div className="flex items-center gap-2 opacity-80">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-slate-900">Panel de Administración</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 w-full">
        
        <aside className="w-64 border-r bg-white p-6 hidden md:block shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Módulos del Sistema</div>
          <nav className="flex flex-col gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold transition-colors">
              <PieChart className="h-5 w-5" /> Dashboard
            </Link>
            <Link href="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <Users className="h-5 w-5" /> Gestión de Usuarios
            </Link>
            <Link href="/admin/geo" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <MapIcon className="h-5 w-5" /> Datos Geográficos
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <Building className="h-5 w-5" /> Inmuebles
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <PieChart className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Métricas y Analítica
                  </h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Conectado a PostgreSQL (Live)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2 font-semibold text-slate-700 bg-white border-slate-200">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" /> CSV
                </Button>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleGenerateReport}>
                  <Download className="h-4 w-4" /> Generar Reporte
                </Button>
              </div>
            </div>

            {!stats.hasData ? (
              <div className="bg-white rounded-2xl border p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                  <AlertCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Actividad Insuficiente</h3>
                <p className="text-slate-500 max-w-md">El sistema detecta que las tablas de registros están vacías o no tienen suficiente información para procesar gráficos estadísticos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
                
                <div className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Perfiles más utilizados</h3>
                    <p className="text-xs text-slate-500 mb-8">Distribución de cuentas activas (Total: {sumUsuarios})</p>
                    
                    <div className="flex justify-center mb-8">
                      <div className="w-48 h-48 rounded-full flex items-center justify-center shadow-sm transition-all duration-1000" 
                           style={{ background: `conic-gradient(#3b82f6 0% ${pctUsr}%, #10b981 ${pctUsr}% ${pctUsr + pctInmo}%, #a855f7 ${pctUsr + pctInmo}% 100%)` }}>
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner">
                          <span className="text-3xl font-extrabold text-slate-800">{sumUsuarios}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-700 font-medium"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Usuarios Estándar</span>
                      <span className="font-bold text-slate-900">{pctUsr}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-700 font-medium"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Inmobiliarias</span>
                      <span className="font-bold text-slate-900">{pctInmo}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-700 font-medium"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Administradores</span>
                      <span className="font-bold text-slate-900">{pctAdm}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">Intereses de Usuarios <Activity className="h-4 w-4 text-slate-400" /></h3>
                  <p className="text-xs text-slate-500 mb-8">Perfiles configurados (Total: {totalPerfiles})</p>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-700">
                        <span>Movilidad (Transporte Público)</span> <span>{pctMovilidad}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${pctMovilidad}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-700">
                        <span>Estudiante (Educación)</span> <span>{pctEstudiante}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pctEstudiante}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-700">
                        <span>Fitness (Deporte y Plazas)</span> <span>{pctFitness}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${pctFitness}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-slate-700">
                        <span>Salud (Hospitales/Clínicas)</span> <span>{pctSalud}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${pctSalud}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col">
                  <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    Estado del Catálogo <Building className="h-4 w-4 text-slate-400" />
                  </h3>
                  <p className="text-xs text-slate-500 mb-8">Distribución actual de las publicaciones</p>

                  <div className="flex-1 flex flex-col justify-center gap-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span className="text-sm font-semibold text-slate-700">Aprobados (Visibles)</span>
                      </div>
                      <span className="font-bold text-xl text-slate-900">
                        {inmuebles.filter(i => i.estadoAprobacion === "Aprobado" || !i.estadoAprobacion).length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-amber-400 shadow-sm"></div>
                        <span className="text-sm font-semibold text-slate-700">Pendientes / Pausados</span>
                      </div>
                      <span className="font-bold text-xl text-slate-900">
                        {inmuebles.filter(i => i.estadoAprobacion === "Pendiente" || i.estadoAprobacion === "Pausado").length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-rose-500 shadow-sm"></div>
                        <span className="text-sm font-semibold text-slate-700">Rechazados</span>
                      </div>
                      <span className="font-bold text-xl text-slate-900">
                        {inmuebles.filter(i => i.estadoAprobacion === "Rechazado").length}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}