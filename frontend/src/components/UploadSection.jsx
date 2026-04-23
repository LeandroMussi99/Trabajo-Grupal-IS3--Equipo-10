import React from 'react';

export const UploadSection = () => {
  return (
    <div className="upload-container">
      <h2>Analizá tu chat de WhatsApp</h2>
      <p>Exportá tu chat en formato .txt y subilo acá para ver las estadísticas.</p>
      
      <div className="upload-box">
        <input type="file" id="chat-file" accept=".txt" />
        <label htmlFor="chat-file" className="upload-btn">
          Seleccionar archivo .txt
        </label>
      </div>
    </div>
  );
};