"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, ArrowLeft, Users, Map, Building, RefreshCw, Activity, BookOpen, Bus, Dumbbell, Globe, Database, PieChart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Log {
  hora: string
  tipo: "INFO" | "OK" | "WARN" | "ERROR"
  mensaje: string
}

export default function GeoDataPage() {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [logs, setLogs] = useState<Log[]>([])
  const [counts, setCounts] = useState({ salud: 1240, educacion: 3105, transporte: 850, deporte: 420 })
  const [isLoadingRole, setIsLoadingRole] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) {
          router.replace('/login')
          return
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/usuarios?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const users = await res.json()
          const me = users.find((u: any) => u.email === session.user.email)
          if (me) {
            const rolNormalizado = (me.rol === "Agente Inmobiliario") ? "Inmobiliaria" : me.rol;
            
            // GUARDIA DE SEGURIDAD: Solo Administrador
            if (rolNormalizado !== 'Administrador') {
              router.replace(rolNormalizado === 'Inmobiliaria' ? '/admin' : '/')
              return
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

  const handleSync = async () => {
    setIsSyncing(true)
    setLogs([{ hora: new Date().toLocaleTimeString(), tipo: "INFO", mensaje: "> conectando psql -h localhost -U admin -d geodb" }])
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/geo/sync`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      } else {
        setLogs(prev => [...prev, { hora: new Date().toLocaleTimeString(), tipo: "ERROR", mensaje: "Fallo de conexión con el servidor interno." }])
      }
    } catch (error) {
      setLogs(prev => [...prev, { hora: new Date().toLocaleTimeString(), tipo: "ERROR", mensaje: "Error de red al intentar sincronizar." }])
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoadingRole) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
      
      <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" /> Volver al Inicio de GeoScore
          </Link>
          <div className="flex items-center gap-2 opacity-80">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-slate-900 tracking-tight">Panel de Administración</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 w-full">
        
        <aside className="w-64 border-r bg-white p-6 hidden md:block shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Módulos del Sistema</div>
          <nav className="flex flex-col gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <PieChart className="h-5 w-5" /> Dashboard
            </Link>
            <Link href="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <Users className="h-5 w-5" /> Gestión de Usuarios
            </Link>
            <Link href="/admin/geo" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold transition-colors">
              <Map className="h-5 w-5" /> Datos Geográficos
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <Building className="h-5 w-5" /> Inmuebles
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                    <Map className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Gestión de Datos Geográficos</h2>
                    <p className="text-sm text-slate-500">Sincronización de Puntos de Interés (POIs) para cálculo de Score.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                    <Globe className="h-3.5 w-3.5" /> API: BA Data
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1 border rounded-2xl p-6 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                      <Database className="h-5 w-5 text-slate-500" /> Estado de Categorías
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <span className="flex items-center gap-2 text-slate-700 font-medium"><Activity className="h-4 w-4 text-rose-500"/> Salud</span>
                        <span className="px-2.5 py-0.5 rounded bg-white border text-sm font-bold text-slate-600">{counts.salud}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <span className="flex items-center gap-2 text-slate-700 font-medium"><BookOpen className="h-4 w-4 text-blue-500"/> Educación</span>
                        <span className="px-2.5 py-0.5 rounded bg-white border text-sm font-bold text-slate-600">{counts.educacion}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <span className="flex items-center gap-2 text-slate-700 font-medium"><Bus className="h-4 w-4 text-amber-500"/> Transporte</span>
                        <span className="px-2.5 py-0.5 rounded bg-white border text-sm font-bold text-slate-600">{counts.transporte}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <span className="flex items-center gap-2 text-slate-700 font-medium"><Dumbbell className="h-4 w-4 text-emerald-500"/> Deporte</span>
                        <span className="px-2.5 py-0.5 rounded bg-white border text-sm font-bold text-slate-600">{counts.deporte}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSync} disabled={isSyncing} className="w-full mt-6 gap-2 bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold">
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Sincronizando..." : "Sincronizar con BA Data"}
                  </Button>
                </div>

                <div className="lg:col-span-2 border rounded-2xl bg-[#0d1117] overflow-hidden flex flex-col shadow-inner">
                  <div className="bg-slate-100/5 border-b border-slate-800 px-4 py-3 flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">Registro de Eventos (Tiempo Real)</span>
                  </div>
                  <div className="p-5 font-mono text-[13px] leading-relaxed text-slate-300 h-[350px] overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-600 italic">
                        Esperando inicio de sincronización con repositorios externos ...
                      </div>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className="mb-2 flex items-start gap-3">
                          <span className="text-slate-500 shrink-0">[{log.hora}]</span>
                          <span className={`${
                            log.tipo === 'ERROR' ? 'text-rose-400' : 
                            log.tipo === 'OK' ? 'text-emerald-400' : 
                            log.tipo === 'WARN' ? 'text-amber-400' : 'text-blue-400'
                          }`}>
                            {log.mensaje}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}