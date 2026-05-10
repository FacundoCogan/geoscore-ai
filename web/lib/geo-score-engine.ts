export type Category = 'educacion' | 'deporte' | 'transporte' | 'salud'
export type Profile = 'student' | 'fitness' | 'health' | 'mobility' | null

// CU-09 Paso 3: Coeficientes de ponderación predefinidos
const PROFILE_WEIGHTS: Record<NonNullable<Profile>, Record<Category, number>> = {
  student: { educacion: 0.50, transporte: 0.20, salud: 0.15, deporte: 0.15 },
  fitness: { deporte: 0.50, salud: 0.20, transporte: 0.15, educacion: 0.15 },
  health: { salud: 0.50, deporte: 0.20, transporte: 0.15, educacion: 0.15 },
  mobility: { transporte: 0.50, educacion: 0.20, salud: 0.15, deporte: 0.15 },
}

// CU-09 A1: Ponderación neutra para visitantes
const NEUTRAL_WEIGHTS: Record<Category, number> = {
  educacion: 0.25, transporte: 0.25, salud: 0.25, deporte: 0.25
}

interface POI {
  id: string
  categoria: Category
  distancia: number // metros
}

export function calculateDynamicScore(pois: POI[], userProfile: Profile) {
  try {
    // Simulamos un error forzado para probar el Camino A2 si la entrada es corrupta
    if (!pois) throw new Error("Datos de POIs nulos")

    // Paso 2 y A1: Identificamos pesos a usar
    const weights = userProfile ? PROFILE_WEIGHTS[userProfile] : NEUTRAL_WEIGHTS

    // Paso 4: Cálculos base por categoría (simulando cercanía)
    // En el algoritmo final de Java acá usarías fórmulas logarítmicas de decaimiento por distancia
    const categoryScores = { educacion: 0, deporte: 0, transporte: 0, salud: 0 }
    
    pois.forEach(poi => {
      // Mientras más cerca, más puntos (Max 100 por POI a 0 metros, decae hasta 2000m)
      const proximityScore = Math.max(0, 100 - (poi.distancia / 20))
      categoryScores[poi.categoria] += proximityScore
    })

    // Normalizamos para que ninguna categoría pase de 100 puntos brutos
    Object.keys(categoryScores).forEach(key => {
      categoryScores[key as Category] = Math.min(100, categoryScores[key as Category])
    })

    // Paso 5: Aplicamos los multiplicadores dinámicos del perfil
    const weightedScores = {
      educacion: categoryScores.educacion * weights.educacion,
      deporte: categoryScores.deporte * weights.deporte,
      transporte: categoryScores.transporte * weights.transporte,
      salud: categoryScores.salud * weights.salud,
    }

    // Paso 6: Consolidamos el score final (sobre 100)
    const finalScore = Math.round(
      weightedScores.educacion + 
      weightedScores.deporte + 
      weightedScores.transporte + 
      weightedScores.salud
    )

    return {
      finalScore: Math.max(1, finalScore), // Nunca menos de 1
      weightsApplied: weights,
      rawScores: categoryScores,
      weightedScores: weightedScores
    }

  } catch (error) {
    // CU-09 A2: Error en la lógica de cálculo
    console.error("Error en motor de ponderación (CU-09 A2):", error)
    return {
      finalScore: 1, // Puntaje base de fallback
      weightsApplied: NEUTRAL_WEIGHTS,
      rawScores: { educacion: 0, deporte: 0, transporte: 0, salud: 0 },
      weightedScores: { educacion: 0, deporte: 0, transporte: 0, salud: 0 }
    }
  }
}