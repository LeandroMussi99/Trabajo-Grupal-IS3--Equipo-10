import React from "react";
import {
  parseWhatsAppChat,
  getUserWithMostMessages,
  getBusiestHour,
} from "../utils/parser";

export const UploadSection = () => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;

      // 1. Parsear
      const parsedData = parseWhatsAppChat(text);
      console.log("✅ Total de mensajes válidos:", parsedData.length);

      // 2. Calcular Métrica: Usuario top
      const topUser = getUserWithMostMessages(parsedData);
      const busiestHour = getBusiestHour(parsedData);
      console.log("✅ ¡Archivo procesado con éxito!");
      console.log("Total de mensajes válidos:", parsedData.length);
      console.table(parsedData.slice(0, 20)); // Mostramos los primeros 5 en formato tabla
      if (busiestHour) {
        console.log(
          `⏰ La hora más picante fue a las: ${busiestHour.hour} con ${busiestHour.messages} mensajes.`,
        );
      }
      if (topUser) {
        console.log(
          `🏆 El usuario que más mensajes mandó fue: ${topUser.author} con ${topUser.count} mensajes.`,
        );
      } else {
        console.log(
          "No se pudo determinar el usuario (archivo vacío o sin formato).",
        );
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="upload-container">
      <h2>Analizá tu chat de WhatsApp</h2>
      <p>
        Exportá tu chat en formato .txt y subilo acá para ver las estadísticas.
      </p>

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
