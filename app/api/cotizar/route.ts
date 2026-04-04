import { NextResponse } from 'next/server';

const PRIMA_GES = 0.9;
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

const planesColmena = [
  { nombre: "COLMENA STAR 226", isapre: "Colmena", precio_base: 1.15, tipo: "PF", region: "todas", cobertura_parto: "parcial", tope_anual: 2000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 0.7 UF", clinicas: ["Hospital del Profesor", "Clínica Dávila", "Clínica RedSalud", "Clínica Bupa"] },
  { nombre: "COLMENA STAR 226 (Grupo)", isapre: "Colmena", precio_base: 1.04, tipo: "Grupal", region: "todas", cobertura_parto: "parcial", tope_anual: 2000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 0.7 UF", clinicas: ["Hospital del Profesor", "Clínica Dávila", "Clínica RedSalud", "Clínica Bupa"] },
  { nombre: "COLMENA SILVER 226", isapre: "Colmena", precio_base: 1.20, tipo: "PF", region: "todas", cobertura_parto: "parcial", tope_anual: 3500, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.0 UF", clinicas: ["Clínica Dávila", "Clínica RedSalud", "Clínica Bupa", "Hospital Clínico U de Chile"] },
  { nombre: "COLMENA SILVER 226 (Grupo)", isapre: "Colmena", precio_base: 1.08, tipo: "Grupal", region: "todas", cobertura_parto: "parcial", tope_anual: 3500, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.0 UF", clinicas: ["Clínica Dávila", "Clínica RedSalud", "Clínica Bupa", "Hospital Clínico U de Chile"] },
  { nombre: "COLMENA BLUE 226", isapre: "Colmena", precio_base: 1.25, tipo: "PF", region: "todas", cobertura_parto: "completa", tope_anual: 5000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "70%", cobertura_urgencia: "Consulta: 70% | Integral: 1.0 UF", clinicas: ["Clínica RedSalud", "Clínica Dávila", "Clínica Indisa", "Clínica Bupa"] },
  { nombre: "COLMENA BLUE 226 (Grupo)", isapre: "Colmena", precio_base: 1.13, tipo: "Grupal", region: "todas", cobertura_parto: "completa", tope_anual: 5000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "70%", cobertura_urgencia: "Consulta: 70% | Integral: 1.0 UF", clinicas: ["Clínica RedSalud", "Clínica Dávila", "Clínica Indisa", "Clínica Bupa"] },
  { nombre: "COLMENA ELITE 126", isapre: "Colmena", precio_base: 1.76, tipo: "PF", region: "todas", cobertura_parto: "completa", tope_anual: 7000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.0 UF", clinicas: ["Clínica Dávila", "Clínica Bupa", "Clínica Indisa", "Clínica UC Christus", "Clínica San Carlos", "Clínica Santa María"] },
  { nombre: "COLMENA ELITE 126 (Grupo)", isapre: "Colmena", precio_base: 1.56, tipo: "Grupal", region: "todas", cobertura_parto: "completa", tope_anual: 7000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.0 UF", clinicas: ["Clínica Dávila", "Clínica Bupa", "Clínica Indisa", "Clínica UC Christus", "Clínica San Carlos", "Clínica Santa María"] },
  { nombre: "COLMENA DELUXE ULTRA 126", isapre: "Colmena", precio_base: 1.82, tipo: "PF", region: "todas", cobertura_parto: "completa", tope_anual: 8000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.0 UF", clinicas: ["Clínica Dávila", "Clínica Bupa", "Clínica Indisa", "Clínica Las Condes", "Clínica Santa María"] },
  { nombre: "COLMENA DELUXE ULTRA 126 (Grupo)", isapre: "Colmena", precio_base: 1.61, tipo: "Grupal", region: "todas", cobertura_parto: "completa", tope_anual: 8000, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.0 UF", clinicas: ["Clínica Dávila", "Clínica Bupa", "Clínica Indisa", "Clínica Las Condes", "Clínica Santa María"] },
  { nombre: "COLMENA MASTER 226", isapre: "Colmena", precio_base: 2.11, tipo: "PF", region: "todas", cobertura_parto: "completa", tope_anual: 8500, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "75%", cobertura_urgencia: "Consulta: 75% | Integral: 1.1 UF", clinicas: ["Clínica Dávila", "Clínica Bupa", "Clínica RedSalud Vitacura", "Clínica Indisa", "Clínica Los Andes", "Clínica Las Condes", "Clínica San Carlos", "Clínica UC Christus"] },
  { nombre: "COLMENA MASTER 226 (Grupo)", isapre: "Colmena", precio_base: 1.90, tipo: "Grupal", region: "todas", cobertura_parto: "completa", tope_anual: 8500, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "75%", cobertura_urgencia: "Consulta: 75% | Integral: 1.1 UF", clinicas: ["Clínica Dávila", "Clínica Bupa", "Clínica RedSalud Vitacura", "Clínica Indisa", "Clínica Los Andes", "Clínica Las Condes", "Clínica San Carlos", "Clínica UC Christus"] },
  { nombre: "COLMENA PRO 326", isapre: "Colmena", precio_base: 3.87, tipo: "PF", region: "todas", cobertura_parto: "completa", tope_anual: 8500, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.5 UF", clinicas: ["Clínica Alemana", "Clínica Las Condes", "Clínica Los Andes", "Clínica San Carlos", "Clínica Santa María", "Clínica RedSalud Vitacura", "Clínica UC Christus"] },
  { nombre: "COLMENA PRO 326 (Grupo)", isapre: "Colmena", precio_base: 3.48, tipo: "Grupal", region: "todas", cobertura_parto: "completa", tope_anual: 8500, cobertura_hospitalaria: "100%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: 1.5 UF", clinicas: ["Clínica Alemana", "Clínica Las Condes", "Clínica Los Andes", "Clínica San Carlos", "Clínica Santa María", "Clínica RedSalud Vitacura", "Clínica UC Christus"] },
  { nombre: "COLMENA PLUS 226", isapre: "Colmena", precio_base: 1.29, tipo: "LE", region: "todas", cobertura_parto: "parcial", tope_anual: 7500, cobertura_hospitalaria: "70%", cobertura_ambulatoria: "60%", cobertura_urgencia: "Consulta: 60% | Integral: según prestador", clinicas: ["Libre Elección - Puedes elegir cualquier clínica"] },
  { nombre: "COLMENA PLUS 226 (Grupo)", isapre: "Colmena", precio_base: 1.16, tipo: "Grupal", region: "todas", cobertura_parto: "parcial", tope_anual: 7500, cobertura_hospitalaria: "70%", cobertura_ambulatoria: "60%", cobertura_urgencia: "Consulta: 60% | Integral: según prestador", clinicas: ["Libre Elección - Puedes elegir cualquier clínica"] },
  { nombre: "COLMENA MAX 226", isapre: "Colmena", precio_base: 1.67, tipo: "LE", region: "regiones", cobertura_parto: "parcial", tope_anual: 7500, cobertura_hospitalaria: "60-80%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: según región", clinicas: ["Regiones - Consultar disponibilidad según ubicación"] },
  { nombre: "COLMENA MAX 226 (Grupo)", isapre: "Colmena", precio_base: 1.50, tipo: "Grupal", region: "regiones", cobertura_parto: "parcial", tope_anual: 7500, cobertura_hospitalaria: "60-80%", cobertura_ambulatoria: "80%", cobertura_urgencia: "Consulta: 80% | Integral: según región", clinicas: ["Regiones - Consultar disponibilidad según ubicación"] },
];

function getFactor(edad: number, tipo: string): number {
  if (!edad || edad === 0) return 0;
  const range = factorTable.find(r => edad >= r.min && edad <= r.max);
  if (!range) return tipo === 'titular' ? 2.4 : 2.2;
  return tipo === 'titular' ? range.titular : range.carga;
}

function calcularSumaFactores(titularEdad: number, cargasEdades: number[]): number {
  let suma = getFactor(titularEdad, 'titular');
  cargasEdades.forEach(edad => { if (edad && edad > 0) suma += getFactor(edad, 'carga'); });
  return suma;
}

function calcularCostoPlan(precioBaseUF: number, sumaFactores: number): number {
  return (precioBaseUF * sumaFactores) + PRIMA_GES;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { titularEdad, cargasEdades, renta, region, tipoPlan, clinicaPreferida, planActualCostoUF } = body;

  const sumaFactores = calcularSumaFactores(titularEdad, cargasEdades);
  const cotizacionLegalUF = (renta * 0.07) / VALOR_UF;

  let planesFiltrados = planesColmena;
  if (region === 'metropolitana') {
    planesFiltrados = planesColmena.filter(p => p.region !== 'regiones');
  }

  if (tipoPlan !== 'todos') {
    planesFiltrados = planesFiltrados.filter(p => p.tipo === tipoPlan);
  }

  const planesConCosto = planesFiltrados.map(plan => {
    const costoUF = calcularCostoPlan(plan.precio_base, sumaFactores);
    const costoPesos = costoUF * VALOR_UF;
    const porcentajeRenta = (costoPesos / renta) * 100;
    
    let incluyeClinica = false;
    if (clinicaPreferida && plan.clinicas) {
      incluyeClinica = plan.clinicas.some(c => 
        c.toLowerCase().includes(clinicaPreferida.toLowerCase()) || 
        clinicaPreferida.toLowerCase().includes(c.toLowerCase())
      );
    }
    
    return {
      nombre: plan.nombre,
      isapre: plan.isapre,
      tipo: plan.tipo,
      costoUF,
      costoPesos,
      porcentajeRenta,
      coberturaParto: plan.cobertura_parto === 'completa' ? '✅ Parto completo' : '⚠️ Parto con tope',
      topeAnualUF: plan.tope_anual,
      coberturaHospitalaria: plan.cobertura_hospitalaria,
      coberturaAmbulatoria: plan.cobertura_ambulatoria,
      coberturaUrgencia: plan.cobertura_urgencia,
      incluyeClinicaPreferida: incluyeClinica,
      clinicasPrincipales: plan.clinicas.slice(0, 4).join(', ') + (plan.clinicas.length > 4 ? '...' : '')
    };
  });

  planesConCosto.sort((a, b) => a.costoUF - b.costoUF);

  let mejorOpcionGeneral = null;
  let mejorOpcionConClinica = null;

  if (planActualCostoUF && planesConCosto.length > 0) {
    const masBaratoGeneral = planesConCosto[0];
    if (masBaratoGeneral && masBaratoGeneral.costoUF < planActualCostoUF) {
      mejorOpcionGeneral = {
        nombre: masBaratoGeneral.nombre,
        isapre: masBaratoGeneral.isapre,
        tipo: masBaratoGeneral.tipo,
        costoUF: masBaratoGeneral.costoUF,
        ahorroUF: planActualCostoUF - masBaratoGeneral.costoUF,
        coberturaHospitalaria: masBaratoGeneral.coberturaHospitalaria,
        coberturaAmbulatoria: masBaratoGeneral.coberturaAmbulatoria,
        coberturaUrgencia: masBaratoGeneral.coberturaUrgencia,
        coberturaParto: masBaratoGeneral.coberturaParto
      };
    }
    
    if (clinicaPreferida) {
      const planesConClinica = planesConCosto.filter(p => p.incluyeClinicaPreferida === true);
      if (planesConClinica.length > 0) {
        const masBaratoConClinica = planesConClinica[0];
        if (masBaratoConClinica && masBaratoConClinica.costoUF < planActualCostoUF) {
          mejorOpcionConClinica = {
            nombre: masBaratoConClinica.nombre,
            isapre: masBaratoConClinica.isapre,
            tipo: masBaratoConClinica.tipo,
            costoUF: masBaratoConClinica.costoUF,
            ahorroUF: planActualCostoUF - masBaratoConClinica.costoUF,
            coberturaHospitalaria: masBaratoConClinica.coberturaHospitalaria,
            coberturaAmbulatoria: masBaratoConClinica.coberturaAmbulatoria,
            coberturaUrgencia: masBaratoConClinica.coberturaUrgencia,
            coberturaParto: masBaratoConClinica.coberturaParto
          };
        }
      }
    }
  }

  return NextResponse.json({
    sumaFactores,
    cotizacionLegalUF,
    planActualCostoUF,
    mejorOpcionGeneral,
    mejorOpcionConClinica,
    topEconomicos: planesConCosto.slice(0, 10)
  });
}