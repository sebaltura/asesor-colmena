import { NextResponse } from 'next/server';

const PRIMA_GES_COLMENA = 1.036; 
const VALOR_UF = 39841.72;

const factorTable = [
  { min: 0, max: 19, titular: 0.6, carga: 0.6 },
  { min: 20, max: 24, titular: 0.9, carga: 0.7 },
  { min: 25, max: 34, titular: 1.0, carga: 0.7 },
  { min: 35, max: 44, titular: 1.3, carga: 0.9 },
  { min: 45, max: 54, titular: 1.4, carga: 1.0 },
  { min: 55, max: 64, titular: 2.0, carga: 1.4 },
  { min: 65, max: 200, titular: 2.4, carga: 2.2 }
];

function getFactor(edad: number, tipo: string): number {
  if (edad === undefined || edad === null || isNaN(edad)) return 0;
  const range = factorTable.find(r => edad >= r.min && edad <= r.max);
  if (!range) return tipo === 'titular' ? 2.4 : 2.2;
  return tipo === 'titular' ? range.titular : range.carga;
}

// Función para buscar sin importar tildes ni mayúsculas
const normalizar = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titularEdad, cargasEdades, renta, region, tipoPlan, clinicaPreferida, planActualCostoUF, planes, requiereParto } = body;

    if (!planes) return NextResponse.json({ error: "No se recibieron planes" }, { status: 400 });

    const numPersonas = 1 + (cargasEdades ? cargasEdades.length : 0);
    let sumaFactores = getFactor(titularEdad, 'titular');
    cargasEdades?.forEach((e: number) => { sumaFactores += getFactor(e, 'carga'); });
    sumaFactores = Math.round(sumaFactores * 100) / 100;
    
    const presupuestoActual = planActualCostoUF ? parseFloat(planActualCostoUF) : 0;

    let filtrados = planes;

    if (region === 'metropolitana') filtrados = filtrados.filter((p: any) => p.region !== 'regiones');
    if (region === 'regiones') filtrados = filtrados.filter((p: any) => p.region === 'regiones');
    if (tipoPlan !== 'todos') filtrados = filtrados.filter((p: any) => p.tipo === tipoPlan);
    if (requiereParto) filtrados = filtrados.filter((p: any) => p.tiene_parto_completo === true);

    const calculados = filtrados.map((p: any) => {
      const costo = (p.precio_base * sumaFactores) + (PRIMA_GES_COLMENA * numPersonas);
      
      // Búsqueda inteligente de clínica (sin importar tildes)
      const incluye = clinicaPreferida && clinicaPreferida !== "" 
                      ? normalizar(p.clinicas).includes(normalizar(clinicaPreferida)) 
                      : false;
                      
      return {
        ...p,
        costoUF: costo || 0,
        incluyeClinicaPreferida: incluye,
      };
    });

    // Encontrar el mejor plan con la clínica (el más cercano al presupuesto o el más barato)
    const opcionesConClinica = calculados.filter((p: any) => p.incluyeClinicaPreferida === true);
    let mejorConClinica = null;
    
    if (opcionesConClinica.length > 0) {
        if (presupuestoActual > 0) {
            const ordenCercaniaC = [...opcionesConClinica].sort((a, b) => Math.abs(a.costoUF - presupuestoActual) - Math.abs(b.costoUF - presupuestoActual));
            mejorConClinica = ordenCercaniaC[0];
        } else {
            const ordenPrecio = [...opcionesConClinica].sort((a,b) => a.costoUF - b.costoUF);
            mejorConClinica = ordenPrecio[0];
        }
    }

    let seleccionFinal = [];

    // Seleccionamos los 6 más cercanos al presupuesto
    if (presupuestoActual > 0) {
      const ordenCercania = [...calculados].sort((a, b) => 
        Math.abs(a.costoUF - presupuestoActual) - Math.abs(b.costoUF - presupuestoActual)
      );
      seleccionFinal = ordenCercania.slice(0, 6);
    } else {
      seleccionFinal = [...calculados].sort((a, b) => a.costoUF - b.costoUF).slice(0, 6);
    }

    // Nos aseguramos 100% de que la recomendación estrella se agregue a la tabla
    if (mejorConClinica && !seleccionFinal.some(p => p.nombre === mejorConClinica.nombre)) {
      if (seleccionFinal.length >= 6) seleccionFinal.pop();
      seleccionFinal.push(mejorConClinica);
    }

    // Ordenamos de mayor cobertura/precio a menor
    seleccionFinal.sort((a, b) => b.costoUF - a.costoUF);

    return NextResponse.json({
      sumaFactores,
      planActualCostoUF: presupuestoActual,
      mejorOpcionConClinica: mejorConClinica || null,
      topEconomicos: seleccionFinal
    });
  } catch (error) {
    return NextResponse.json({ error: "Error en el cálculo" }, { status: 500 });
  }
}