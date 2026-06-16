import { describe, it, expect } from "vitest";
import {
  parseWhatsAppChat,
  getUserWithMostMessages,
  getBusiestHour,
  getBusiestDay,
  getMostUsedEmoji,
  getHourlyActivityData,
  getMostUsedWords,
} from "../utils/parser";

// ──────────────────────────────────────────────
// parseWhatsAppChat: formatos básicos
// ──────────────────────────────────────────────
describe("parseWhatsAppChat - formatos básicos", () => {
  it("parsea correctamente el formato Android (guion, sin segundos)", () => {
    const chat = "15/06/24, 10:30 - Juan: Hola desde Android";
    const result = parseWhatsAppChat(chat);

    console.log("[Android] Input  :", chat);
    console.log("[Android] Output :", JSON.stringify(result[0]));

    expect(result.length).toBe(1);
    expect(result[0].author).toBe("Juan");
    expect(result[0].text).toBe("Hola desde Android");
    expect(result[0].date).toBe("15/06/24");
    expect(result[0].time).toBe("10:30");
  });

  it("parsea correctamente el formato iOS (corchetes, con segundos)", () => {
    const chat = "[15/06/24, 10:30:45] Juan: Hola desde iOS";
    const result = parseWhatsAppChat(chat);

    console.log("[iOS] Input  :", chat);
    console.log("[iOS] Output :", JSON.stringify(result[0]));

    expect(result.length).toBe(1);
    expect(result[0].author).toBe("Juan");
    expect(result[0].text).toBe("Hola desde iOS");
    expect(result[0].date).toBe("15/06/24");
    expect(result[0].time).toBe("10:30");
  });

  it("normaliza ambos formatos hacia la misma estructura de objeto interno", () => {
    const chatAndroid = "15/06/24, 10:30 - Juan: Mensaje de prueba";
    const chatIOS = "[15/06/24, 10:30:00] Juan: Mensaje de prueba";

    const resultAndroid = parseWhatsAppChat(chatAndroid)[0];
    const resultIOS = parseWhatsAppChat(chatIOS)[0];

    console.log("[Normalización] Android :", JSON.stringify(resultAndroid));
    console.log("[Normalización] iOS     :", JSON.stringify(resultIOS));

    expect(Object.keys(resultAndroid).sort()).toEqual(
      Object.keys(resultIOS).sort(),
    );
    expect(resultAndroid.author).toBe(resultIOS.author);
    expect(resultAndroid.text).toBe(resultIOS.text);
  });
});

// ──────────────────────────────────────────────
// Stress Testing
// ──────────────────────────────────────────────
describe("Stress Testing", () => {
  it("procesa un chat extenso (23.000+ líneas) sin lanzar errores", () => {
    let chatGigante = "";
    for (let i = 1; i <= 23000; i++) {
      chatGigante += `15/06/24, 10:${String(i % 60).padStart(2, "0")} - Usuario${i % 5}: mensaje numero ${i}\n`;
    }

    const start = performance.now();
    const result = parseWhatsAppChat(chatGigante);
    const end = performance.now();
    const tiempoMs = (end - start).toFixed(2);

    console.log(`[Stress] Líneas de entrada     : 23000`);
    console.log(`[Stress] Mensajes procesados   : ${result.length}`);
    console.log(`[Stress] Tiempo de procesamiento: ${tiempoMs} ms`);

    expect(result.length).toBe(23000);
    expect(end - start).toBeLessThan(1000);
  });

  it("getMostUsedWords nunca devuelve más de 30 palabras, sin importar la variedad del texto", () => {
    let chat = "";
    for (let i = 1; i <= 5000; i++) {
      chat += `15/06/24, 10:00 - Juan: palabraunica${i} repetida\n`;
    }
    const messages = parseWhatsAppChat(chat);
    const wordData = getMostUsedWords(messages);

    console.log("[WordCloud] Cantidad de palabras devueltas:", wordData.length);
    console.log("[WordCloud] Top 5:", JSON.stringify(wordData.slice(0, 5)));

    expect(wordData.length).toBeLessThanOrEqual(30);
    // "repetida" debería ser la más frecuente, con 5000 ocurrencias
    expect(wordData[0].text).toBe("repetida");
    expect(wordData[0].value).toBe(5000);
  });
});

// ──────────────────────────────────────────────
// Mensajes Multilínea
// ──────────────────────────────────────────────
describe("Mensajes Multilínea", () => {
  it("concatena líneas sin formato de fecha al mensaje anterior", () => {
    const chat =
      "15/06/24, 10:30 - Juan: Este es un mensaje largo\n" +
      "que continúa en la siguiente línea\n" +
      "y termina acá";

    const result = parseWhatsAppChat(chat);

    console.log("[Multilínea] Input completo:");
    console.log(chat);
    console.log("[Multilínea] Mensajes generados:", result.length);
    console.log("[Multilínea] Texto final concatenado:");
    console.log(result[0].text);

    expect(result.length).toBe(1);
    expect(result[0].author).toBe("Juan");
    expect(result[0].text).toContain("Este es un mensaje largo");
    expect(result[0].text).toContain("que continúa en la siguiente línea");
    expect(result[0].text).toContain("y termina acá");
  });

  it('no genera mensajes "huérfanos" sin autor a partir de líneas multilínea', () => {
    const chat =
      "15/06/24, 10:30 - Ana: Hola\n" +
      "segunda línea de Ana\n" +
      "15/06/24, 10:31 - Juan: Respuesta de Juan";

    const result = parseWhatsAppChat(chat);

    console.log("[Multilínea-2] Mensajes generados:", result.length);
    result.forEach((m, i) =>
      console.log(
        `[Multilínea-2] Mensaje ${i}: autor="${m.author}" texto="${m.text}"`,
      ),
    );

    expect(result.length).toBe(2);
    expect(result[0].author).toBe("Ana");
    expect(result[0].text).toContain("segunda línea de Ana");
    expect(result[1].author).toBe("Juan");
  });
});

// ──────────────────────────────────────────────
// Eventos del Sistema de WhatsApp
// ──────────────────────────────────────────────
describe("Eventos del Sistema", () => {
  it("ignora mensajes de sistema (sin estructura Autor: Mensaje) en el ranking de usuarios", () => {
    const chat =
      "15/06/24, 10:00 - Los mensajes y las llamadas están cifrados de extremo a extremo\n" +
      "15/06/24, 10:01 - Juan: Hola\n" +
      "15/06/24, 10:02 - Pedro abandonó el grupo\n" +
      "15/06/24, 10:03 - Ana: Hola Juan";

    const result = parseWhatsAppChat(chat);
    const autores = result.map((m) => m.author);

    console.log(
      "[Sistema] Mensajes parseados:",
      result.length,
      "(de 4 líneas de entrada)",
    );
    console.log("[Sistema] Autores detectados:", JSON.stringify(autores));

    expect(autores).toEqual(["Juan", "Ana"]);
  });

  it("getUserWithMostMessages no contabiliza mensajes de sistema", () => {
    const chat =
      "15/06/24, 10:00 - Los mensajes y las llamadas están cifrados de extremo a extremo\n" +
      "15/06/24, 10:01 - Juan: Hola\n" +
      "15/06/24, 10:02 - Juan: Como estas\n" +
      "15/06/24, 10:03 - Ana: Hola Juan";

    const messages = parseWhatsAppChat(chat);
    const topUser = getUserWithMostMessages(messages);

    console.log(
      "[Sistema-Ranking] Usuario con más mensajes:",
      JSON.stringify(topUser),
    );

    expect(topUser.author).toBe("Juan");
    expect(topUser.count).toBe(2);
  });
});

// ──────────────────────────────────────────────
// Carencia de Datos Específicos (Sin Emojis)
// ──────────────────────────────────────────────
describe("Chat sin Emojis", () => {
  it("retorna count 0 si no hay emojis, sin lanzar excepción", () => {
    const chat =
      "15/06/24, 10:00 - Juan: Buenos dias equipo\n" +
      "15/06/24, 10:01 - Ana: Recibido, gracias";

    const messages = parseWhatsAppChat(chat);

    expect(() => getMostUsedEmoji(messages)).not.toThrow();

    const resultado = getMostUsedEmoji(messages);
    console.log(
      "[Sin Emojis] Resultado de getMostUsedEmoji:",
      JSON.stringify(resultado),
    );

    expect(resultado.count).toBe(0);
    expect(resultado.emoji).toBeNull();
  });

  it("detecta correctamente el emoji más usado cuando sí existen", () => {
    const chat =
      "15/06/24, 10:00 - Juan: Hola 😂\n" +
      "15/06/24, 10:01 - Ana: jaja 😂😂\n" +
      "15/06/24, 10:02 - Juan: que bueno 🔥";

    const messages = parseWhatsAppChat(chat);
    const resultado = getMostUsedEmoji(messages);

    console.log(
      "[Con Emojis] Resultado de getMostUsedEmoji:",
      JSON.stringify(resultado),
    );

    expect(resultado.emoji).toBe("😂");
    expect(resultado.count).toBe(3);
  });
});

// ──────────────────────────────────────────────
// Mensajes Multimedia Vacíos (Stopwords)
// ──────────────────────────────────────────────
describe("Filtro de Multimedia Omitido", () => {
  it('excluye "multimedia" y "omitido" del conteo de palabras frecuentes', () => {
    const chat =
      "15/06/24, 10:00 - Juan: multimedia omitido\n" +
      "15/06/24, 10:01 - Ana: multimedia omitido\n" +
      "15/06/24, 10:02 - Juan: multimedia omitido\n" +
      "15/06/24, 10:03 - Ana: hola que tal estamos charlando";

    const messages = parseWhatsAppChat(chat);
    const wordData = getMostUsedWords(messages);
    const palabras = wordData.map((w) => w.text);

    console.log('[Stopwords] "multimedia omitido" aparece 3 veces en el chat');
    console.log(
      "[Stopwords] Palabras detectadas en la nube:",
      JSON.stringify(palabras),
    );

    expect(palabras).not.toContain("multimedia");
    expect(palabras).not.toContain("omitido");
    expect(palabras).toContain("charlando");
  });
});

// ──────────────────────────────────────────────
// Franja horaria con mayor actividad
// ──────────────────────────────────────────────
describe("Franja horaria con mayor actividad", () => {
  it("getBusiestHour identifica la hora con más mensajes", () => {
    const chat =
      "15/06/24, 10:00 - Juan: msg1\n" +
      "15/06/24, 10:15 - Ana: msg2\n" +
      "15/06/24, 10:45 - Juan: msg3\n" +
      "15/06/24, 22:00 - Ana: msg4";

    const messages = parseWhatsAppChat(chat);
    const result = getBusiestHour(messages);

    console.log(
      "[Franja Horaria] Resultado de getBusiestHour:",
      JSON.stringify(result),
    );

    expect(result.hour).toBe("10h");
    expect(result.messages).toBe(3);
  });

  it("getHourlyActivityData devuelve el array ordenado por hora ascendente", () => {
    const chat =
      "15/06/24, 22:00 - Ana: msg1\n" +
      "15/06/24, 08:00 - Juan: msg2\n" +
      "15/06/24, 08:30 - Juan: msg3";

    const messages = parseWhatsAppChat(chat);
    const result = getHourlyActivityData(messages);

    console.log(
      "[Actividad por Hora] Resultado de getHourlyActivityData:",
      JSON.stringify(result),
    );

    expect(result[0].hora).toBe("08h");
    expect(result[0].mensajes).toBe(2);
    expect(result[result.length - 1].hora).toBe("22h");
  });
});

// ──────────────────────────────────────────────
// Día con mayor cantidad de mensajes
// ──────────────────────────────────────────────
describe("Día con mayor cantidad de mensajes", () => {
  it("getBusiestDay identifica el día con más mensajes", () => {
    const chat =
      "15/06/24, 10:00 - Juan: msg1\n" +
      "15/06/24, 11:00 - Ana: msg2\n" +
      "16/06/24, 10:00 - Juan: msg3";

    const messages = parseWhatsAppChat(chat);
    const result = getBusiestDay(messages);

    console.log(
      "[Día más activo] Resultado de getBusiestDay:",
      JSON.stringify(result),
    );

    expect(result.date).toBe("15/06/24");
    expect(result.messages).toBe(2);
  });
});
