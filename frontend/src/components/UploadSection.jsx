import React from 'react';

export const UploadSection = () => {

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; 
    if (!file) return; 

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      console.log("¡Archivo cargado con éxito!");
      console.log("-----------------------------------------");
      
      console.log(text.substring(0, 500)); 
      console.log("-----------------------------------------");
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
    </div>
  );
};