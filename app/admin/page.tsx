'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [mensaje, setMensaje] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [planesCargados, setPlanesCargados] = useState(0);

  const procesarExcel = async (file: File) => {
    setSubiendo(true);
    setMensaje('');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const sheetName = workbook.SheetNames.find(name => name === 'RM');
      if (!sheetName) {
        setMensaje(`❌ No se encontró la hoja "RM"`);
        setSubiendo(false);
        return;
      }
      
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      let startRow = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (row[0] === 23 && row[1] === 'STAR') {
          startRow = i;
          break;
        }
      }
      
      const planes: any[] = [];
      
      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row[0] || row[0] === 'TABLA') continue;
        if (row[0] !== 23) continue;
        
        const nombrePlan = row[2];
        if (!nombrePlan || !nombrePlan.toString().includes('COLMENA')) continue;
        
        const precioIndividual = parseFloat(row[4]);
        const precioGrupal = parseFloat(row[7]);
        
        if (precioIndividual > 0) {
          planes.push({
            nombre: nombrePlan,
            isapre: 'Colmena',
            precio_base: precioIndividual,
            tipo: 'PF',
            region: 'todas',
            cobertura_parto: 'parcial',
            tope_anual: parseFloat(row[24]) || 0,
            cobertura_hospitalaria: '100%',
            cobertura_ambulatoria: '80%',
            cobertura_urgencia: 'Consulta: 80%',
            clinicas: ['Hospital del Profesor', 'Clínica Dávila', 'Clínica RedSalud', 'Clínica Bupa']
          });
        }
        
        if (precioGrupal > 0 && precioGrupal !== precioIndividual) {
          planes.push({
            nombre: `${nombrePlan} (Grupo)`,
            isapre: 'Colmena',
            precio_base: precioGrupal,
            tipo: 'Grupal',
            region: 'todas',
            cobertura_parto: 'parcial',
            tope_anual: parseFloat(row[24]) || 0,
            cobertura_hospitalaria: '100%',
            cobertura_ambulatoria: '80%',
            cobertura_urgencia: 'Consulta: 80%',
            clinicas: ['Hospital del Profesor', 'Clínica Dávila', 'Clínica RedSalud', 'Clínica Bupa']
          });
        }
      }
      
      localStorage.setItem('planesColmena', JSON.stringify(planes));
      setPlanesCargados(planes.length);
      setMensaje(`✅ ${planes.length} planes cargados correctamente`);
      
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al procesar el archivo');
    }
    
    setSubiendo(false);
    setTimeout(() => setMensaje(''), 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarExcel(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-[#003366] mb-2">🔧 Administración</h1>
          <p className="text-gray-500 mb-6">
            Sube tu archivo Excel con los planes de Colmena (hoja "RM")
          </p>
          
          <div className="border-2 border-dashed border-[#0099CC] rounded-xl p-8 text-center bg-blue-50">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={subiendo}
              className="hidden"
              id="excelInput"
            />
            <label
              htmlFor="excelInput"
              className="cursor-pointer bg-[#003366] text-white py-3 px-6 rounded-xl inline-block hover:bg-[#002244] transition"
            >
              📂 Subir archivo Excel
            </label>
            <p className="text-gray-500 text-sm mt-3">
              Selecciona el archivo "TP 27 Marzo 2026 (1).xlsx"
            </p>
          </div>
          
          {subiendo && (
            <div className="text-center mt-4">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p>Procesando archivo...</p>
            </div>
          )}
          
          {mensaje && (
            <div className={`mt-6 p-4 rounded-xl ${mensaje.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {mensaje}
            </div>
          )}

          {planesCargados > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              📊 {planesCargados} planes disponibles para comparar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}