import React, { useState } from 'react';
import { parseWhatsAppChat, getUserWithMostMessages, getBusiestHour, getBusiestDay } from '../utils/parser';

export const UploadSection = () => {
  // Inicializamos el estado en null para saber cuándo mostrar el dashboard
  const [metrics, setMetrics] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; 
    if (!file) return; 

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      
      // Ejecutamos todas nuestras funciones
      const parsedData = parseWhatsAppChat(text);
      const topUser = getUserWithMostMessages(parsedData);
      const busiestHour = getBusiestHour(parsedData);
      const busiestDay = getBusiestDay(parsedData);

      // Guardamos todo en el estado de React
      setMetrics({
        total: parsedData.length,
        topUser,
        busiestHour,
        busiestDay
      });
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="upload-container">
      <h2>Analizá tu chat de WhatsApp</h2>
      <p>Exportá tu chat en formato .txt y subilo acá para ver las estadísticas.</p>
      
      <div className="upload-box">
        <input 
          type="file" 
          id="chat-file" 
          accept=".txt" 
          onChange={handleFileUpload} 
        />
        <label htmlFor="chat-file" className="upload-btn">
          Seleccionar archivo .txt
        </label>
      </div>

      {/* Renderizado Condicional: Solo se muestra si hay métricas calculadas */}
      {metrics && (
        <div className="dashboard-results">
          <h3>Resultados del Análisis</h3>
          <ul>
            <li><strong>Total de mensajes procesados:</strong> {metrics.total}</li>
            <li><strong>Usuario Top:</strong> {metrics.topUser?.author} ({metrics.topUser?.count} msjs)</li>
            <li><strong>Día más activo:</strong> {metrics.busiestDay?.date} ({metrics.busiestDay?.messages} msjs)</li>
            <li><strong>Hora pico:</strong> {metrics.busiestHour?.hour} ({metrics.busiestHour?.messages} msjs)</li>
          </ul>
        </div>
      )}
    </div>
  );
};