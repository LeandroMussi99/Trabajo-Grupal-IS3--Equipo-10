// frontend/src/utils/parser.js

export const parseWhatsAppChat = (text) => {
  const lines = text.split(/\r?\n/);
  const messages = [];

  // Android:
  const regexAndroid =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.+?):\s(.+)$/;

  // iOS:
  const regexIOS =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}):\d{2}\]\s(.+?):\s(.+)$/;

  // Mensaje de sistema Android (sin autor, se ignora)
  const regexSystem =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s[^:]+$/;

  lines.forEach((line) => {
    if (line.match(regexSystem)) return;

    const match = line.match(regexAndroid) || line.match(regexIOS);

    if (match) {
      messages.push({
        date: match[1],
        time: match[2],
        author: match[3],
        text: match[4],
      });
    } else {
      if (line.trim().length > 0) {
        console.log("NO MATCH:", JSON.stringify(line.substring(0, 80)));
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

  messages.forEach(msg => {
    const hour = msg.time.split(':')[0];
    const formattedHour = `${hour}h`;
    hourCounts[formattedHour] = (hourCounts[formattedHour] || 0) + 1;
  });

  // Transformamos el objeto en un array para que Recharts lo entienda y lo ordenamos por hora
  return Object.keys(hourCounts).map(key => ({
    hora: key,
    mensajes: hourCounts[key]
  })).sort((a, b) => parseInt(a.hora) - parseInt(b.hora));
};