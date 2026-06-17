"use client"

import { useState } from "react"
import { X, MapPin, BedDouble, Ruler, Tag, Target, MessageCircle, Building, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PropertyDetailView({ property, userProfile, onClose }: any) {
  const [imgIndex, setImgIndex] = useState(0);
  if (!property) return null;

  const wppNumber = property.telefono ? property.telefono.replace(/\D/g, '') : null;
  
  let images = [];
  if (property.imagenes && property.imagenes.length > 0) {
      images = property.imagenes;
  } else if (property.imagen) {
      images = [property.imagen];
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 animate-in zoom-in-95">
        <Button variant="secondary" size="icon" className="absolute top-4 right-4 z-20 rounded-full shadow-md bg-white/80 hover:bg-white" onClick={onClose}><X className="h-5 w-5" /></Button>

        <div className="w-full md:w-1/2 h-64 md:h-[550px] relative bg-slate-900 flex flex-col items-center justify-center">
          {images.length > 0 ? (
             <>
               <img src={images[imgIndex]} alt="Propiedad" className="w-full h-full object-cover" />
               {images.length > 1 && (
                 <>
                   <Button variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 opacity-70 hover:opacity-100" onClick={() => setImgIndex(imgIndex === 0 ? images.length - 1 : imgIndex - 1)}><ChevronLeft className="h-5 w-5"/></Button>
                   <Button variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 opacity-70 hover:opacity-100" onClick={() => setImgIndex(imgIndex === images.length - 1 ? 0 : imgIndex + 1)}><ChevronRight className="h-5 w-5"/></Button>
                   <div className="absolute bottom-4 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                     {images.map((_, i) => <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}/>)}
                   </div>
                 </>
               )}
             </>
          ) : <Building className="h-16 w-16 text-slate-500 opacity-50" />}
          <Badge className="absolute top-4 left-4 text-sm px-3 py-1 uppercase tracking-wider bg-primary text-primary-foreground shadow-md">{property.tipoOperacion}</Badge>
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[550px]">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight">{property.titulo}</h2>
            <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-primary" />{property.direccion ? `${property.direccion}, ${property.barrio || ''}` : (property.barrio || 'Sin dirección')}</p>
          </div>
          
          <div className="text-4xl font-extrabold text-primary mb-6 tracking-tight">US$ {property.precio?.toLocaleString("es-AR")}</div>

          {property.geoScore !== undefined && (
            <div className="flex items-center gap-4 p-4 mb-6 bg-slate-50 border rounded-xl shadow-sm">
               <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 text-2xl font-bold bg-white shrink-0
                 ${property.geoScore >= 8 ? 'border-green-500 text-green-600' :
                   property.geoScore >= 6 ? 'border-yellow-500 text-yellow-600' :
                   'border-rose-500 text-rose-500'}`}>
                 {property.geoScore}
               </div>
               <div>
                 <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                   <Target className="h-5 w-5 text-primary" /> GeoScore AI
                 </h3>
                 <p className="text-sm text-slate-500 leading-tight mt-1">
                   Puntaje de entorno dinámico calculado
                   {userProfile ? ` aplicando la ponderación del perfil "${userProfile.charAt(0).toUpperCase() + userProfile.slice(1)}".` : ' con ponderación neutral.'}
                 </p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border">
              <BedDouble className="h-6 w-6 text-slate-400" />
              <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ambientes</p><p className="font-semibold text-lg">{property.ambientes || "-"}</p></div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border">
              <Ruler className="h-6 w-6 text-slate-400" />
              <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Superficie</p><p className="font-semibold text-lg">{property.superficie || "-"} m²</p></div>
            </div>
          </div>

          <div className="flex-1 pb-4 mb-4">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Tag className="h-4 w-4" /> Descripción General</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{property.descripcion || `Contáctate con el agente para más información.`}</p>
          </div>

          {wppNumber && (
            <div className="mt-auto border-t pt-6">
               <a href={`https://wa.me/${wppNumber}?text=Hola!%20Vi%20tu%20propiedad%20"${encodeURIComponent(property.titulo)}"%20en%20GeoScore%20AI.`} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg gap-2 shadow-lg"><MessageCircle className="h-5 w-5" /> Contactar por WhatsApp</Button>
               </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}