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
import "./UploadSection.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

/* ── Iconos SVG inline ─────────────── */
const IconMessage = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </svg>
);

export const UploadSection = () => {
  const [metrics, setMetrics] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = parseWhatsAppChat(text);
      const authorsSet = new Set();
      const daysMap = {};

      parsedData.forEach((msg) => {
        if (msg.author) authorsSet.add(msg.author);
        daysMap[msg.date] = (daysMap[msg.date] || 0) + 1;
      });

      const sortedDays = Object.entries(daysMap)
        .map(([date, count]) => ({ date, messages: count }))
        .sort((a, b) => b.messages - a.messages);

      const firstDate = parsedData.length > 0 ? parsedData[0].date : "—";
      const lastDate =
        parsedData.length > 0 ? parsedData[parsedData.length - 1].date : "—";

      // --- NUEVA LÓGICA DE CÁLCULO DE DÍAS ---
      // Función auxiliar para convertir "DD/MM/YY" o "DD/MM/YYYY" a Date
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === "—") return new Date();
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0 a 11
          let year = parseInt(parts[2], 10);
          if (year < 100) year += 2000; // Convierte "24" en 2024
          return new Date(year, month, day);
        }
        return new Date(dateStr); // Fallback por si viene en otro formato
      };

      let realTotalDays = 1;
      const activeDays = Object.keys(daysMap).length || 1; // Días que sí tuvieron mensajes

      if (parsedData.length > 1) {
        const startDate = parseDate(firstDate);
        const endDate = parseDate(lastDate);
        const diffTime = Math.abs(endDate - startDate);
        // Pasamos la diferencia de milisegundos a días (+1 para que sea inclusivo)
        realTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }

      const dailyAverage = Math.round(parsedData.length / realTotalDays);
      // ---------------------------------------

      setMetrics({
        total: parsedData.length,
        topUser: getUserWithMostMessages(parsedData),
        busiestHour: getBusiestHour(parsedData),
        busiestDay: getBusiestDay(parsedData),
        mostUsedEmoji: getMostUsedEmoji(parsedData),
        hourlyData: getHourlyActivityData(parsedData),
        wordCloudData: getMostUsedWords(parsedData),
        participantsCount: authorsSet.size,
        totalDays: realTotalDays, // Ahora pasamos los días de calendario reales
        activeDaysCount: activeDays, // Te lo dejo por si querés mostrarlo en algún lado
        dailyAverage,
        firstDate,
        lastDate,
        top5Days: sortedDays.slice(0, 5),
      });
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (event) => {
    processFile(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFile(event.dataTransfer.files[0]);
    }
  };

  const chartData = metrics?.hourlyData
    ? {
        labels: metrics.hourlyData.map((d) => d.hora),
        datasets: [
          {
            label: "Mensajes",
            data: metrics.hourlyData.map((d) => d.mensajes),
            backgroundColor: "#25D366",
            borderRadius: 4,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f0f2f5" }, border: { display: false } },
    },
  };

  const fmt = (num) => num?.toLocaleString("es-AR") || "0";

  // Función para reiniciar el panel (botón "Limpiar datos")
  const resetDashboard = () => {
    setMetrics(null);
    setFileName("");
  };

  // Pantalla de carga (Landing Page mejorada)
  if (!metrics) {
    return (
      <div className="landing-container">
        {/* Barra superior simple */}
        <nav className="landing-nav">
          <div className="logo-icon">
            <IconChat />
          </div>
          <h2>
            WhatsAnalyze{" "}
            <span style={{ fontWeight: "400", fontSize: "16px" }}>
              | Equipo 10
            </span>
          </h2>
        </nav>

        <div className="landing-content">
          <div className="landing-text">
            <h1>Descubrí los secretos de tus chats en segundos.</h1>
            <p className="subtitle">
              Analizá tu historial de WhatsApp para descubrir patrones ocultos,
              horarios de mayor actividad, usuarios más frecuentes y el emoji
              favorito de tu grupo.
            </p>

            <ul className="features-list">
              <li>
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>100% Privado</strong>
                  <p>
                    Tus datos no se envían a ningún servidor. Todo el análisis
                    se realiza localmente en tu navegador.
                  </p>
                </div>
              </li>
              <li>
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Estadísticas Detalladas</strong>
                  <p>
                    Gráficos interactivos, nubes de palabras y métricas precisas
                    por usuario y fecha.
                  </p>
                </div>
              </li>
              <li>
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Rápido y Fácil</strong>
                  <p>
                    Solo exportá tu chat desde WhatsApp, subí el archivo .txt y
                    mirá la magia en tiempo real.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="upload-box-container">
            <div
              className={`upload-card ${isDragging ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon-large">📄</div>
              <h3>Subí tu chat acá</h3>
              <p>Arrastrá tu archivo o hacé click para buscarlo en tu PC.</p>

              <input
                type="file"
                id="chat-file"
                accept=".txt"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <label
                htmlFor="chat-file"
                className="btn-primary upload-btn-large"
              >
                Seleccionar archivo .txt
              </label>

              <span className="upload-note">
                Solo se aceptan archivos .txt exportados desde WhatsApp.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topUserPct = metrics.topUser
    ? ((metrics.topUser.count / metrics.total) * 100).toFixed(1)
    : 0;
  const emojiPct = metrics.mostUsedEmoji
    ? ((metrics.mostUsedEmoji.count / metrics.total) * 100).toFixed(1)
    : 0;
  const hourPct = metrics.busiestHour
    ? ((metrics.busiestHour.messages / metrics.total) * 100).toFixed(1)
    : 0;

  let arrangedWords = [];
  let maxWordCount = 1;

  if (metrics?.wordCloudData?.length > 0) {
    maxWordCount = Math.max(...metrics.wordCloudData.map((w) => w.value));
    metrics.wordCloudData.forEach((word, index) => {
      if (index % 2 === 0) arrangedWords.push(word);
      else arrangedWords.unshift(word);
    });
  }

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <IconChat />
          </div>
          <h2>WhatsAnalyze</h2>
        </div>

        <div className="sidebar-bottom" style={{ marginTop: "auto" }}>
          <div className="file-info-box">
            <p className="file-title">Chat cargado</p>
            <p className="file-name">{fileName || "Grupo de amigos"}</p>
            <p className="file-details">Mensajes: {fmt(metrics.total)}</p>

            <input
              type="file"
              id="change-file"
              accept=".txt"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <label htmlFor="change-file" className="btn-outline">
              Cambiar archivo
            </label>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1>Resumen general</h1>
            <p>Estadísticas generales de tu chat</p>
          </div>
          <button className="btn-primary" onClick={resetDashboard}>
            Limpiar panel
          </button>
        </header>

        {/* ROW 1: KPIs */}
        <div className="grid-row grid-4">
          <div className="card kpi-card">
            <div className="kpi-icon bg-green">
              <IconMessage />
            </div>
            <div className="kpi-data">
              <span className="label">Total de mensajes</span>
              <span className="value">{fmt(metrics.total)}</span>
              <span className="sub">100% del chat</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-icon bg-blue">
              <IconUsers />
            </div>
            <div className="kpi-data">
              <span className="label">Participantes</span>
              <span className="value">{fmt(metrics.participantsCount)}</span>
              <span className="sub">En el grupo</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-icon bg-yellow">
              <IconClock />
            </div>
            <div className="kpi-data">
              <span className="label">Días en el rango</span>
              <span className="value">{fmt(metrics.totalDays)}</span>
              <span className="sub">
                {metrics.firstDate} - {metrics.lastDate}
              </span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-icon bg-purple">
              <IconChat />
            </div>
            <div className="kpi-data">
              <span className="label">Promedio diario</span>
              <span className="value">{fmt(metrics.dailyAverage)}</span>
              <span className="sub">Mensajes por día</span>
            </div>
          </div>
        </div>

        {/* ROW 2: HIGHLIGHTS */}
        <div className="grid-row grid-4">
          <div className="card highlight-card">
            <h3>Usuario que más mensajes envió</h3>
            <div className="hl-content">
              <div className="hl-user">
                <span className="avatar">🏆</span>
                <div>
                  <strong>{metrics.topUser?.author || "—"}</strong>
                  <p>{fmt(metrics.topUser?.count)} mensajes</p>
                </div>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${topUserPct}%` }}
                ></div>
              </div>
              <p className="hl-pct">{topUserPct}% del total</p>
            </div>
          </div>

          <div className="card highlight-card center-content">
            <h3>Emoji más utilizado</h3>
            <div className="hl-content emoji-box">
              <span className="big-emoji">
                {metrics.mostUsedEmoji?.emoji || "—"}
              </span>
              <strong>{fmt(metrics.mostUsedEmoji?.count)} veces</strong>
              <p className="hl-pct">{emojiPct}% del total</p>
            </div>
          </div>

          <div className="card highlight-card">
            <h3>Franja horaria con mayor actividad</h3>
            <div className="hl-content">
              <strong className="big-text">
                {metrics.busiestHour?.hour || "—"}
              </strong>
              <p>{fmt(metrics.busiestHour?.messages)} mensajes</p>
              <p className="hl-pct">{hourPct}% del total</p>
              <div className="mini-bars">
                {[20, 40, 60, 100, 80, 50, 30].map((h, i) => (
                  <div
                    key={i}
                    className="mini-bar"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="card highlight-card">
            <h3>Días con mayor cantidad</h3>
            <ul className="top-days-list">
              {metrics.top5Days?.map((day, index) => (
                <li key={index}>
                  <span>
                    {index + 1}. {day.date}
                  </span>
                  <span className="text-green">{fmt(day.messages)} msjs</span>
                </li>
              ))}
              {/* Relleno visual en caso de que el chat tenga menos de 5 días de actividad */}
              {Array.from({
                length: Math.max(0, 5 - (metrics.top5Days?.length || 0)),
              }).map((_, idx) => (
                <li key={`empty-${idx}`}>
                  <span>{(metrics.top5Days?.length || 0) + idx + 1}. —</span>
                  <span className="text-green">—</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROW 3: CHARTS */}
        <div className="grid-row grid-2">
          <div className="card full-height">
            <h3>Nube de palabras</h3>
            <div className="word-cloud">
              {arrangedWords.map((word, index) => {
                const fontSize = Math.max(
                  14,
                  Math.min(45, 14 + (word.value / maxWordCount) * 31),
                );
                return (
                  <span
                    key={index}
                    style={{
                      fontSize: `${fontSize}px`,
                      fontWeight: word.value > maxWordCount / 2 ? "800" : "500",
                      color:
                        index % 3 === 0
                          ? "#128C7E"
                          : index % 2 === 0
                            ? "#25D366"
                            : "#075E54",
                      margin: "4px 10px",
                      lineHeight: "1.1",
                      display: "inline-block",
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="card full-height">
            <h3>Actividad por hora</h3>
            <div style={{ height: "250px", marginTop: "1rem" }}>
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
