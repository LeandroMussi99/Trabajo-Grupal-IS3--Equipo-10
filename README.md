# 📊 WhatsAnalyze - Equipo 10

**WhatsAnalyze** es una aplicación web interactiva que permite a los usuarios analizar sus historiales de chat de WhatsApp de forma rápida, visual y **100% privada**. 

Desarrollado como proyecto para la materia **Ingeniería de Software 3 (IS3)**.

---

## ✨ Características Principales

- 🔒 **Privacidad Garantizada:** El procesamiento del archivo `.txt` se realiza íntegramente en el navegador del cliente. Ningún dato personal o mensaje se envía a servidores externos.
- 📈 **Métricas Generales:** Cálculo de mensajes totales, cantidad de participantes, período de días analizados y promedio de mensajes diarios.
- 🏆 **Rankings y Tops:** Identificación automática del usuario más activo y del emoji más utilizado en la conversación.
- ⏰ **Análisis Temporal:** Gráficos interactivos de la actividad por hora del día y un Top 5 de los días con mayor volumen de mensajes.
- ☁️ **Nube de Palabras:** Motor nativo de renderizado para visualizar las palabras más repetidas en el chat (excluyendo *stopwords* o palabras vacías).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [React](https://reactjs.org/) (Configurado con Vite)
- **Estilos:** CSS3 nativo (Layouts con CSS Grid y Flexbox)
- **Gráficos:** [Chart.js](https://www.chartjs.org/) + `react-chartjs-2`
- **Procesamiento:** Lógica de *parsing* propia mediante Expresiones Regulares (RegEx) en JavaScript puro.

---

## 🚀 Instalación y Ejecución Local

Sigue estos pasos para levantar el entorno de desarrollo en tu computadora:

### Prerrequisitos
- Tener instalado **Node.js** (versión 18 o superior).
- Tener instalado **Git**.

### Pasos

1. **Clonar el repositorio:**
```bash
   git clone [https://github.com/LeandroMussi99/Trabajo-Grupal-IS3--Equipo-10.git](https://github.com/LeandroMussi99/Trabajo-Grupal-IS3--Equipo-10.git)
```

2. **Ingresar al directorio del proyecto:**
```bash
    cd Trabajo-Grupal-IS3--Equipo-10
```

3. **Instalar las dependencias:**
```bash
    npm install
```

4. **Levantar el servidor de desarrollo:**
```bash
    npm run dev
```

5. **Abrir en el navegador:**

La terminal te indicará una ruta local (generalmente http://localhost:5173). Haz click en ella para ver la aplicación.


📱 ¿Cómo utilizarlo?
Abre WhatsApp en tu celular y selecciona el chat que deseas analizar.

Ve a los ajustes del chat y selecciona "Exportar chat".

Elige la opción "Sin archivos multimedia" (para que el proceso sea más rápido y el archivo más liviano).

Guarda el archivo .txt generado.

Abre WhatsAnalyze en tu navegador, arrastra el archivo .txt a la zona de carga ¡y disfruta del dashboard interactivo!

👥 Equipo 10 - Integrantes:

Leandro Mussi.
Ignacio Gomez.