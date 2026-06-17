"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, Search, Shield, AlertTriangle, CheckCircle2, ArrowLeft, XCircle, User as UserIcon, Map, Building, PieChart, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  estado: "Activo" | "Suspendido"
}

interface ToastMessage {
  title: string
  desc: string
  type: "A0" | "A1" | "A2" | "OK"
}

export default function GestionUsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [isLoadingRole, setIsLoadingRole] = useState(true)
  
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingRole, setIsChangingRole] = useState(false)
  
  // Estado local para el dropdown de roles
  const [newRole, setNewRole] = useState<string>("")

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) {
          router.replace('/login')
          return
        }

        setAdminEmail(session.user.email)
        const res = await fetch(`http://localhost:8080/api/admin/usuarios?t=${Date.now()}`, { cache: 'no-store' })
        
        if (res.ok) {
          const data = await res.json()
          
          const me = data.find((u: any) => u.email === session.user.email)
          if (me) {
            const rolNormalizado = (me.rol === "Agente Inmobiliario") ? "Inmobiliaria" : me.rol;
            
            if (rolNormalizado !== 'Administrador') {
              router.replace(rolNormalizado === 'Inmobiliaria' ? '/admin' : '/')
              return
            }
          }
          
          setUsuarios(data)
          setFilteredUsers(data)
        }
      } catch (e) {
        console.error("Error conectando al backend")
      } finally {
        setIsLoadingRole(false)
      }
    }
    init()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/usuarios?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUsuarios(data)
        setFilteredUsers(data)
      }
    } catch (e) {
      console.error("Error conectando al backend")
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(usuarios)
      return
    }
    
    const normalizeStr = (str: string | null) => {
      if (!str) return ""
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    }
    
    const lowerSearch = normalizeStr(searchTerm)
    
    setFilteredUsers(usuarios.filter(u => 
      normalizeStr(u.nombre).includes(lowerSearch) || normalizeStr(u.email).includes(lowerSearch)
    ))
  }, [searchTerm, usuarios])

  const showToast = (title: string, desc: string, type: ToastMessage["type"]) => {
    setToast({ title, desc, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCancel = () => {
    setSelectedUser(null)
    setNewRole("") // Limpiar el rol al cancelar
  }

  const handleToggleEstado = async (nuevoEstado: "Activo" | "Suspendido") => {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const res = await fetch(`http://localhost:8080/api/admin/usuarios/${selectedUser.id}/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, estado: nuevoEstado })
      })

      let data: any = {}
      const text = await res.text()
      if (text) {
        try { data = JSON.parse(text) } catch (e) {}
      }

      if (res.status === 404) {
        showToast("Inconsistencia de datos", (data.mensaje || "El usuario no fue encontrado.") + " Actualizando lista...", "A1")
        setSelectedUser(null)
        fetchUsuarios()
      } else if (res.status === 403) {
        showToast("Acción denegada", data.mensaje || "No tienes permisos para realizar esta acción.", "A2")
      } else if (res.ok) {
        showToast("Operación exitosa", data.mensaje || "Estado actualizado correctamente.", "OK")
        setSelectedUser({ ...selectedUser, estado: nuevoEstado })
        fetchUsuarios()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // NUEVO: Función para cambiar el rol
  const handleChangeRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.rol) return;
    setIsChangingRole(true);

    try {
      const res = await fetch(`http://localhost:8080/api/admin/usuarios/${selectedUser.id}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: newRole })
      });

      if (res.ok) {
        showToast("Operación exitosa", "Rol actualizado correctamente.", "OK");
        setSelectedUser({ ...selectedUser, rol: newRole });
        fetchUsuarios();
      } else {
        const data = await res.json();
        showToast("Error", data.error || "No se pudo cambiar el rol.", "A1");
      }
    } catch (e) {
      showToast("Error de red", "No se pudo contactar al servidor.", "A1");
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleSelectUser = (u: Usuario) => {
      setSelectedUser(u);
      setNewRole(u.rol === "Agente Inmobiliario" ? "Inmobiliaria" : u.rol);
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

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#111111] text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-4 min-w-[450px] animate-in slide-in-from-top-5 border border-slate-800">
          {toast.type === 'OK' && <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />}
          {toast.type === 'A1' && <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />}
          {(toast.type === 'A0' || toast.type === 'A2') && <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />}
          <div className="flex flex-col">
            <span className="font-bold text-[15px]">{toast.title}</span>
            <span className="text-[13px] text-slate-300 mt-1 leading-snug">{toast.desc}</span>
          </div>
        </div>
      )}

      <div className="flex flex-1 w-full">
        
        <aside className="w-64 border-r bg-white p-6 hidden md:block shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Módulos del Sistema</div>
          <nav className="flex flex-col gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <PieChart className="h-5 w-5" /> Dashboard
            </Link>
            <Link href="/admin/usuarios" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold transition-colors">
              <Users className="h-5 w-5" /> Gestión de Usuarios
            </Link>
            <Link href="/admin/geo" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <Map className="h-5 w-5" /> Datos Geográficos
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl font-semibold transition-colors">
              <Building className="h-5 w-5" /> Inmuebles
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Módulo: Gestión de Usuarios</h1>
              <p className="text-slate-600 text-sm mt-1">Utiliza la tabla para buscar cuentas registradas. Selecciona un usuario para modificar su estado.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-8">
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h2>
                  <p className="text-sm text-slate-500">Supervisión de cuentas, estados y permisos de la plataforma.</p>
                </div>
              </div>

              {!selectedUser ? (
                <div className="animate-in fade-in duration-200">
                  <div className="relative mb-6 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Buscar por nombre o correo electrónico..." 
                      className="pl-9 bg-slate-50/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                        <tr>
                          <th className="px-6 py-4">Usuario</th>
                          <th className="px-6 py-4">Correo Electrónico</th>
                          <th className="px-6 py-4">Rol</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const isMe = u.email === adminEmail;
                          return (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                  {u.nombre ? u.nombre.charAt(0) : '?'}
                                </div>
                                {u.nombre || "Sin nombre"}
                                {isMe && <span className="px-2 py-0.5 rounded-full border bg-white text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tú</span>}
                              </td>
                              <td className="px-6 py-4 text-slate-600">{u.email}</td>
                              <td className="px-6 py-4 text-slate-600">{u.rol}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {u.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="sm" className="font-semibold" onClick={() => handleSelectUser(u)}>
                                  Revisar
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">No se encontraron usuarios.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-200">
                  <Button variant="ghost" className="mb-6 gap-2 text-slate-600 hover:text-slate-900" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4" /> Volver al listado
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="md:col-span-1 border rounded-2xl p-8 flex flex-col items-center text-center bg-slate-50/30">
                      <div className="h-24 w-24 rounded-full bg-slate-100 border flex items-center justify-center mb-4">
                        <UserIcon className="h-10 w-10 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedUser.nombre || "Sin nombre"}</h3>
                      <p className="text-sm text-slate-500 mb-4">{selectedUser.email}</p>
                      
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${selectedUser.estado === 'Activo' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {selectedUser.estado}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 border rounded-full">
                        <Shield className="h-3.5 w-3.5" /> {selectedUser.rol}
                      </div>
                    </div>

                    <div className="md:col-span-2 border rounded-2xl p-8">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Shield className="h-5 w-5" /> Acciones Administrativas
                      </h3>

                      <div className="flex flex-col gap-4">
                        <div className="p-5 border rounded-xl flex items-center justify-between bg-white">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Estado de la cuenta</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {selectedUser.estado === 'Activo' ? 'Suspender impedirá que el usuario inicie sesión.' : 'Activar restaurará el acceso del usuario al sistema.'}
                            </p>
                          </div>
                          <Button 
                            variant={selectedUser.estado === 'Activo' ? 'destructive' : 'default'}
                            className="gap-2 min-w-[120px]"
                            disabled={isLoading || selectedUser.email === adminEmail} // No te podés suspender a vos mismo
                            onClick={() => handleToggleEstado(selectedUser.estado === 'Activo' ? 'Suspendido' : 'Activo')}
                          >
                            {selectedUser.estado === 'Activo' ? <><XCircle className="h-4 w-4"/> Suspender</> : <><CheckCircle2 className="h-4 w-4"/> Activar</>}
                          </Button>
                        </div>

                        {/* Editar Permisos Desbloqueado */}
                        <div className="p-5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Editar Permisos</h4>
                            <p className="text-xs text-slate-500 mt-1">Modificar el nivel de acceso (Usuario / Inmobiliaria / Administrador).</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select 
                              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-40 disabled:opacity-50"
                              value={newRole || ""}
                              onChange={(e) => setNewRole(e.target.value)}
                              disabled={selectedUser.email === adminEmail} // No te podés cambiar el rol a vos mismo
                            >
                              <option value="Usuario">Usuario Estándar</option>
                              <option value="Inmobiliaria">Inmobiliaria</option>
                              <option value="Administrador">Administrador</option>
                            </select>
                            <Button 
                               onClick={handleChangeRole} 
                               disabled={isChangingRole || newRole === (selectedUser.rol === "Agente Inmobiliario" ? "Inmobiliaria" : selectedUser.rol) || selectedUser.email === adminEmail}
                               className="gap-2 bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                            >
                              {isChangingRole ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </div>
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