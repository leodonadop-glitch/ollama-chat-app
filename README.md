# 🤖 LD IA Model

Una aplicación web moderna para interactuar con modelos de IA locales usando **Ollama** o **LM Studio**. Conversaciones privadas, gratuitas y sin conexión a internet.

## ✨ Características

- 🔒 **Privacidad Total** - Todo funciona localmente en tu máquina
- 💰 **Gratuito** - Sin cuotas API ni límites
- 🌐 **Offline** - No requiere conexión a internet
- 🎯 **Múltiples Backends** - Soporta Ollama y LM Studio
- 🧠 **Memoria de Conversación** - El modelo recuerda el contexto completo
- 💾 **Historial** - Guarda automáticamente tus conversaciones
- ⭐ **Favoritos** - Marca prompts importantes
- 🎨 **Temas** - Modo oscuro, claro o automático
- 📥 **Exportar** - Descarga tus conversaciones en TXT
- ⚡ **Rápido** - Interfaz fluida y responsiva

## 📋 Requisitos

Elige uno o ambos:

### Opción A: Ollama
- [Node.js](https://nodejs.org/) (v14+)
- [Ollama](https://ollama.ai/) instalado y ejecutándose en `localhost:11434`
- Un modelo descargado: `ollama pull llama2`

### Opción B: LM Studio
- [Node.js](https://nodejs.org/) (v14+)
- [LM Studio](https://lmstudio.ai/) instalado y ejecutándose en `localhost:1234`
- Un modelo cargado en LM Studio

## 🚀 Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd ollama-chat-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (opcional)**
   ```bash
   cp .env.example .env
   # Editar .env si es necesario
   ```

4. **Ejecutar tu backend de IA preferido**

   **Para Ollama:**
   ```bash
   ollama serve
   ```

   **Para LM Studio:**
   - Abre LM Studio
   - Carga un modelo
   - Inicia el servidor local (Server > Start Server)

5. **Iniciar la aplicación**
   ```bash
   npm start
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎮 Uso

### Cambiar Backend
- En el sidebar, selecciona entre **🦙 Ollama** o **🎯 LM Studio**
- La aplicación detecta automáticamente cuál está disponible
- Los modelos se cargarán del backend seleccionado
- Tu elección se guarda automáticamente

### Enviar un Prompt
- Escribe tu pregunta en el campo de entrada
- Presiona **Ctrl+Enter** o **Shift+Enter**
- O haz clic en el botón **Enviar**

### Cambiar Modelo
- Selecciona un modelo diferente en el selector
- Los modelos disponibles dependen del backend activo

### Guardar Favoritos
- Haz clic en **⭐ Guardar favorito** para guardar prompts importantes
- Accede a ellos desde la sección "Favoritos" del sidebar
- Haz clic en un favorito para usarlo nuevamente

### Gestionar Contexto
- **🧠 Limpiar Contexto**: Resetea la memoria del modelo
- **🔄 Nueva Conversación**: Limpia todo (mensajes + contexto)
- **🗑️ Limpiar Historial**: Borra el historial de conversaciones
- **📏 Memoria Inteligente**: Mantiene los últimos 10 mensajes para optimizar rendimiento

## 🔧 Modelos Disponibles

Algunos modelos populares en Ollama:

- **llama2** - Modelo versátil de Meta
- **neural-chat** - Especializado en chat
- **mistral** - Rápido y eficiente
- **orca-mini** - Compacto y rápido
- **deepseek-coder** - Para código

Descárgalos con:
```bash
ollama pull nombre_modelo
```

## 🛠️ Configuración Avanzada

### Variables de Entorno

```env
PORT=3000                                  # Puerto del servidor
OLLAMA_API=http://localhost:11434/api/generate  # URL de Ollama
MODEL=llama2                              # Modelo por defecto
```

### Cambiar Puerto

Modifica el puerto en la línea de inicio del servidor o establece:
```bash
PORT=8080 npm start
```

## 📱 Responsive

La aplicación funciona en:
- 💻 Desktop (Chrome, Firefox, Safari, Edge)
- 📱 Tablet (adaptable)
- 📱 Mobile (con sidebar colapsable)

## 🐛 Solución de Problemas

### "Error al conectar con Ollama"
- Verifica que Ollama está ejecutándose: `ollama serve`
- Asegúrate de que escucha en `localhost:11434`
- Intenta acceder a `http://localhost:11434/api/tags` en el navegador

### "Error al conectar con LM Studio"
- Abre LM Studio
- Navega a **Server** y haz clic en **Start Server**
- Asegúrate de que el servidor escucha en `localhost:1234`
- Carga un modelo antes de iniciar el servidor

### Modelos no aparecen en el selector
- **Para Ollama**: Descarga al menos un modelo: `ollama pull llama2`
- **Para LM Studio**: Abre LM Studio y carga un modelo
- Reinicia la aplicación

### Ambos backends disponibles pero no funcionan
- Verifica que uno de ellos está realmente ejecutándose
- Intenta cambiar entre backends manualmente
- Revisa la consola del navegador (F12) para más detalles del error

### Respuestas lentas
- Algunos modelos son más lentos que otros
- Prueba con `neural-chat` o `mistral` para respuestas más rápidas
- Verifica los recursos disponibles en tu máquina

## 📚 Estructura del Proyecto

```
ollama-chat-app/
├── server.js           # Backend con Express
├── package.json        # Dependencias
├── public/
│   ├── index.html      # Interfaz web
│   ├── css/
│   │   └── style.css   # Estilos
│   └── js/
│       └── app.js      # Lógica frontend
├── .env.example        # Configuración ejemplo
└── README.md           # Este archivo
```

## 📦 Dependencias

- **express** - Framework web
- **axios** - Cliente HTTP
- **body-parser** - Parser de JSON

## 📝 Licencia

Libre de usar para propósitos personales y comerciales.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de:
- Reportar bugs
- Sugerir características
- Hacer mejoras al código

## ⚠️ Privacidad

Todos tus datos se guardan localmente:
- **Historial**: Almacenado en localStorage del navegador
- **Favoritos**: Almacenado en localStorage del navegador
- **Conversaciones**: Solo en tu máquina, nunca enviadas a servidores externos

---

**¡Disfruta usando LD IA Model!** 🚀
