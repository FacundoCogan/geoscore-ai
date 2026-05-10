"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  MapPin, 
  GraduationCap, 
  Dumbbell, 
  Bus, 
  Heart,
  AlertTriangle,
  Info,
  Loader2,
  X,
  Building2,
  UserCircle
} from "lucide-react"

export interface POI {
  id: string
  nombre: string
  categoria: "educacion" | "deporte" | "transporte" | "salud"
  distancia: number
  tipo: string
}

export interface CategoryScore {
  categoria: string
  score: number
  peso: number
  cantidadPOIs: number
  icon: React.ReactNode
  color: string
}

export interface EnvironmentScoreData {
  scoreTotal: number
  categorias: CategoryScore[]
  pois: POI[]
  radioKm: number
  perfilAplicado: string | null
}

interface EnvironmentScoreProps {
  propertyId: string
  propertyAddress: string
  propertyBarrio: string
  isRegisteredUser: boolean
  userProfile: string | null
  pois?: POI[] // Lo hacemos opcional para poder inyectarle datos reales luego
  onClose: () => void
}

const MOCK_POIS: POI[] = [
  { id: "1", nombre: "Escuela Primaria N°15", categoria: "educacion", distancia: 320, tipo: "Escuela Primaria" },
  { id: "2", nombre: "Colegio Nacional Buenos Aires", categoria: "educacion", distancia: 850, tipo: "Colegio Secundario" },
  { id: "3", nombre: "Universidad de Buenos Aires - Sede", categoria: "educacion", distancia: 1200, tipo: "Universidad" },
  { id: "4", nombre: "Club Atlético River Plate - Sede", categoria: "deporte", distancia: 450, tipo: "Club Deportivo" },
  { id: "5", nombre: "Gimnasio FitLife", categoria: "deporte", distancia: 180, tipo: "Gimnasio" },
  { id: "6", nombre: "Parque con circuito aeróbico", categoria: "deporte", distancia: 600, tipo: "Espacio Verde" },
  { id: "7", nombre: "Estación de Subte Línea D", categoria: "transporte", distancia: 250, tipo: "Subte" },
  { id: "8", nombre: "Parada de Colectivo 152", categoria: "transporte", distancia: 80, tipo: "Colectivo" },
  { id: "9", nombre: "Estación de Tren Belgrano", categoria: "transporte", distancia: 900, tipo: "Tren" },
  { id: "10", nombre: "Hospital Alemán", categoria: "salud", distancia: 1100, tipo: "Hospital" },
  { id: "11", nombre: "Farmacia del Pueblo", categoria: "salud", distancia: 150, tipo: "Farmacia" },
  { id: "12", nombre: "Centro de Salud Municipal", categoria: "salud", distancia: 700, tipo: "Centro de Salud" },
]

// Pesos alineados con el CU-06
const PROFILE_WEIGHTS: Record<string, Record<string, number>> = {
  student: { educacion: 0.4, deporte: 0.15, transporte: 0.35, salud: 0.1 },
  fitness: { educacion: 0.1, deporte: 0.5, transporte: 0.2, salud: 0.2 },
  health: { educacion: 0.1, deporte: 0.2, transporte: 0.2, salud: 0.5 },
  mobility: { educacion: 0.15, deporte: 0.15, transporte: 0.55, salud: 0.15 },
  neutral: { educacion: 0.25, deporte: 0.25, transporte: 0.25, salud: 0.25 }, // CU-07 A2
}

const PROFILE_NAMES: Record<string, string> = {
  student: "Estudiante",
  fitness: "Fitness",
  health: "Salud",
  mobility: "Movilidad"
}

const CATEGORY_CONFIG = {
  educacion: { label: "Educación", icon: <GraduationCap className="h-5 w-5" />, color: "bg-blue-500" },
  deporte: { label: "Deporte", icon: <Dumbbell className="h-5 w-5" />, color: "bg-green-500" },
  transporte: { label: "Transporte", icon: <Bus className="h-5 w-5" />, color: "bg-amber-500" },
  salud: { label: "Salud", icon: <Heart className="h-5 w-5" />, color: "bg-red-500" },
}

function calculateCategoryScore(pois: POI[], categoria: string): number {
  const categoryPOIs = pois.filter(p => p.categoria === categoria)
  if (categoryPOIs.length === 0) return 0
  
  let score = 0
  categoryPOIs.forEach(poi => {
    const proximityScore = Math.max(0, 2.5 - (poi.distancia / 800))
    score += proximityScore
  })
  return Math.min(10, Math.max(1, score))
}

export function EnvironmentScoreView({
  propertyId,
  propertyAddress,
  propertyBarrio,
  isRegisteredUser,
  userProfile,
  pois = MOCK_POIS,
  onClose,
}: EnvironmentScoreProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [scoreData, setScoreData] = useState<EnvironmentScoreData | null>(null)

  const profileKey = userProfile || "neutral"
  const weights = PROFILE_WEIGHTS[profileKey]

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const categorias: CategoryScore[] = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
        const categoryPOIs = pois.filter(p => p.categoria === key)
        const rawScore = calculateCategoryScore(pois, key)
        
        return {
          categoria: config.label,
          score: rawScore,
          peso: weights[key],
          cantidadPOIs: categoryPOIs.length,
          icon: config.icon,
          color: config.color,
        }
      })

      let scoreTotal: number
      if (pois.length === 0) {
        scoreTotal = 1 // CU-07 A1: Sin POIs
      } else {
        scoreTotal = categorias.reduce((acc, cat) => acc + (cat.score * cat.peso), 0)
        scoreTotal = Math.round(scoreTotal * 10) / 10
      }

      setScoreData({
        scoreTotal,
        categorias,
        pois,
        radioKm: 2,
        perfilAplicado: userProfile,
      })
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [userProfile, weights, pois])

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500"
    if (score >= 6) return "text-amber-500"
    if (score >= 4) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excelente"
    if (score >= 6) return "Bueno"
    if (score >= 4) return "Regular"
    return "Bajo"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Score de Entorno</h1>
              <p className="text-sm text-muted-foreground">{propertyAddress}, {propertyBarrio}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Calculando Score de Entorno...</h3>
            <p className="text-muted-foreground mt-2">Analizando Puntos de Interés en un radio de 2 km mediante PostGIS</p>
          </div>
        ) : scoreData ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* CU-07 A2: Advertencia de perfil neutro */}
              {!scoreData.perfilAplicado && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900">Ponderación neutra aplicada</p>
                    <p className="text-sm text-blue-800 mt-1">
                      No tenés un perfil de estilo de vida configurado. El score se calcula con pesos equitativos (25%) para todas las categorías.
                    </p>
                  </div>
                </div>
              )}

              {/* CU-07 A1: Advertencia de falta de POIs */}
              {scoreData.pois.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900">Baja densidad de servicios</p>
                    <p className="text-sm text-amber-800 mt-1">
                      No se detectaron puntos de interés en un radio de 2 km de esta propiedad. El score base asignado es de 1 punto.
                    </p>
                  </div>
                </div>
              )}

              <Card className="shadow-sm border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative shrink-0">
                      <div className={`w-36 h-36 rounded-full border-8 ${
                        scoreData.scoreTotal >= 8 ? "border-green-500" :
                        scoreData.scoreTotal >= 6 ? "border-amber-500" :
                        scoreData.scoreTotal >= 4 ? "border-orange-500" : "border-red-500"
                      } flex items-center justify-center bg-card shadow-inner`}>
                        <div className="text-center">
                          <span className={`text-5xl font-black ${getScoreColor(scoreData.scoreTotal)}`}>
                            {scoreData.scoreTotal}
                          </span>
                          <span className="text-xl text-muted-foreground font-medium">/10</span>
                        </div>
                      </div>
                      <Badge 
                        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 text-sm shadow-md ${
                          scoreData.scoreTotal >= 8 ? "bg-green-500 hover:bg-green-600" :
                          scoreData.scoreTotal >= 6 ? "bg-amber-500 hover:bg-amber-600" :
                          scoreData.scoreTotal >= 4 ? "bg-orange-500 hover:bg-orange-600" : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {getScoreLabel(scoreData.scoreTotal)}
                      </Badge>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-foreground mb-2">Score de Entorno General</h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        Análisis de compatibilidad urbana basado en <strong>{scoreData.pois.length} puntos de interés</strong> detectados en un radio de {scoreData.radioKm} km.
                      </p>
                      {scoreData.perfilAplicado && (
                        <Badge variant="secondary" className="gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                          <UserCircle className="h-3.5 w-3.5 mr-1" />
                          Perfil aplicado: {PROFILE_NAMES[scoreData.perfilAplicado]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg">Desglose por Categorías</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-6">
                    {scoreData.categorias.map((cat) => (
                      <div key={cat.categoria} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cat.color} text-white shadow-sm`}>
                              {cat.icon}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">{cat.categoria}</p>
                              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                {cat.cantidadPOIs} POIs • Peso: {Math.round(cat.peso * 100)}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreColor(cat.score)}`}>
                              {cat.score.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">/10</span>
                          </div>
                        </div>
                        <Progress value={cat.score * 10} className="h-2 bg-muted" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg">Perfil de Compatibilidad</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 gap-3 h-full">
                      {scoreData.categorias.map((cat) => (
                        <div key={cat.categoria} className="relative p-4 rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col justify-center">
                          <div 
                            className={`absolute bottom-0 left-0 right-0 ${cat.color} opacity-10 transition-all duration-1000`}
                            style={{ height: `${cat.score * 10}%` }}
                          />
                          <div className="relative z-10 flex flex-col items-center text-center gap-2">
                            <div className={`p-2 rounded-full ${cat.color} text-white`}>
                              {cat.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-muted-foreground">{cat.categoria}</p>
                              <p className={`text-xl font-black ${getScoreColor(cat.score)}`}>
                                {cat.score.toFixed(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg flex justify-between items-center">
                    Área de Influencia
                    <Badge variant="outline">2 km</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                    <div className="absolute inset-4 rounded-full border-2 border-primary/20 bg-primary/5" />
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>

                    {scoreData.pois.length > 0 ? (
                      <>
                        <div className="absolute top-[20%] left-[30%]"><div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm border border-white"><GraduationCap className="h-3 w-3 text-white" /></div></div>
                        <div className="absolute top-[35%] right-[25%]"><div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm border border-white"><Dumbbell className="h-3 w-3 text-white" /></div></div>
                        <div className="absolute bottom-[30%] left-[25%]"><div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm border border-white"><Bus className="h-3 w-3 text-white" /></div></div>
                        <div className="absolute bottom-[25%] right-[30%]"><div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm border border-white"><Heart className="h-3 w-3 text-white" /></div></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                        <p className="text-sm font-medium text-muted-foreground px-4 text-center">
                          No se detectaron servicios en el área
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg">Servicios Detectados</CardTitle>
                  <CardDescription>{scoreData.pois.length} puntos de interés extraídos de BA Data</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {scoreData.pois.length === 0 ? (
                    <div className="p-8 text-center">
                      <MapPin className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">La zona carece de servicios públicos registrados.</p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                      {scoreData.pois.sort((a,b) => a.distancia - b.distancia).map((poi) => (
                        <div key={poi.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                          <div className={`p-1.5 rounded-md ${CATEGORY_CONFIG[poi.categoria].color} text-white shadow-sm`}>
                            {CATEGORY_CONFIG[poi.categoria].icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{poi.nombre}</p>
                            <p className="text-xs text-muted-foreground">{poi.tipo}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 bg-background font-medium">
                            {poi.distancia < 1000 ? `${poi.distancia}m` : `${(poi.distancia / 1000).toFixed(1)}km`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}