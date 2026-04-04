'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [planActualNombre, setPlanActualNombre] = useState('');
  const [planActualCostoUF, setPlanActualCostoUF] = useState('');
  const [planActualPDF, setPlanActualPDF] = useState('');
  const [resultados, setResultados] = useState(null);
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
    
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text('ASESOR COLMENA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Informe de Cotización', 105, 28, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Folio: ${nuevoFolio}`, 14, 40);
    doc.text(`Fecha: ${fecha}`, 14, 45);
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-CL')}`, 14, 50);
    
    doc.setDrawColor(0, 153, 204);
    doc.line(14, 55, 200, 55);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('DATOS DEL CLIENTE', 14, 68);
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    let y = 78;
    doc.text(`Nombre: ${clienteNombre || 'No especificado'}`, 14, y); y += 6;
    doc.text(`Email: ${clienteEmail || 'No especificado'}`, 14, y); y += 6;
    doc.text(`Teléfono: ${clienteTelefono || 'No especificado'}`, 14, y); y += 8;
    
    doc.text(`Edad Titular: ${titularEdad} años`, 14, y); y += 5;
    doc.text(`Cargas: ${cargas.filter(c => c && c !== '').join(', ') || 'Ninguna'} años`, 14, y); y += 5;
    doc.text(`Suma de factores: ${resultados?.sumaFactores || 'N/A'}`, 14, y); y += 5;
    doc.text(`Renta imponible: ${formatearPesos(parseFloat(renta) || 0)}`, 14, y); y += 5;
    doc.text(`Cotización legal 7%: ${formatearPesos((parseFloat(renta) || 0) * 0.07)}`, 14, y); y += 5;
    doc.text(`Región: ${region === 'metropolitana' ? 'Metropolitana' : 'Regiones'}`, 14, y); y += 5;
    doc.text(`Tipo de plan: ${tipoPlan === 'todos' ? 'Todos' : tipoPlan === 'PF' ? 'Individual (PF)' : tipoPlan === 'Grupal' ? 'Grupal' : 'Libre Elección (LE)'}`, 14, y); y += 5;
    
    if (clinicaPreferida) {
      doc.text(`Clínica preferente: ${clinicaPreferida}`, 14, y); y += 8;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('PLAN ACTUAL DEL CLIENTE', 14, y + 5);
    y += 15;
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Plan: ${planActualNombre || 'No especificado'}`, 14, y); y += 6;
    doc.text(`Costo mensual: ${planActualCostoUF ? planActualCostoUF + ' UF' : 'No especificado'}`, 14, y); y += 6;
    if (planActualPDF) {
      doc.text(`Documento adjunto: ${planActualPDF}`, 14, y); y += 6;
    }
    
    y += 5;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('COMPARATIVA DE PLANES COLMENA', 14, y + 5);
    y += 15;
    
    const tableData = resultados.topEconomicos?.map((plan: any) => [
      plan.nombre.length > 22 ? plan.nombre.substring(0, 20) + '...' : plan.nombre,
      plan.tipo === 'PF' ? 'Ind' : plan.tipo === 'Grupal' ? 'Grp' : 'LE',
      `${plan.costoUF.toFixed(2)}`,
      plan.coberturaHospitalaria || 'N/A',
      plan.coberturaAmbulatoria || 'N/A',
      plan.coberturaParto === '✅ Parto completo' ? 'Completo' : 'Con tope',
      plan.coberturaUrgencia?.substring(0, 18) || 'N/A'
    ]);
    
    autoTable(doc, {
      startY: y + 5,
      head: [['Plan', 'Tipo', 'Costo UF', 'Hosp', 'Ambul', 'Parto', 'Urgencia']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], halign: 'center' },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 12, halign: 'center' },
        2: { cellWidth: 18, halign: 'right' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 25 }
      }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    let clinicasY = finalY;
    
    if (clinicasY > 270) {
      doc.addPage();
      clinicasY = 20;
    }
    
    doc.setFontSize(11);
    doc.setTextColor(0, 51, 102);
    doc.text('CLÍNICAS INCLUIDAS POR PLAN', 14, clinicasY);
    clinicasY += 8;
    
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    
    resultados.topEconomicos?.slice(0, 8).forEach((plan: any, idx: number) => {
      if (clinicasY > 270) {
        doc.addPage();
        clinicasY = 20;
      }
      doc.setFontSize(8);
      doc.setTextColor(0, 51, 102);
      doc.text(`${plan.nombre.substring(0, 30)}:`, 14, clinicasY);
      clinicasY += 4;
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      const clinicas = plan.clinicasPrincipales || 'Consultar ficha completa del plan';
      const lines = doc.splitTextToSize(clinicas, 175);
      doc.text(lines, 14, clinicasY);
      clinicasY += (lines.length * 4) + 6;
    });
    
    let recY = clinicasY + 10;
    if (recY > 270) {
      doc.addPage();
      recY = 20;
    }
    
    if (clinicaPreferida && resultados.mejorOpcionConClinica) {
      doc.setFontSize(11);
      doc.setTextColor(34, 139, 34);
      doc.text(`RECOMENDACIÓN PARA ${clinicaPreferida.toUpperCase()}`, 14, recY);
      recY += 8;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Te recomendamos cotizar ${resultados.mejorOpcionConClinica.nombre}`, 14, recY); recY += 6;
      doc.text(`✅ Incluye ${clinicaPreferida} en red preferente`, 14, recY); recY += 6;
      doc.text(`Ahorro potencial: ${resultados.mejorOpcionConClinica.ahorroUF.toFixed(2)} UF/mes`, 14, recY); recY += 6;
      doc.text(`Cobertura Hospitalaria: ${resultados.mejorOpcionConClinica.coberturaHospitalaria || 'N/A'}`, 14, recY); recY += 5;
      doc.text(`Cobertura Ambulatoria: ${resultados.mejorOpcionConClinica.coberturaAmbulatoria || 'N/A'}`, 14, recY); recY += 5;
      doc.text(`Cobertura Urgencia: ${resultados.mejorOpcionConClinica.coberturaUrgencia || 'N/A'}`, 14, recY); recY += 5;
      doc.text(`Parto: ${resultados.mejorOpcionConClinica.coberturaParto || 'N/A'}`, 14, recY);
      
    } else if (resultados.mejorOpcionGeneral) {
      doc.setFontSize(11);
      doc.setTextColor(34, 139, 34);
      doc.text('RECOMENDACIÓN (MEJOR PRECIO)', 14, recY);
      recY += 8;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Te recomendamos cotizar ${resultados.mejorOpcionGeneral.nombre}`, 14, recY); recY += 6;
      doc.text(`Ahorro potencial: ${resultados.mejorOpcionGeneral.ahorroUF.toFixed(2)} UF/mes`, 14, recY); recY += 6;
      doc.text(`Cobertura Hospitalaria: ${resultados.mejorOpcionGeneral.coberturaHospitalaria || 'N/A'}`, 14, recY); recY += 5;
      doc.text(`Cobertura Ambulatoria: ${resultados.mejorOpcionGeneral.coberturaAmbulatoria || 'N/A'}`, 14, recY); recY += 5;
      doc.text(`Cobertura Urgencia: ${resultados.mejorOpcionGeneral.coberturaUrgencia || 'N/A'}`, 14, recY); recY += 5;
      doc.text(`Parto: ${resultados.mejorOpcionGeneral.coberturaParto || 'N/A'}`, 14, recY);
    }
    
    const notasY = recY + 15;
    if (notasY < 270) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Notas:', 14, notasY);
      doc.text('• Los costos incluyen prima GES de 0.9 UF', 14, notasY + 5);
      doc.text('• Los valores son referenciales y pueden variar según preexistencias', 14, notasY + 10);
      doc.text('• Cotización formal sujeta a verificación de condiciones de salud', 14, notasY + 15);
    }
    
    const firmaY = (notasY < 270 ? notasY + 30 : recY + 30);
    if (firmaY < 270) {
      doc.setFontSize(10);
      doc.setTextColor(0, 51, 102);
      doc.text('DATOS DEL AGENTE', 14, firmaY);
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      let yFirma = firmaY + 8;
      doc.text(`Agente: ${agenteNombre}`, 14, yFirma); yFirma += 6;
      doc.text(`Teléfono: ${agenteTelefono}`, 14, yFirma); yFirma += 6;
      if (agenteEmail) doc.text(`Email: ${agenteEmail}`, 14, yFirma); yFirma += 6;
      
      doc.setDrawColor(150, 150, 150);
      doc.line(14, yFirma + 5, 100, yFirma + 5);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Firma del Agente', 14, yFirma + 10);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Asesor Colmena - Comparador oficial de planes de salud', 105, 285, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, 200, 285, { align: 'right' });
    }
    
    doc.save(`Cotizacion_${clienteNombre || 'Cliente'}_${nuevoFolio}.pdf`);
  };

  const cotizar = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titularEdad: parseInt(titularEdad),
          cargasEdades: cargas.filter(c => c && c !== '').map(Number),
          renta: parseFloat(renta),
          region: region,
          tipoPlan: tipoPlan,
          clinicaPreferida: clinicaPreferida,
          planActualNombre: planActualNombre,
          planActualCostoUF: planActualCostoUF ? parseFloat(planActualCostoUF) : null,
        })
      });
      const data = await response.json();
      setResultados(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-[#003366] shadow-md border-b-4 border-[#0099CC]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">🏥 Asesor Colmena</h1>
              <p className="text-sm text-[#0099CC]">Comparador oficial de planes de salud</p>
            </div>
            <a href="/admin" className="bg-[#0099CC] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0088BB] transition">
              🔧 Panel de control
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#0099CC]">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-bold text-[#003366]">Datos del Cliente</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">📞 Datos de contacto (opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Nombre" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0099CC] outline-none" />
                  <input type="email" placeholder="Email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0099CC] outline-none" />
                  <input type="tel" placeholder="Teléfono" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} className="border rounded-lg p-2 text-sm col-span-2 focus:ring-2 focus:ring-[#0099CC] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">🎂 Edad del Titular *</label>
                <input type="number" value={titularEdad} onChange={(e) => setTitularEdad(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0099CC] outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">👶 Edad de Cargas</label>
                {cargas.map((edad, idx) => (
                  <input key={idx} type="number" value={edad} onChange={(e) => actualizarCarga(idx, e.target.value)} className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-[#0099CC] outline-none" placeholder={`Carga ${idx + 1}`} />
                ))}
                {cargas.length < 6 && <button onClick={agregarCarga} className="text-[#0099CC] text-sm hover:text-[#003366]">+ Agregar carga</button>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">💰 Renta Imponible ($) *</label>
                <input type="number" value={renta} onChange={(e) => setRenta(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0099CC] outline-none" />
                <p className="text-xs text-gray-500 mt-1">7% = {formatearPesos(parseFloat(renta) * 0.07 || 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">📍 Región del cliente *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="metropolitana" checked={region === 'metropolitana'} onChange={(e) => setRegion(e.target.value)} className="w-4 h-4 accent-[#003366]" /> Metropolitana
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="regiones" checked={region === 'regiones'} onChange={(e) => setRegion(e.target.value)} className="w-4 h-4 accent-[#003366]" /> Regiones
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">⚠️ Planes MAX solo disponibles en Regiones</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">📋 Tipo de plan a cotizar *</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="todos" checked={tipoPlan === 'todos'} onChange={(e) => setTipoPlan(e.target.value)} className="w-4 h-4 accent-[#003366]" /> Todos
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="PF" checked={tipoPlan === 'PF'} onChange={(e) => setTipoPlan(e.target.value)} className="w-4 h-4 accent-[#003366]" /> Individual (PF)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="Grupal" checked={tipoPlan === 'Grupal'} onChange={(e) => setTipoPlan(e.target.value)} className="w-4 h-4 accent-[#003366]" /> Grupal
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="LE" checked={tipoPlan === 'LE'} onChange={(e) => setTipoPlan(e.target.value)} className="w-4 h-4 accent-[#003366]" /> Libre Elección (LE)
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">💡 Los planes Grupales son más económicos pero requieren grupo mínimo</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">🏥 Clínica preferente (opcional)</label>
                <select 
                  value={clinicaPreferida} 
                  onChange={(e) => setClinicaPreferida(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0099CC] outline-none bg-white"
                >
                  <option value="">-- Seleccione una clínica --</option>
                  <option value="Clínica Alemana">🏥 Clínica Alemana</option>
                  <option value="Clínica Las Condes">🏥 Clínica Las Condes</option>
                  <option value="Clínica Los Andes">🏥 Clínica Los Andes</option>
                  <option value="Clínica Santa María">🏥 Clínica Santa María</option>
                  <option value="Clínica Dávila">🏥 Clínica Dávila</option>
                  <option value="Clínica Indisa">🏥 Clínica Indisa</option>
                  <option value="Clínica Bupa">🏥 Clínica Bupa</option>
                  <option value="Clínica UC Christus">🏥 Clínica UC Christus</option>
                  <option value="Clínica RedSalud">🏥 Clínica RedSalud</option>
                  <option value="Clínica San Carlos">🏥 Clínica San Carlos</option>
                  <option value="Hospital del Profesor">🏥 Hospital del Profesor</option>
                  <option value="Hospital Clínico U de Chile">🏥 Hospital Clínico U de Chile</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">💰 Plan actual del cliente</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del plan (opcional)</label>
                  <input type="text" value={planActualNombre} onChange={(e) => setPlanActualNombre(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0099CC] outline-none" placeholder="Ej: SMART PRO 4000S" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuánto paga hoy? (UF)</label>
                  <input type="number" step="0.01" value={planActualCostoUF} onChange={(e) => setPlanActualCostoUF(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0099CC] outline-none" placeholder="Ej: 7.42" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📄 Subir PDF del plan (opcional)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPlanActualPDF(file.name);
                    }}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  {planActualPDF && <p className="text-xs text-green-600 mt-1">✅ {planActualPDF}</p>}
                </div>
              </div>
              
              <button onClick={cotizar} disabled={cargando} className="w-full bg-[#003366] text-white py-3 rounded-xl font-semibold hover:bg-[#002244] transition shadow-md">
                {cargando ? '🔍 Analizando planes...' : '🚀 Comparar Planes Colmena'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cargando && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="animate-spin text-5xl mb-4">⏳</div>
                <p className="text-gray-500">Analizando planes Colmena...</p>
              </div>
            )}

            {resultados && !cargando && (
              <>
                <div className="bg-gradient-to-r from-[#003366] to-[#0099CC] text-white rounded-2xl shadow-xl p-5">
                  <h3 className="font-semibold opacity-90 mb-2">📊 Resumen del cliente</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>Suma de factores:</div>
                    <div className="font-bold text-right">{resultados.sumaFactores}</div>
                    <div>Cotización 7%:</div>
                    <div className="font-bold text-right">{resultados.cotizacionLegalUF?.toFixed(2)} UF</div>
                    {planActualCostoUF && (
                      <>
                        <div>Paga hoy:</div>
                        <div className="font-bold text-yellow-200 text-right">{planActualCostoUF} UF</div>
                      </>
                    )}
                  </div>
                </div>

                {clinicaPreferida && resultados.mejorOpcionConClinica ? (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-2xl shadow-xl p-5">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h3 className="font-bold text-green-800 text-lg">🎯 Recomendación para {clinicaPreferida}</h3>
                        <p className="text-3xl font-bold text-green-600">
                          {resultados.mejorOpcionConClinica.ahorroUF.toFixed(2)} UF/mes
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {resultados.mejorOpcionConClinica.nombre}
                        </p>
                        <div className="text-xs text-green-600 mt-2">
                          <span>🏥 Incluye {clinicaPreferida} en red preferente</span>
                        </div>
                      </div>
                      <button
                        onClick={generarPDF}
                        className="bg-white text-green-700 px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition"
                      >
                        📄 Descargar PDF
                      </button>
                    </div>
                  </div>
                ) : resultados.mejorOpcionGeneral && (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-2xl shadow-xl p-5">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h3 className="font-bold text-green-800 text-lg">🎯 Recomendación (mejor precio)</h3>
                        <p className="text-3xl font-bold text-green-600">
                          {resultados.mejorOpcionGeneral.ahorroUF.toFixed(2)} UF/mes
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {resultados.mejorOpcionGeneral.nombre}
                        </p>
                      </div>
                      <button
                        onClick={generarPDF}
                        className="bg-white text-green-700 px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition"
                      >
                        📄 Descargar PDF
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gray-100 px-5 py-4">
                    <h3 className="font-bold text-gray-800 text-lg">📋 Comparación de planes Colmena</h3>
                    <p className="text-xs text-gray-500">Ordenados de menor a mayor costo</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="p-3 text-left">Plan</th>
                          <th className="p-3 text-left">Tipo</th>
                          <th className="p-3 text-left">Parto</th>
                          <th className="p-3 text-right">Costo UF</th>
                          <th className="p-3 text-center">Clínica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {resultados.topEconomicos?.map((plan: any, idx: number) => {
                          const esMasBarato = resultados.planActualCostoUF && plan.costoUF < resultados.planActualCostoUF;
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="p-3 font-medium">
                                {plan.nombre}
                                {esMasBarato && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Más barato</span>}
                              </td>
                              <td className="p-3 text-gray-500">
                                {plan.tipo === 'PF' ? 'Individual' : plan.tipo === 'Grupal' ? 'Grupal' : 'Libre Elección'}
                              </td>
                              <td className="p-3">{plan.coberturaParto}</td>
                              <td className="p-3 text-right font-bold text-blue-600">{plan.costoUF.toFixed(2)} UF</td>
                              <td className="p-3 text-center">
                                {clinicaPreferida ? (
                                  plan.incluyeClinicaPreferida ? 
                                    <span className="text-green-600 text-xs font-semibold">✅ Red Preferente</span> : 
                                    <span className="text-orange-500 text-xs">⚠️ Libre Elección</span>
                                ) : (
                                  <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}