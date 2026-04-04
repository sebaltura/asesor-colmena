// Esta función extrae información básica del PDF del cliente
// Por ahora, como la extracción automática es compleja,
// vamos a pedir al asesor que ingrese manualmente los datos clave.
// Esto es más confiable y rápido.

export async function extraerInfoDelPDF(pdfBuffer: ArrayBuffer) {
  // Por ahora retornamos un mensaje indicando que los datos deben ingresarse manualmente
  return {
    metodo: "manual",
    mensaje: "Por favor ingresa los datos del plan manualmente"
  };
}