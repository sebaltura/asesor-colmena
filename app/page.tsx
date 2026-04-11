'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ResultadosType = {
  sumaFactores: number;
  planActualCostoUF: number;
  mejorOpcionConClinica: any;
  topEconomicos: any[];
};

export default function Home() {
  const agenteNombre = "Angélica Peñailillo";
  const agenteTelefono = "+56944088450";
  const agenteEmail = "angelica.penailillo@colmena.cl";

  const [titularEdad, setTitularEdad] = useState('');
  const [cargas, setCargas] = useState(['', '']);
  const [renta, setRenta] = useState('');
  const [region, setRegion] = useState('metropolitana');
  const [tipoPlan, setTipoPlan] = useState('todos');
  const [clinicaPreferida, setClinicaPreferida] = useState('');
  const [requiereParto, setRequiereParto] = useState(false);
  const [planActualNombre, setPlanActualNombre] = useState('');
  const [planActualCostoUF, setPlanActualCostoUF] = useState('');
  const [planActualPDF, setPlanActualPDF] = useState('');
  const [resultados, setResultados] = useState<ResultadosType | null>(null);
  const [cargando, setCargando] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [folio, setFolio] = useState('');

  const agregarCarga = () => {
    if (cargas.length < 6) setCargas([...cargas, '']);
  };

  const actualizarCarga = (index: number, valor: string) => {
    const nuevas = [...cargas];
    nuevas[index] = valor;
    setCargas(nuevas);
  };

  const formatearPesos = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
  };

  const generarNumeroFolio = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CTZ-${año}${mes}${dia}-${aleatorio}`;
  };

  const generarPDF = () => {
    if (!resultados) return;
    
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-CL');
    const nuevoFolio = generarNumeroFolio();
    setFolio(nuevoFolio);
    
    const presupuestoValido = resultados.planActualCostoUF > 0;
    
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59); 
    doc.text('ASESOR COLMENA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Informe de Cotizacion Estrategica', 105, 28, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Folio: ${nuevoFolio}`, 14, 40);
    doc.text(`Fecha: ${fecha}`, 14, 45);
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-CL')}`, 14, 50);
    
    doc.setDrawColor(34, 211, 238); 
    doc.line(14, 55, 200, 55);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('DATOS DEL CLIENTE', 14, 68);
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    let y = 78;
    doc.text(`Nombre: ${clienteNombre || 'No especificado'}`, 14, y); y += 6;
    doc.text(`Email: ${clienteEmail || 'No especificado'}`, 14, y); y += 6;
    doc.text(`Telefono: ${clienteTelefono || 'No especificado'}`, 14, y); y += 8;
    
    doc.text(`Edad Titular: ${titularEdad} anos`, 14, y); y += 5;
    doc.text(`Cargas: ${cargas.filter(c => c && c !== '').join(', ') || 'Ninguna'} anos`, 14, y); y += 5;
    doc.text(`Suma de factores: ${resultados.sumaFactores || 0}`, 14, y); y += 5;
    doc.text(`Renta imponible: ${formatearPesos(parseFloat(renta) || 0)}`, 14, y); y += 5;
    doc.text(`Cotizacion legal 7%: ${formatearPesos((parseFloat(renta) || 0) * 0.07)}`, 14, y); y += 5;
    doc.text(`Region: ${region === 'metropolitana' ? 'Metropolitana' : 'Regiones (MAX)'}`, 14, y); y += 5;
    doc.text(`Tipo de plan: ${tipoPlan === 'todos' ? 'Todos' : tipoPlan === 'PF' ? 'Individual (PF)' : tipoPlan === 'Grupal' ? 'Grupal' : 'Libre Eleccion (LE)'}`, 14, y); y += 5;
    
    if (clinicaPreferida) {
      doc.text(`Clinica preferente: ${clinicaPreferida}`, 14, y); y += 8;
    }
    
    if (presupuestoValido) {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('PLAN ACTUAL DEL CLIENTE', 14, y + 5);
      y += 15;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Plan: ${planActualNombre || 'No especificado'}`, 14, y); y += 6;
      doc.text(`Costo mensual: ${resultados.planActualCostoUF} UF`, 14, y); y += 6;
      if (planActualPDF) {
        doc.text(`Documento adjunto: ${planActualPDF}`, 14, y); y += 6;
      }
    }
    
    y += 5;
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('PROPUESTA DE VALOR COLMENA', 14, y + 5);
    y += 15;
    
    const tableData = resultados.topEconomicos?.map((plan: any) => {
      let etiqueta = '';
      if (resultados.mejorOpcionConClinica && plan.nombre === resultados.mejorOpcionConClinica.nombre) {
        etiqueta = '(Rec.)';
      }

      const row = [
        (plan.nombre.length > 25 ? plan.nombre.substring(0, 23) + '...' : plan.nombre) + " " + etiqueta,
        plan.tipo === 'PF' ? 'Ind' : plan.tipo === 'Grupal' ? 'Grp' : 'LE',
        `${plan.costoUF.toFixed(2)}`,
        plan.cobertura_hospitalaria?.substring(0, 18) || 'Ver det.',
        plan.cobertura_ambulatoria?.substring(0, 18) || 'Ver det.',
        plan.incluyeClinicaPreferida ? 'SI' : 'NO'
      ];

      if (presupuestoValido) {
        const ahorroNum = resultados.planActualCostoUF - plan.costoUF;
        const ahorroStr = ahorroNum > 0 ? `+${ahorroNum.toFixed(2)}` : ahorroNum.toFixed(2);
        row.splice(3, 0, ahorroStr); 
      }
      return row;
    });
    
    // NUEVO: Se agregaron Hospitalizacion y Ambulatorio de manera separada
    const headRow = presupuestoValido 
      ? [['Plan propuesto', 'Tipo', 'Costo UF', 'Ahorro UF', 'Hospitalizacion', 'Ambulatorio', 'En Red?']]
      : [['Plan propuesto', 'Tipo', 'Costo UF', 'Hospitalizacion', 'Ambulatorio', 'En Red?']];

    // Ajuste milimétrico de celdas para que quepan ambas columnas en el PDF
    autoTable(doc, {
      startY: y + 5,
      head: headRow,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], halign: 'center' }, 
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: presupuestoValido ? {
        0: { cellWidth: 42 },
        1: { cellWidth: 9, halign: 'center' },
        2: { cellWidth: 15, halign: 'right' },
        3: { cellWidth: 14, halign: 'right', textColor: [34, 139, 34] },
        4: { cellWidth: 35, halign: 'left' },
        5: { cellWidth: 35, halign: 'left' },
        6: { cellWidth: 14, halign: 'center' }
      } : {
        0: { cellWidth: 45 },
        1: { cellWidth: 12, halign: 'center' },
        2: { cellWidth: 18, halign: 'right' },
        3: { cellWidth: 40, halign: 'left' },
        4: { cellWidth: 40, halign: 'left' },
        5: { cellWidth: 14, halign: 'center' }
      }
    });
    
    let yClinicas = (doc as any).lastAutoTable.finalY + 15;
    
    if (yClinicas > 250) {
      doc.addPage();
      yClinicas = 20;
    }
    
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('DETALLE DE RED PREFERENTE', 14, yClinicas);
    yClinicas += 8;
    
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    
    resultados.topEconomicos?.slice(0, 6).forEach((plan: any) => {
      if (yClinicas > 270) {
        doc.addPage();
        yClinicas = 20;
      }
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`${plan.nombre}:`, 14, yClinicas);
      yClinicas += 4;
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      const clinicas = plan.clinicas || 'Consultar ficha completa del plan';
      const lines = doc.splitTextToSize(clinicas, 175);
      doc.text(lines, 14, yClinicas);
      yClinicas += (lines.length * 4) + 6;
    });
    
    let recY = yClinicas + 10;
    if (recY > 250) {
      doc.addPage();
      recY = 20;
    }
    
    if (clinicaPreferida && resultados.mejorOpcionConClinica) {
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34); 
      doc.setFont('helvetica', 'bold');
      doc.text(`RECOMENDACION ESTRELLA: ${clinicaPreferida.toUpperCase()}`, 14, recY);
      recY += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`El plan ${resultados.mejorOpcionConClinica.nombre} le otorga la mejor cobertura para su clinica.`, 14, recY); 
      recY += 8;
      
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34); 
      doc.setFont('helvetica', 'bold');
      doc.text(`Costo Total: ${resultados.mejorOpcionConClinica.costoUF.toFixed(2)} UF/mes`, 14, recY); 
      recY += 10;
      
      if (presupuestoValido) {
         const ahorroTotal = resultados.planActualCostoUF - resultados.mejorOpcionConClinica.costoUF;
         if (ahorroTotal > 0) {
           doc.setFontSize(11);
           doc.text(`¡Genera un ahorro de ${ahorroTotal.toFixed(2)} UF respecto a su plan actual!`, 14, recY); 
           recY += 10;
         }
      }
    } else if (clinicaPreferida && !resultados.mejorOpcionConClinica) {
        doc.setFontSize(11);
        doc.setTextColor(200, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.text(`NOTA SOBRE CLINICA PREFERENTE:`, 14, recY);
        recY += 6;
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(`No se encontraron planes que incluyan expresamente a la clinica en su red para los parametros seleccionados.`, 14, recY);
        recY += 10;
    }
    
    const notasY = recY + 15;
    if (notasY < 270) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Notas:', 14, notasY);
      doc.text(`- Los costos incluyen prima GES de 1.036 UF por persona.`, 14, notasY + 5);
      doc.text('- Los valores son referenciales y pueden variar segun preexistencias.', 14, notasY + 10);
      doc.text('- Cotizacion formal sujeta a verificacion de condiciones de salud.', 14, notasY + 15);
    }
    
    const firmaY = (notasY < 270 ? notasY + 30 : recY + 30);
    if (firmaY < 270) {
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('DATOS DEL ASESOR', 14, firmaY);
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      let yFirma = firmaY + 8;
      doc.text(`Agente: ${agenteNombre}`, 14, yFirma); yFirma += 6;
      doc.text(`Telefono: ${agenteTelefono}`, 14, yFirma); yFirma += 6;
      if (agenteEmail) {
        doc.text(`Email: ${agenteEmail}`, 14, yFirma); 
        yFirma += 6;
      }
      
      doc.setDrawColor(150, 150, 150);
      doc.line(14, yFirma + 5, 100, yFirma + 5);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Firma', 14, yFirma + 10);
    }
    
    doc.save(`Cotizacion_${clienteNombre || 'Cliente'}_${nuevoFolio}.pdf`);
  };

  const cotizar = async () => {
    setCargando(true);
    
    const planesGuardados = localStorage.getItem("planes_colmena");
    
    if (!planesGuardados) {
      alert("Aún no has subido el archivo Excel. Por favor ve al 'Panel de control' y súbelo primero.");
      setCargando(false);
      return;
    }

    try {
      const planesParseados = JSON.parse(planesGuardados);

      const response = await fetch('/api/cotizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titularEdad: titularEdad ? parseInt(titularEdad) : 0,
          cargasEdades: cargas.filter(c => c && c !== '').map(Number),
          renta: renta ? parseFloat(renta) : 0,
          region: region,
          tipoPlan: tipoPlan,
          clinicaPreferida: clinicaPreferida,
          requiereParto: requiereParto,
          planActualNombre: planActualNombre,
          planActualCostoUF: planActualCostoUF ? parseFloat(planActualCostoUF) : null,
          planes: planesParseados 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(`Error en el cálculo: ${data.error}`);
      } else if (data.topEconomicos.length === 0) {
        alert("No se encontraron planes para este presupuesto o clínica. Intente quitar filtros.");
      } else {
        setResultados(data);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert("Hubo un error al conectar con el calculador.");
    }
    setCargando(false);
  };

  const hayPresupuesto = resultados && resultados.planActualCostoUF > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 shadow-xl border-b-2 border-cyan-400">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter">Asesor<span className="text-cyan-400">Colmena</span><span className="text-amber-400 text-sm font-light ml-1">v.Pro</span></h1>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Herramienta de Cierre de Alto Valor</p>
            </div>
            <a href="/admin" className="flex items-center gap-2 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-full text-xs font-semibold hover:border-cyan-400 hover:text-cyan-400 transition-all shadow">
              <span>🔧</span>
              Panel de Control
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="grid lg:grid-cols-[1fr,1.3fr] gap-8">
          
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <span className="text-3xl">📋</span>
              <div>
                 <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ficha del Cliente</h2>
                 <p className="text-sm text-slate-500">Ingresa los parámetros de búsqueda</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                <p className="text-sm font-bold text-slate-800 mb-4 tracking-tight flex items-center gap-2"><span className="text-cyan-500">📞</span> Datos de Contacto</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre completo" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} className="border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none transition" />
                  <input type="email" placeholder="Email corporativo / personal" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className="border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none transition" />
                  <input type="tel" placeholder="Teléfono de contacto" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} className="border border-slate-200 rounded-xl p-3 text-sm md:col-span-2 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none transition" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><span className="text-xs text-cyan-500">●</span> Edad del Titular *</label>
                    <input type="number" value={titularEdad} onChange={(e) => setTitularEdad(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none transition" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><span className="text-xs text-cyan-500">●</span> Edad de Cargas</label>
                    <div className="space-y-2">
                    {cargas.map((edad, idx) => (
                      <input 
                        key={idx} 
                        type="number" 
                        value={edad} 
                        onChange={(e) => actualizarCarga(idx, e.target.value)} 
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-cyan-400 outline-none" 
                        placeholder={`Edad Carga ${idx + 1}`} 
                      />
                    ))}
                    {cargas.length < 6 && (
                      <button onClick={agregarCarga} className="text-cyan-600 text-xs font-bold hover:text-cyan-800 mt-1 transition">
                        + Agregar otra carga
                      </button>
                    )}
                    </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><span className="text-xs text-cyan-500">●</span> Renta Imponible ($) *</label>
                <input type="number" value={renta} onChange={(e) => setRenta(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none transition" />
                <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-100 p-2 rounded-lg inline-block">7% Legal = {formatearPesos(parseFloat(renta) * 0.07 || 0)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><span className="text-xs text-cyan-500">●</span> Región *</label>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white transition">
                      <option value="metropolitana">Metropolitana</option>
                      <option value="regiones">Regiones (MAX)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><span className="text-xs text-cyan-500">●</span> Tipo Plan *</label>
                    <select value={tipoPlan} onChange={(e) => setTipoPlan(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white transition">
                      <option value="todos">Todos</option>
                      <option value="PF">Individual (PF)</option>
                      <option value="Grupal">Grupal</option>
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><span className="text-cyan-500">🏥</span> Clínica preferente</label>
                <select 
                  value={clinicaPreferida} 
                  onChange={(e) => setClinicaPreferida(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none bg-white transition"
                >
                  <option value="">-- Buscar la mejor clínica por valor --</option>
                  <option value="Clínica Alemana">🏥 Clínica Alemana</option>
                  <option value="Clínica Las Condes">🏥 Clínica Las Condes</option>
                  <option value="Clínica Los Andes">🏥 Clínica Los Andes</option>
                  <option value="Clínica Santa María">🏥 Clínica Santa María</option>
                  <option value="Clínica Dávila">🏥 Clínica Dávila</option>
                  <option value="Clínica Indisa">🏥 Clínica Indisa</option>
                  <option value="RedSalud">🏥 RedSalud</option>
                </select>
              </div>

              <label className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl cursor-pointer hover:bg-cyan-50 transition shadow-inner">
                <input type="checkbox" checked={requiereParto} onChange={e => setRequiereParto(e.target.checked)} className="w-6 h-6 rounded-lg accent-cyan-500 border-slate-300" />
                <div>
                    <span className="block text-sm font-bold text-slate-900">Exigir cobertura de Parto Completo</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Filtra planes que no cubran maternidad 100% en la red.</span>
                </div>
              </label>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Presupuesto Referencial (Paga Hoy)</h3>
                    <p className="text-xs text-slate-500">Buscamos optimizar este monto con Alto Valor Colmena.</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">¿Cuánto paga hoy en UF?</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={planActualCostoUF} 
                    onChange={(e) => setPlanActualCostoUF(e.target.value)} 
                    className="w-full border-2 border-cyan-100 rounded-xl p-4 bg-cyan-50 font-black text-2xl text-cyan-950 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 outline-none transition" 
                    placeholder="Ej: 8.50" 
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre Plan Actual (opcional)" value={planActualNombre} onChange={(e) => setPlanActualNombre(e.target.value)} className="border border-slate-200 rounded-xl p-3 text-sm focus:ring-cyan-400 outline-none" />
                  <div className="border border-slate-200 rounded-xl p-2.5 bg-gray-50 text-xs text-gray-600 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="truncate">📄 {planActualPDF ? planActualPDF : 'PDF del plan...'}</span>
                    <label className="bg-slate-900 text-white text-[9px] px-2 py-1 rounded cursor-pointer uppercase font-bold tracking-wider hover:bg-slate-700">Subir</label>
                    <input type="file" accept=".pdf" onChange={(e)=>setPlanActualPDF(e.target.files?.[0]?.name || '')} className="hidden" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={cotizar} 
                disabled={cargando} 
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4.5 rounded-2xl font-extrabold hover:to-slate-700 transition-all shadow-xl text-lg mt-6 tracking-tight flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {cargando ? (
                    <> <span className="animate-spin text-xl">⏳</span> Analizando Propuesta...</>
                ) : (
                    <>🚀 Cotizar Alto Valor Colmena</>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            
            {cargando && (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-16 text-center">
                <div className="animate-spin text-6xl mb-6 text-cyan-400">⏳</div>
                <p className="text-xl font-bold text-slate-800 tracking-tight">Estamos calculando la mejor Propuesta de Valor...</p>
                <p className="text-sm text-slate-500 mt-2">Maximizando beneficios por UF para {clienteNombre || 'tu cliente'}.</p>
              </div>
            )}

            {resultados && !cargando && (
              <>
                <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-6 border border-slate-700 shadow-cyan-900/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2"><span className="text-cyan-400 text-sm">●</span> Resumen Operativo</h3>
                    <span className="text-xs text-slate-400 font-mono">Folioctz: {folio.split('-')[1]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-slate-700 pt-4">
                    <div className="text-slate-400">Suma de factores:</div>
                    <div className="font-bold text-right text-white font-mono">{resultados.sumaFactores.toFixed(2)}</div>
                    
                    {hayPresupuesto && (
                      <>
                        <div className="text-slate-400">Paga Hoy (Competencia):</div>
                        <div className="font-bold text-cyan-300 text-right font-mono text-base">{resultados.planActualCostoUF.toFixed(2)} UF</div>
                      </>
                    )}
                  </div>
                </div>

                {clinicaPreferida && resultados.mejorOpcionConClinica && (
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl p-7 border-4 border-amber-400 shadow-amber-900/20 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 text-[180px] opacity-10 rotate-12">🌟</div>
                    <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-amber-400/40">
                            <span className="text-xs">⭐</span> Recomendación Premium
                        </div>
                        <h3 className="font-black text-3xl tracking-tighter leading-none">{resultados.mejorOpcionConClinica.nombre}</h3>
                        <p className="text-5xl font-black mt-3.5 tracking-tighter leading-none font-mono">
                           {resultados.mejorOpcionConClinica.costoUF.toFixed(2)} <span className="text-2xl text-slate-400">UF/mes</span>
                        </p>
                        
                        {hayPresupuesto && (resultados.planActualCostoUF - resultados.mejorOpcionConClinica.costoUF) > 0 && (
                          <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-extrabold mt-5 shadow-lg shadow-emerald-950/30">
                            ✅ Ahorro Inteligente: {(resultados.planActualCostoUF - resultados.mejorOpcionConClinica.costoUF).toFixed(2)} UF
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-300 mt-5 border-t border-slate-700 pt-4 flex items-center gap-2">
                          <span className="text-lg text-amber-300">🏥</span> <strong>Alto Valor:</strong> Incluye cobertura preferente en <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">{clinicaPreferida}</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                  <div className="bg-slate-900 bg-gradient-to-r from-slate-950 to-slate-900 px-6 py-5 flex justify-between items-center border-b border-slate-800">
                    <div>
                      <h3 className="font-black text-white text-xl tracking-tighter">Propuestas de Valor</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {hayPresupuesto ? `Mejores planes optimizados para ${resultados.planActualCostoUF.toFixed(2)} UF` : 'Mejores opciones Colmena encontradas'}
                      </p>
                    </div>
                    <button 
                      onClick={generarPDF} 
                      className="flex items-center gap-1.5 border border-slate-700 text-cyan-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow"
                    >
                      <span>📄</span> Descargar PDF
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-950 text-white/90 border-b border-slate-800">
                        <tr className="divide-x divide-slate-800">
                          <th className="p-4 text-left font-bold tracking-tight uppercase text-xs">Plan Propuesto</th>
                          <th className="p-4 text-right font-bold tracking-tight uppercase text-xs">Costo UF</th>
                          {hayPresupuesto && <th className="p-4 text-right font-bold tracking-tight uppercase text-xs text-amber-300">Ahorro</th>}
                          {/* NUEVAS CABECERAS PARA LA WEB */}
                          <th className="p-4 text-left font-bold tracking-tight uppercase text-xs">Hospitalización</th>
                          <th className="p-4 text-left font-bold tracking-tight uppercase text-xs">Ambulatorio</th>
                          <th className="p-4 text-center font-bold tracking-tight uppercase text-xs">En Red?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resultados.topEconomicos?.map((plan: any, idx: number) => {
                          const esRecomendado = resultados.mejorOpcionConClinica && plan.nombre === resultados.mejorOpcionConClinica.nombre && plan.incluyeClinicaPreferida;
                          
                          let ahorroNum = 0;
                          if (hayPresupuesto) {
                            ahorroNum = resultados.planActualCostoUF - plan.costoUF;
                          }

                          return (
                            <tr key={idx} className={`hover:bg-slate-50 transition ${esRecomendado ? 'bg-cyan-50' : ''} divide-x divide-slate-100`}>
                              <td className="p-4 text-slate-800">
                                <div className="font-extrabold tracking-tight text-slate-950">{plan.nombre}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{plan.tipo === 'Grupal' ? 'Cobertura Grupal' : 'Individual PF'}</div>
                                {esRecomendado && (
                                  <span className="inline-block mt-1.5 text-[9px] bg-amber-400/20 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-300">
                                    🌟 Premium
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right font-black text-slate-950 text-base font-mono">
                                {plan.costoUF.toFixed(2)}
                              </td>
                              
                              {hayPresupuesto && (
                                <td className={`p-4 text-right font-black font-mono text-base ${ahorroNum > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {ahorroNum > 0 ? `+${ahorroNum.toFixed(2)}` : ahorroNum.toFixed(2)}
                                </td>
                              )}

                              {/* NUEVAS CELDAS PARA LA WEB */}
                              <td className="p-4 text-slate-700 text-xs">
                                {plan.cobertura_hospitalaria || 'Ver detalle'}
                              </td>
                              <td className="p-4 text-slate-700 text-xs">
                                {plan.cobertura_ambulatoria || 'Ver detalle'}
                              </td>

                              <td className="p-4 text-center">
                                {clinicaPreferida ? (
                                  plan.incluyeClinicaPreferida ? 
                                    <span className="text-emerald-600 text-xs font-extrabold uppercase bg-emerald-100 px-2 py-1 rounded-lg">SÍ INCLUYE</span> : 
                                    <span className="text-slate-300 text-xs">-</span>
                                ) : (
                                  <span className="text-slate-300 text-xs">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-slate-50 p-5 text-xs text-slate-600 border-t border-slate-100 font-medium">
                    <p className="flex gap-1.5 items-center"><span className="text-cyan-500">ℹ️</span> Los valores indicados son referenciales e incluyen la prima GES.</p>
                    <p className="flex gap-1.5 items-center mt-1"><span className="text-cyan-500">ℹ️</span> El ahorro se calcula sobre la diferencia entre el presupuesto base y la propuesta Colmena.</p>
                  </div>
                  
                </div>
              </>
            )}
          </div>
          
        </div>
      </div>

      <footer className="mt-16 bg-slate-900 border-t-2 border-slate-800 px-6 py-8 text-center text-slate-500 text-xs">
          <p>© 2026 Asesor Colmena v.Pro - Herramienta Estratégica</p>
          <p className="mt-1">Diseñado para la Venta de Alto Valor y Beneficios por UF.</p>
      </footer>
    </div>
  );
}