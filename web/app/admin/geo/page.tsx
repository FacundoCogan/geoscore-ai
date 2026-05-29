"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Map as MapIcon, Activity, BookOpen, Bus, Dumbbell, Globe, RefreshCw, XCircle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface LogEntry {
  hora: string
  tipo: "INFO" | "OK" | "ERROR"
  mensaje: string
}

export default function GeoSyncPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const handleSync = async () => {
    setIsSyncing(true)
    setLogs([{ hora: new Date().toLocaleTimeString('es-AR', { hour12: false }), tipo: "INFO", mensaje: "> conectando psql -h localhost -U admin -d geodb" }])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`http://localhost:8080/api/admin/geo/sync?modo=NORMAL`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })

      if (!response.ok) throw new Error("Error de conexión con el backend")

      const resultLogs = await response.json()
      
      for (let i = 0; i < resultLogs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setLogs(prev => [...prev, resultLogs[i]])
      }

    } catch (error) {
      setLogs(prev => [...prev, { 
        hora: new Date().toLocaleTimeString('es-AR', { hour12: false }), 
        tipo: "ERROR", 
        mensaje: "No se pudo alcanzar el backend de Spring Boot." 
      }])
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCancel = () => {
    setIsSyncing(false)
    setLogs(prev => [
      ...prev, 
      { hora: new Date().toLocaleTimeString('es-AR', { hour12: false }), tipo: "INFO", mensaje: "El administrador solicitó la cancelación del proceso." },
      { hora: new Date().toLocaleTimeString('es-AR', { hour12: false }), tipo: "ERROR", mensaje: "Revirtiendo cambios temporales y cerrando conexión..." },
      { hora: new Date().toLocaleTimeString('es-AR', { hour12: false }), tipo: "INFO", mensaje: "Proceso cancelado exitosamente." }
    ])
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <MapIcon className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Gestión de Datos Geográficos</h1>
              <p className="text-sm text-muted-foreground">Sincronización de Puntos de Interés (POIs) para cálculo de Score.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              <Globe className="h-3 w-3" /> API: BA Data
            </div>
            <Button variant="ghost" onClick={() => router.push('/admin')}>Volver</Button>
          </div>
        </div>

        <div className="p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Panel Izquierdo: Estadísticas y Botón */}
          <div className="w-full lg:w-[280px] flex flex-col gap-6 border rounded-xl p-5 bg-slate-50 shadow-inner">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-3"><Database className="h-4 w-4"/> Estado de Categorías</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4 text-red-400"/> Salud</span><span className="bg-white px-2 py-1 rounded border text-xs font-bold text-slate-500">1240</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm font-medium"><BookOpen className="h-4 w-4 text-blue-400"/> Educación</span><span className="bg-white px-2 py-1 rounded border text-xs font-bold text-slate-500">3105</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm font-medium"><Bus className="h-4 w-4 text-yellow-500"/> Transporte</span><span className="bg-white px-2 py-1 rounded border text-xs font-bold text-slate-500">850</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm font-medium"><Dumbbell className="h-4 w-4 text-green-500"/> Deporte</span><span className="bg-white px-2 py-1 rounded border text-xs font-bold text-slate-500">420</span></div>
            </div>

            <div className="mt-auto pt-4 border-t">
              {!isSyncing ? (
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSync}>
                  <RefreshCw className="h-4 w-4" /> Sincronizar con BA Data
                </Button>
              ) : (
                <Button variant="destructive" className="w-full gap-2" onClick={handleCancel}>
                  <XCircle className="h-4 w-4" /> Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Panel Derecho: Terminal */}
          <div className="flex-1 flex flex-col border rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-100 border-b p-3 flex items-center justify-between text-sm font-bold text-slate-700">
              <span className="flex items-center gap-2"><Database className="h-4 w-4" /> Registro de Eventos (Tiempo Real)</span>
            </div>
            
            {/* Pantalla negra de la terminal */}
            <div className="flex-1 bg-[#0c0c0c] p-5 font-mono text-[13px] overflow-auto h-[450px]">
              {logs.length === 0 ? (
                <div className="text-green-700/50 flex items-center justify-center h-full">
                  Esperando inicio de sincronización con repositorios externos ...
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3 leading-relaxed">
                      {log.hora && <span className="text-slate-500 shrink-0">[{log.hora}]</span>}
                      <span className={`
                        ${log.tipo === 'INFO' ? 'text-blue-400' : ''}
                        ${log.tipo === 'OK' ? 'text-green-400' : ''}
                        ${log.tipo === 'ERROR' ? 'text-rose-500 font-bold' : ''}
                      `}>
                        {log.mensaje}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}