"use client"

import { useState, useEffect } from "react"
import { Scale, ArrowLeft, Loader2, MapPin, CheckCircle2, School, Activity, Bus, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ComparePropertiesProps {
  property1: any;
  property2: any | null;
  userProfile: string | null;
  onClose: () => void;
}

export function CompareProperties({ property1, property2, userProfile, onClose }: ComparePropertiesProps) {
  const [data1, setData1] = useState<any>(null)
  const [data2, setData2] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComparativa = async () => {
      setIsLoading(true)
      try {
        const urlParams = userProfile ? `?perfil=${userProfile}` : '';
        
        const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inmuebles/${property1.id}/analisis${urlParams}`)
        setData1(await res1.json())

        if (property2) {
          const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inmuebles/${property2.id}/analisis${urlParams}`)
          setData2(await res2.json())
        }
      } catch (e) {
        console.error("Error calculando score", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchComparativa()
  }, [property1, property2, userProfile])

  return (
    <div className="w-full min-h-[600px] bg-background rounded-xl border shadow-sm p-6 relative animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><Scale className="h-6 w-6 text-primary" /></div>
          <div>
            <h2 className="text-2xl font-bold">Comparativa de Inmuebles</h2>
            {userProfile && <p className="text-sm text-primary font-medium">Ponderación aplicada: Perfil {userProfile.charAt(0).toUpperCase() + userProfile.slice(1)}</p>}
          </div>
        </div>
        <Button variant="ghost" className="gap-2" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROPIEDAD 1 */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
          <div className="mb-2">
            <Badge className="mb-2">Propiedad 1</Badge>
            <h3 className="font-bold text-lg">{property1.titulo}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3 shrink-0" /> {property1.direccion}, {property1.barrio}</p>
          </div>
          <div className="text-3xl font-bold text-primary">${property1.precio.toLocaleString("es-AR")}</div>
          <div className="grid grid-cols-2 gap-2 text-sm border-y py-4">
            <div className="flex flex-col"><span className="text-muted-foreground">Ambientes</span><span className="font-medium">{property1.ambientes}</span></div>
            <div className="flex flex-col"><span className="text-muted-foreground">Superficie</span><span className="font-medium">{property1.superficie} m²</span></div>
          </div>
          <div className="pt-2">
            <h4 className="font-semibold mb-3 flex items-center gap-2">Score de Entorno</h4>
            {!data1 ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <ScoreDetails data={data1} userProfile={userProfile} />}
          </div>
        </div>

        {/* PROPIEDAD 2 */}
        {property2 && (
          <div className="flex flex-col gap-4 p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="mb-2">
              <Badge variant="secondary" className="mb-2">Propiedad 2</Badge>
              <h3 className="font-bold text-lg">{property2.titulo}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3 shrink-0" /> {property2.direccion}, {property2.barrio}</p>
            </div>
            <div className="text-3xl font-bold text-primary">${property2.precio.toLocaleString("es-AR")}</div>
            <div className="grid grid-cols-2 gap-2 text-sm border-y py-4">
              <div className="flex flex-col"><span className="text-muted-foreground">Ambientes</span><span className="font-medium">{property2.ambientes}</span></div>
              <div className="flex flex-col"><span className="text-muted-foreground">Superficie</span>
                <span className={`font-medium flex items-center gap-1 ${property2.superficie > property1.superficie ? 'text-green-600' : ''}`}>
                  {property2.superficie} m² {property2.superficie > property1.superficie && <CheckCircle2 className="h-3 w-3"/>}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="font-semibold mb-3 flex items-center gap-2">Score de Entorno</h4>
              {isLoading || !data2 ? (
                <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-dashed h-[120px]">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <p className="text-sm font-medium">Calculando Score dinámico</p>
                </div>
              ) : <ScoreDetails data={data2} userProfile={userProfile} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreDetails({ data, userProfile }: { data: any, userProfile: string | null }) {
  // Destaca en negrita la categoría correspondiente al perfil seleccionado
  const isEst = userProfile === 'estudiante';
  const isFit = userProfile === 'fitness';
  const isSal = userProfile === 'salud';
  const isMov = userProfile === 'movilidad';

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-4 text-xl font-bold ${data.scoreGeneral >= 8 ? 'border-green-500 text-green-600' : data.scoreGeneral >= 6 ? 'border-yellow-500 text-yellow-600' : 'border-rose-500 text-rose-500'}`}>
        {data.scoreGeneral}
      </div>
      <div className="flex-1 space-y-2">
        <div className={`flex items-center justify-between text-xs ${isSal ? 'font-bold bg-rose-50 p-1 rounded' : ''}`}><span className="flex items-center gap-1"><Activity className="h-3 w-3 text-red-500"/> Salud ({data.conteo.salud} POIs)</span> <span>{data.detalles.salud}/10</span></div>
        <div className={`flex items-center justify-between text-xs ${isEst ? 'font-bold bg-blue-50 p-1 rounded' : ''}`}><span className="flex items-center gap-1"><School className="h-3 w-3 text-blue-500"/> Educación ({data.conteo.educacion} POIs)</span> <span>{data.detalles.educacion}/10</span></div>
        <div className={`flex items-center justify-between text-xs ${isMov ? 'font-bold bg-yellow-50 p-1 rounded' : ''}`}><span className="flex items-center gap-1"><Bus className="h-3 w-3 text-yellow-500"/> Transporte ({data.conteo.transporte} POIs)</span> <span>{data.detalles.transporte}/10</span></div>
        <div className={`flex items-center justify-between text-xs ${isFit ? 'font-bold bg-green-50 p-1 rounded' : ''}`}><span className="flex items-center gap-1"><Dumbbell className="h-3 w-3 text-green-500"/> Deporte ({data.conteo.deporte} POIs)</span> <span>{data.detalles.deporte}/10</span></div>
      </div>
    </div>
  )
}