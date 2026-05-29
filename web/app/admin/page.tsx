"use client"

import { supabase } from "@/lib/supabase"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Database, ArrowLeft, UploadCloud, FileText, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogEntry {
  hora: string
  estado: "OK" | "WARN" | "ERROR"
  mensaje: string
}

export default function AdminCatalogPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Manejador del Drag & Drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setLogs([]) // Limpiamos la consola al cargar uno nuevo
    }
  }

  // Simulación de progreso y envío real al backend
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 200)

    try {
      // 1. Pedimos el token de sesión a Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // 2. Preparamos el archivo
      const formData = new FormData()
      formData.append("file", file)

      // 3. Lo mandamos CON la autorización (el DNI)
      const response = await fetch("http://localhost:8080/api/admin/upload-catalogo", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}` 
          // IMPORTANTE: No va 'Content-Type' acá. Al mandar FormData, el navegador 
          // automáticamente le asigna el tipo "multipart/form-data" y un boundary.
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("El servidor rechazó el archivo o el token es inválido.")
      }

      const resultLogs = await response.json()
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setLogs(resultLogs)
      
    } catch (error) {
      clearInterval(progressInterval)
      setLogs([{ hora: new Date().toLocaleTimeString(), estado: "ERROR", mensaje: "Error de red al conectar con el servidor Java." }])
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  // Renderizado dinámico de los íconos de la consola
  const renderLogIcon = (estado: string) => {
    switch (estado) {
      case "OK": return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "WARN": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "ERROR": return <AlertCircle className="h-4 w-4 text-rose-500" />
      default: return null
    }
  }

  // Determinar si hay un error crítico (A1)
  const hasCriticalError = logs.some(log => log.mensaje.includes("FATAL"))

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
        
        {/* Encabezado del Módulo */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Database className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Gestión de Inmuebles</h1>
              <p className="text-sm text-muted-foreground">Módulo de actualización de catálogo y base de datos.</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Salir del módulo
          </Button>
        </div>

        {/* Pestañas (Ficticias visualmente) */}
        <div className="px-6 flex gap-6 border-b text-sm font-medium text-slate-500">
          <div className="py-3 border-b-2 border-primary text-primary cursor-pointer">Carga Masiva (CSV/JSON)</div>
          <div className="py-3 cursor-not-allowed opacity-50">Edición Manual</div>
        </div>

        <div className="p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Columna Izquierda: Zona de Carga */}
          <div className="w-full lg:w-[350px] flex flex-col gap-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-slate-300 hover:border-primary/50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
              }}
            >
              <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="font-bold text-slate-800 mb-1">Arrastrá tu archivo acá</h3>
              <p className="text-xs text-slate-500 mb-4">Soporta datasets externos (ej. BA Data)<br/>en formato .csv</p>
              
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Examinar equipo
              </Button>
            </div>

            {/* Ficha del Archivo y Progreso */}
            {file && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium line-clamp-1">{file.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Procesando..." : "Iniciar Importación"}
                </Button>
              </div>
            )}
          </div>

          {/* Columna Derecha: Consola de Operaciones */}
          <div className="flex-1 border rounded-xl bg-slate-50 flex flex-col overflow-hidden h-[400px]">
            <div className="bg-white border-b p-3 flex items-center justify-between text-sm font-bold text-slate-700">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Consola de Operaciones (Logs)</span>
              {hasCriticalError && <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded-md">Error crítico</span>}
              {!hasCriticalError && logs.length > 0 && <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">Finalizado</span>}
            </div>
            
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400">Esperando archivo para procesar ...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b">
                      <th className="font-normal pb-2 w-24">Hora</th>
                      <th className="font-normal pb-2 w-24">Estado</th>
                      <th className="font-normal pb-2">Mensaje / Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-slate-500 align-top">{log.hora}</td>
                        <td className="py-3 align-top flex items-center gap-1">
                          {renderLogIcon(log.estado)}
                          <span className={`${log.estado === 'ERROR' ? 'text-rose-600' : log.estado === 'WARN' ? 'text-yellow-600' : 'text-green-600'}`}>{log.estado}</span>
                        </td>
                        <td className={`py-3 align-top ${log.estado === 'ERROR' ? 'text-rose-600' : 'text-slate-700'}`}>
                          {log.mensaje}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}