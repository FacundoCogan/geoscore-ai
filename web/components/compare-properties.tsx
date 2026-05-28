"use client"

import { useState, useEffect } from "react"
import { Scale, ArrowLeft, AlertCircle, Loader2, MapPin, CheckCircle2, School, Activity, Bus, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ComparePropertiesProps {
  property1: any;
  property2: any | null;
  onClose: () => void;
}

export function CompareProperties({ property1, property2, onClose }: ComparePropertiesProps) {
  // Estado para simular el A2 (Cálculo de Score dinámico - CU-07)
  const [isCalculatingScore, setIsCalculatingScore] = useState(false)

  useEffect(() => {
    // Si entra la segunda propiedad y no tiene score, simulamos el cálculo
    if (property2 && !property2.scoreCalculado) {
      setIsCalculatingScore(true)
      const timer = setTimeout(() => {
        setIsCalculatingScore(false)
        property2.scoreCalculado = true // Lo marcamos como calculado en memoria
        property2.score = { general: 8.8, educacion: 9, salud: 8, transporte: 9, deporte: 9 }
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [property2])

  return (
    <div className="w-full min-h-[600px] bg-background rounded-xl border shadow-sm p-6 relative animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Comparativa de Inmuebles</h2>
        </div>
        {/* A0: El usuario desea abandonar el CU */}
        <Button variant="ghost" className="gap-2" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      {/* A1: Selección de un solo inmueble para comparar */}
      {!property2 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-destructive/10 rounded-lg border border-destructive/20 mb-8">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive">Selección incompleta</h3>
          <p className="text-sm text-destructive/80 mb-4">Debe seleccionar un segundo inmueble para proceder con la comparación.</p>
          <Button variant="outline" onClick={onClose}>Volver al listado</Button>
        </div>
      ) : (
        /* Curso Normal: Comparativa Side-by-Side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PROPIEDAD 1 */}
          <PropertyCompareColumn 
            property={property1} 
            badgeText="Propiedad 1" 
            badgeVariant="default" 
          />

          {/* PROPIEDAD 2 */}
          <div className="flex flex-col gap-4 p-5 rounded-xl border bg-card">
            <div className="mb-2">
              <Badge variant="secondary" className="mb-2">Propiedad 2</Badge>
              <h3 className="font-bold text-lg">{property2.titulo}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {property2.direccion}
              </p>
            </div>

            <div className="text-3xl font-bold text-primary">
              ${property2.precio.toLocaleString("es-AR")}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-y py-4">
              <div className="flex flex-col"><span className="text-muted-foreground">Ambientes</span><span className="font-medium">{property2.ambientes}</span></div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Superficie</span>
                <span className={`font-medium flex items-center gap-1 ${property2.superficie > property1.superficie ? 'text-green-600' : ''}`}>
                  {property2.superficie} m² {property2.superficie > property1.superficie && <CheckCircle2 className="h-3 w-3"/>}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-semibold mb-3 flex items-center gap-2">Score de Entorno</h4>
              {/* A2: Inmueble seleccionado no posee Score calculado */}
              {isCalculatingScore ? (
                <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-dashed h-[120px]">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <p className="text-sm font-medium">Calculando Score dinámico</p>
                </div>
              ) : (
                <ScoreDetails score={property2.score} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-componentes para mantener el código limpio
function PropertyCompareColumn({ property, badgeText, badgeVariant }: any) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border bg-card">
      <div className="mb-2">
        <Badge variant={badgeVariant} className="mb-2">{badgeText}</Badge>
        <h3 className="font-bold text-lg">{property.titulo}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {property.direccion}
        </p>
      </div>
      <div className="text-3xl font-bold text-primary">${property.precio.toLocaleString("es-AR")}</div>
      <div className="grid grid-cols-2 gap-2 text-sm border-y py-4">
        <div className="flex flex-col"><span className="text-muted-foreground">Ambientes</span><span className="font-medium">{property.ambientes}</span></div>
        <div className="flex flex-col"><span className="text-muted-foreground">Superficie</span><span className="font-medium">{property.superficie} m²</span></div>
      </div>
      <div className="pt-2">
        <h4 className="font-semibold mb-3 flex items-center gap-2">Score de Entorno</h4>
        <ScoreDetails score={property.score} />
      </div>
    </div>
  )
}

function ScoreDetails({ score }: { score: any }) {
  if (!score) return <div className="text-sm text-muted-foreground">Score no disponible</div>;
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-4 border-primary text-xl font-bold text-primary">
        {score.general}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1"><School className="h-3 w-3 text-blue-500"/> Educación</span> <span className="font-medium">{score.educacion}/10</span></div>
        <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1"><Activity className="h-3 w-3 text-red-500"/> Salud</span> <span className="font-medium">{score.salud}/10</span></div>
        <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1"><Bus className="h-3 w-3 text-yellow-500"/> Transporte</span> <span className="font-medium">{score.transporte}/10</span></div>
        <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1"><Dumbbell className="h-3 w-3 text-green-500"/> Deporte</span> <span className="font-medium">{score.deporte}/10</span></div>
      </div>
    </div>
  )
}