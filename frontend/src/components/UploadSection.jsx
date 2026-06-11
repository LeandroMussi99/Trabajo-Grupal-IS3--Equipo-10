import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  parseWhatsAppChat,
  getUserWithMostMessages,
  getBusiestHour,
  getBusiestDay,
  getMostUsedEmoji,
  getHourlyActivityData,
  getMostUsedWords,
} from "../utils/parser";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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
      const mostUsedEmoji = getMostUsedEmoji(parsedData);
      const hourlyData = getHourlyActivityData(parsedData);
      const wordCloudData = getMostUsedWords(parsedData);

      // Guardamos todo en el estado de React
      setMetrics({
        total: parsedData.length,
        topUser,
        busiestHour,
        busiestDay,
        mostUsedEmoji,
        hourlyData,
        wordCloudData,
      });
    };

    reader.readAsText(file);
  };

  // Preparamos los datos para Chart.js SOLO si metrics y hourlyData existen
  const chartData = metrics?.hourlyData
    ? {
        labels: metrics.hourlyData.map((d) => d.hora),
        datasets: [
          {
            label: "Cantidad de mensajes",
            data: metrics.hourlyData.map((d) => d.mensajes),
            backgroundColor: "#25D366", // Verde WhatsApp
            borderRadius: 4,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Actividad por Hora" },
    },
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

      {/* Renderizado Condicional: Solo se muestra si hay métricas calculadas */}
      {metrics && (
        <div className="dashboard-results">
          <h3>Resultados del Análisis</h3>
          <ul>
            <li>
              <strong>Total de mensajes procesados:</strong> {metrics.total}
            </li>
            <li>
              <strong>Usuario Top:</strong> {metrics.topUser?.author} (
              {metrics.topUser?.count} msjs)
            </li>
            <li>
              <strong>Día más activo:</strong> {metrics.busiestDay?.date} (
              {metrics.busiestDay?.messages} msjs)
            </li>
            <li>
              <strong>Hora pico:</strong> {metrics.busiestHour?.hour} (
              {metrics.busiestHour?.messages} msjs)
            </li>
            {metrics.mostUsedEmoji && (
              <li>
                <strong>Emoji favorito:</strong> {metrics.mostUsedEmoji.emoji}{" "}
                (usado {metrics.mostUsedEmoji.count} veces)
              </li>
            )}
          </ul>
          <div
            className="chart-container"
            style={{ width: "100%", height: "300px", marginTop: "30px" }}
          >
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div
            className="word-cloud-container"
            style={{ marginTop: "40px", textAlign: "center" }}
          >
            <h4>Nube de Palabras</h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                backgroundColor: "#f0f2f5",
                borderRadius: "8px",
              }}
            >
              {metrics.wordCloudData?.map((word, index) => {
                const fontSize = Math.max(
                  14,
                  Math.min(50, 10 + word.value * 2),
                );

                return (
                  <span
                    key={index}
                    style={{
                      fontSize: `${fontSize}px`,
                      fontWeight: index < 5 ? "bold" : "normal",
                      color: index % 2 === 0 ? "#128C7E" : "#25D366",
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
