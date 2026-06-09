// frontend/src/utils/parser.js

export const parseWhatsAppChat = (text) => {
  const lines = text.split('\n');
  const messages = [];

  // Regex básico (se puede mejorar después para soportar mensajes multilínea)
  const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.*?):\s(.*)$/;

  lines.forEach(line => {
    const match = line.match(regex);
    if (match) {
      messages.push({
        date: match[1],
        time: match[2],
        author: match[3],
        text: match[4]
      });
    }
  });

  return messages;
};


export const getUserWithMostMessages = (messages) => {
  if (!messages || messages.length === 0) return null;

  const userCounts = {};

  // 1. Contamos los mensajes por cada autor
  messages.forEach(msg => {
    const author = msg.author.trim().toLowerCase(); 
    
    if(author.length > 30) return; 

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