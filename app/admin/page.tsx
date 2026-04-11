"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function AdminPage() {
  const [cantidadPlanes, setCantidadPlanes] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("planes_colmena");
    if (data) {
      setCantidadPlanes(JSON.parse(data).length);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        let planesLimpios: any[] = [];

        // --- LECTURA HOJA RM ---
        const sheetRM = workbook.SheetNames.find(n => n.toUpperCase() === "RM");
        if (sheetRM) {
          const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetRM], { header: 1 });
          for (let i = 4; i < rawData.length; i++) {
            const fila: any = rawData[i];
            if (!fila[2]) continue;
            
            const mat = parseFloat(fila[10]) || 0; 
            const hospText = String(fila[7] || "Ver detalle");
            const consText = String(fila[13] || "Ver detalle");
            
            const item = {
              nombre: String(fila[2]), 
              isapre: "Colmena", 
              p_indiv: parseFloat(fila[4]) || 0,
              p_grupal: parseFloat(fila[6]) || 0, 
              hosp: hospText,
              cons: consText, 
              tiene_parto_completo: mat > 400,
              region: "metropolitana", 
              clinicas: hospText + " " + consText
            };
            if (item.p_indiv > 0) planesLimpios.push({...item, precio_base: item.p_indiv, tipo: "PF"});
            if (item.p_grupal > 0) planesLimpios.push({...item, precio_base: item.p_grupal, tipo: "Grupal"});
          }
        }

        // --- LECTURA HOJA MAX REGIONALES ---
        const sheetMax = workbook.SheetNames.find(n => n.toUpperCase().includes("MAX REGIONAL"));
        if (sheetMax) {
          const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetMax], { header: 1 });
          for (let i = 2; i < rawData.length; i++) {
            const fila: any = rawData[i];
            if (!fila[3]) continue;
            
            const mat = parseFloat(fila[16]) || 0;
            const consText = String(fila[21] || "Ver detalle");
            
            const item = {
              nombre: String(fila[3]), 
              isapre: "Colmena", 
              p_indiv: parseFloat(fila[5]) || 0,
              p_grupal: parseFloat(fila[7]) || 0, 
              hosp: "Cobertura Regional MAX",
              cons: consText, 
              tiene_parto_completo: mat > 400,
              region: "regiones", 
              clinicas: "Red Regional MAX " + consText
            };
            if (item.p_indiv > 0) planesLimpios.push({...item, precio_base: item.p_indiv, tipo: "PF"});
            if (item.p_grupal > 0) planesLimpios.push({...item, precio_base: item.p_grupal, tipo: "Grupal"});
          }
        }

        localStorage.setItem("planes_colmena", JSON.stringify(planesLimpios));
        setCantidadPlanes(planesLimpios.length);
        alert(`¡Éxito! Base de datos cargada con ${planesLimpios.length} planes. Textos de clínicas extraídos correctamente.`);
      } catch (e) { alert("Error al leer el Excel."); }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Administración de Planes</h1>
      <p className="text-slate-500 mb-8 font-medium">Actualiza la base de datos de Colmena</p>
      
      <div className="border-2 border-dashed border-cyan-300 p-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 w-full max-w-2xl transition hover:border-cyan-400">
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
          className="mb-4 text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 transition cursor-pointer outline-none" 
        />
        <p className="text-2xl text-slate-800 font-black mt-6 tracking-tight">
          {cantidadPlanes} <span className="text-lg font-bold text-slate-500">planes en memoria</span>
        </p>
      </div>
      
      {/* EL NUEVO BOTÓN VOLVER: Estilo ghost, hover elegante */}
      <a 
        href="/" 
        className="mt-12 group flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-lg hover:shadow-cyan-100 transition-all"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Volver al Cotizador
      </a>
    </div>
  );
}