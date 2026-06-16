// frontend/src/utils/parser.js

export const parseWhatsAppChat = (text) => {
  // Limpiamos caracteres invisibles y preparamos el corte por fecha
  const cleanText = text.replace(/\u200E/g, "").replace(/\r\n/g, "\n");
  const rawMessages = cleanText.split(
    /\n(?=\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2})/,
  );

  const messages = [];

  // Android (modificado para soportar multilínea con [\s\S]+)
  const regexAndroid =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.+?):\s([\s\S]+)$/;

  // iOS (modificado para soportar multilínea con [\s\S]+)
  const regexIOS =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})(?::\d{2})?\]\s(.+?):\s([\s\S]+)$/;

  rawMessages.forEach((rawMsg) => {
    const line = rawMsg.trim();
    if (!line) return;

    const match = line.match(regexAndroid) || line.match(regexIOS);

    if (match) {
      const messageText = match[4].trim();

      // Filtramos mensajes de sistema o archivos multimedia omitidos
      const isSystem =
        messageText.includes("cifrados de extremo a extremo") ||
        messageText.includes("cambió tu código de seguridad");
      const isMedia =
        /(omitid[oa]|llamada perdida|Video omitido|sticker omitido|imagen omitida|audio omitido)/i.test(
          messageText,
        );

      if (!isSystem && !isMedia) {
        messages.push({
          date: match[1],
          time: match[2],
          author: match[3].trim(),
          text: messageText,
        });
      }
    }
  });

  return messages;
};

export const getUserWithMostMessages = (messages) => {
  if (!messages || messages.length === 0) return null;

  const userCounts = {};

  // 1. Contamos los mensajes por cada autor
  messages.forEach((msg) => {
    const author = msg.author.trim().toLowerCase();

    if (author.length > 30) return;

    if (userCounts[author]) {
      userCounts[author]++;
    } else {
      userCounts[author] = 1;
    }
  });

  // 2. Buscamos el que tiene el valor más alto
  let topUser = null;
  let maxMessages = 0;

  for (const [author, count] of Object.entries(userCounts)) {
    if (count > maxMessages) {
      maxMessages = count;
      topUser = author.charAt(0).toUpperCase() + author.slice(1);
    }
  }

  return { author: topUser, count: maxMessages };
};

export const getBusiestHour = (messages) => {
  if (!messages || messages.length === 0) return null;

  const hourCounts = {};

  messages.forEach((msg) => {
    // La hora viene como "14:30" o "9:15", la separamos por los ":" y nos quedamos con la primera parte.
    const hour = msg.time.split(":")[0];
    const formattedHour = `${hour}h`; // Le agregamos la 'h' para el JSON del front (ej: "14h")

    // Sumamos 1 al contador de esa hora
    hourCounts[formattedHour] = (hourCounts[formattedHour] || 0) + 1;
  });

  let topHour = null;
  let maxMessages = 0;

  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxMessages) {
      maxMessages = count;
      topHour = hour;
    }
  }

  return { hour: topHour, messages: maxMessages };
};

export const getBusiestDay = (messages) => {
  if (!messages || messages.length === 0) return null;

  const dayCounts = {};

  messages.forEach((msg) => {
    // Usamos la fecha completa (ej: "14/04/2026")
    const date = msg.date;
    dayCounts[date] = (dayCounts[date] || 0) + 1;
  });

  let topDate = null;
  let maxMessages = 0;

  for (const [date, count] of Object.entries(dayCounts)) {
    if (count > maxMessages) {
      maxMessages = count;
      topDate = date;
    }
  }

  return { date: topDate, messages: maxMessages };
};

export const getMostUsedEmoji = (messages) => {
  if (!messages || messages.length === 0) return null;

  const emojiCounts = {};

  // Regex moderna para detectar cualquier tipo de emoji (soporta banderas, caras, objetos, etc.)
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

  messages.forEach((msg) => {
    // Buscamos todos los emojis dentro del texto del mensaje
    const emojis = msg.text.match(emojiRegex);

    if (emojis) {
      emojis.forEach((emoji) => {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      });
    }
  });

  let topEmoji = null;
  let maxCount = 0;

  for (const [emoji, count] of Object.entries(emojiCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topEmoji = emoji;
    }
  }

  return { emoji: topEmoji, count: maxCount };
};

export const getHourlyActivityData = (messages) => {
  if (!messages || messages.length === 0) return [];

  const hourCounts = {};

  messages.forEach((msg) => {
    const hour = msg.time.split(":")[0];
    const formattedHour = `${hour}h`;
    hourCounts[formattedHour] = (hourCounts[formattedHour] || 0) + 1;
  });

  // Transformamos el objeto en un array para que Recharts lo entienda y lo ordenamos por hora
  return Object.keys(hourCounts)
    .map((key) => ({
      hora: key,
      mensajes: hourCounts[key],
    }))
    .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));
};

export const getMostUsedWords = (messages) => {
  if (!messages || messages.length === 0) return [];

  const wordCounts = {};

  // Lista de palabras que NO queremos contar (ampliada sin tildes)
  const stopWords = new Set([
    "de",
    "la",
    "que",
    "el",
    "en",
    "y",
    "a",
    "los",
    "se",
    "del",
    "las",
    "un",
    "por",
    "con",
    "no",
    "una",
    "su",
    "para",
    "es",
    "al",
    "lo",
    "como",
    "mas",
    "o",
    "pero",
    "sus",
    "le",
    "ya",
    "si",
    "te",
    "me",
    "mi",
    "eso",
    "si",
    "que",
    "q",
    "xq",
    "jaja",
    "jajaja",
    "jajaj",
    "jajajaja",
    "multimedia",
    "omitido",
  ]);

  messages.forEach((msg) => {
    // Pasamos a minúsculas, quitamos tildes y dejamos solo letras
    const cleanText = msg.text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\s]/gu, "");

    const words = cleanText.split(/\s+/);

    words.forEach((word) => {
      const cleanWord = word.trim();
      // Solo contamos si tiene más de 2 letras y no está en nuestra lista negra
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
  });

  // Convertimos el objeto a un array, lo ordenamos de mayor a menor y nos quedamos con las 30 principales
  return Object.keys(wordCounts)
    .map((key) => ({ text: key, value: wordCounts[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 30);
};
