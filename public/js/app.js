// Estado de la aplicación
const state = {
  messages: [],
  favorites: JSON.parse(localStorage.getItem('favorites')) || [],
  history: JSON.parse(localStorage.getItem('history')) || [],
  currentModel: localStorage.getItem('model') || 'llama2',
  currentBackend: localStorage.getItem('backend') || 'ollama',
  currentTheme: localStorage.getItem('theme') || 'dark',
  isLoading: false,
  backendStatus: { ollama: false, lmStudio: false },
  currentImage: null // Base64 de la imagen
};

// Elementos del DOM
const elements = {
  promptInput: document.getElementById('promptInput'),
  sendBtn: document.getElementById('sendBtn'),
  chatMessages: document.getElementById('chatMessages'),
  loading: document.getElementById('loading'),
  backendSelect: document.getElementById('backendSelect'),
  modelSelect: document.getElementById('modelSelect'),
  themeSelect: document.getElementById('themeSelect'),
  newChatBtn: document.getElementById('newChatBtn'),
  saveFavBtn: document.getElementById('saveFavBtn'),
  exportBtn: document.getElementById('exportBtn'),
  favoritesList: document.getElementById('favoritesList'),
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  clearContextBtn: document.getElementById('clearContextBtn'),
  chatTitle: document.getElementById('chatTitle'),
  imageInput: document.getElementById('imageInput'),
  imageSection: document.getElementById('imageSection'),
  imagePreview: document.getElementById('imagePreview'),
  removeImageBtn: document.getElementById('removeImageBtn')
};

// Inicialización
async function init() {
  applyTheme(state.currentTheme);
  elements.themeSelect.value = state.currentTheme;
  
  // Verificar estado de los backends
  await checkBackendStatus();
  
  // Establecer backend guardado
  elements.backendSelect.value = state.currentBackend;
  
  // Cargar modelos disponibles del backend actual
  await loadAvailableModels();
  
  // Restaurar modelo seleccionado
  if (state.currentModel && Array.from(elements.modelSelect.options).some(o => o.value === state.currentModel)) {
    elements.modelSelect.value = state.currentModel;
  } else if (elements.modelSelect.options.length > 0) {
    state.currentModel = elements.modelSelect.options[0].value;
    localStorage.setItem('model', state.currentModel);
  }
  
  renderFavorites();
  renderHistory();
  attachEventListeners();
}

// Verificar disponibilidad de backends
async function checkBackendStatus() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    state.backendStatus = data;
    
    // Deshabilitar opciones de backends no disponibles
    const ollamaOption = Array.from(elements.backendSelect.options).find(o => o.value === 'ollama');
    const lmStudioOption = Array.from(elements.backendSelect.options).find(o => o.value === 'lm-studio');
    
    if (ollamaOption) ollamaOption.disabled = !data.ollama;
    if (lmStudioOption) lmStudioOption.disabled = !data.lmStudio;
    
    // Si el backend actual no está disponible, cambiar a uno que esté
    if (!state.backendStatus[state.currentBackend === 'ollama' ? 'ollama' : 'lmStudio']) {
      state.currentBackend = state.backendStatus.ollama ? 'ollama' : 'lm-studio';
      localStorage.setItem('backend', state.currentBackend);
    }
  } catch (error) {
    console.error('Error verificando estado de backends:', error);
  }
}

// Cargar modelos disponibles del backend actual
async function loadAvailableModels() {
  try {
    const response = await fetch(`/api/models?backend=${state.currentBackend}`);
    const data = await response.json();
    
    if (data.success && data.models.length > 0) {
      // Limpiar opciones actuales
      elements.modelSelect.innerHTML = '';
      
      // Agregar nuevas opciones
      data.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        elements.modelSelect.appendChild(option);
      });
    } else {
      // Si falla, mostrar mensaje
      const backendName = state.currentBackend === 'lm-studio' ? 'LM Studio' : 'Ollama';
      elements.modelSelect.innerHTML = `<option value=\"\">No hay modelos disponibles en ${backendName}</option>`;
    }
  } catch (error) {
    console.error('Error cargando modelos:', error);
    const backendName = state.currentBackend === 'lm-studio' ? 'LM Studio' : 'Ollama';
    elements.modelSelect.innerHTML = `<option value=\"\">Error al conectar con ${backendName}</option>`;
  }
}

// Event Listeners
function attachEventListeners() {
  elements.sendBtn.addEventListener('click', sendMessage);
  elements.promptInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // Listener para pegar imágenes con Ctrl+V
  elements.promptInput.addEventListener('paste', handlePasteImage);

  elements.backendSelect.addEventListener('change', async (e) => {
    state.currentBackend = e.target.value;
    localStorage.setItem('backend', state.currentBackend);
    await loadAvailableModels();
  });

  elements.modelSelect.addEventListener('change', (e) => {
    state.currentModel = e.target.value;
    localStorage.setItem('model', state.currentModel);
  });

  elements.themeSelect.addEventListener('change', (e) => {
    state.currentTheme = e.target.value;
    localStorage.setItem('theme', state.currentTheme);
    applyTheme(state.currentTheme);
  });

  elements.newChatBtn.addEventListener('click', newChat);
  elements.saveFavBtn.addEventListener('click', saveFavorite);
  elements.exportBtn.addEventListener('click', exportChat);
  elements.clearHistoryBtn.addEventListener('click', clearHistory);
  elements.clearContextBtn.addEventListener('click', clearContext);

  // Image upload listeners
  elements.imageInput.addEventListener('change', handleImageUpload);
  elements.removeImageBtn.addEventListener('click', removeImage);
}

// Manejar carga de imagen
async function handleImageUpload(e) {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida');
    return;
  }
  
  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no puede ser mayor a 5MB');
    return;
  }
  
  // Leer archivo como base64
  const reader = new FileReader();
  reader.onload = (event) => {
    state.currentImage = event.target.result;
    elements.imagePreview.src = state.currentImage;
    elements.imageSection.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

// Manejar pegar imagen con Ctrl+V
function handlePasteImage(e) {
  const items = e.clipboardData?.items;
  
  if (!items) return;
  
  for (let item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      
      const file = item.getAsFile();
      if (!file) return;
      
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      // Leer archivo como base64
      const reader = new FileReader();
      reader.onload = (event) => {
        state.currentImage = event.target.result;
        elements.imagePreview.src = state.currentImage;
        elements.imageSection.style.display = 'flex';
      };
      reader.readAsDataURL(file);
      break;
    }
  }
}

// Remover imagen
function removeImage() {
  state.currentImage = null;
  elements.imageSection.style.display = 'none';
  elements.imageInput.value = '';
  elements.imagePreview.src = '';
}

// Enviar mensaje
async function sendMessage() {
  const prompt = elements.promptInput.value.trim();

  if (!prompt || state.isLoading) return;

  // Agregar mensaje del usuario
  addMessage(prompt, 'user');
  elements.promptInput.value = '';

  state.isLoading = true;
  elements.sendBtn.disabled = true;
  elements.loading.style.display = 'flex';

  try {
    // Agregar a historial
    state.history.unshift({
      id: Date.now(),
      text: prompt.substring(0, 50),
      timestamp: new Date().toLocaleString('es-ES')
    });
    if (state.history.length > 50) state.history.pop();
    localStorage.setItem('history', JSON.stringify(state.history));
    renderHistory();

    // Construir contexto completo de la conversación
    const context = buildConversationContext(prompt);

    // Llamar API con contexto completo, backend e imagen
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: context,
        model: state.currentModel,
        backend: state.currentBackend,
        image: state.currentImage // Enviar imagen en base64 si existe
      })
    });

    const data = await response.json();

    if (data.success) {
      addMessage(data.response, 'assistant');
      if (state.currentImage) {
        removeImage();
      }
    } else {
      addMessage(`❌ Error: ${data.error}`, 'assistant');
    }
  } catch (error) {
    addMessage(`❌ Error de conexión: ${error.message}`, 'assistant');
  } finally {
    state.isLoading = false;
    elements.sendBtn.disabled = false;
    elements.loading.style.display = 'none';
    elements.promptInput.focus();
  }
}

// Construir contexto completo de la conversación
function buildConversationContext(newPrompt) {
  let context = '';

  // Agregar mensajes anteriores (últimos 10 para no exceder límites)
  const recentMessages = state.messages.slice(-10);

  for (const msg of recentMessages) {
    if (msg.role === 'user') {
      context += `Usuario: ${msg.text}\n\n`;
    } else if (msg.role === 'assistant') {
      context += `Asistente: ${msg.text}\n\n`;
    }
  }

  // Agregar el nuevo prompt
  context += `Usuario: ${newPrompt}\n\nAsistente:`;

  return context;
}

// Añadir mensaje al chat
function addMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  // Formatear texto (soporte básico para markdown)
  contentDiv.innerHTML = formatText(text);

  messageDiv.appendChild(contentDiv);
  elements.chatMessages.appendChild(messageDiv);
  
  // Si no hay más mensajes de bienvenida, eliminarlos
  const welcomeMsg = elements.chatMessages.querySelector('.welcome');
  if (welcomeMsg && state.messages.length > 0) {
    welcomeMsg.remove();
  }

  // Guardar en estado
  state.messages.push({ text, role });

  // Scroll a lo último
  setTimeout(() => {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }, 0);
}

// Formatear texto (básico)
function formatText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// Nueva conversación
function newChat() {
  state.messages = [];
  elements.chatMessages.innerHTML = `
    <div class="message welcome">
      <h3>Nueva conversación</h3>
      <p>¿En qué puedo ayudarte?</p>
    </div>
  `;
  elements.chatTitle.textContent = 'Nueva conversación';
  elements.promptInput.focus();
}

// Guardar favorito
function saveFavorite() {
  if (state.messages.length === 0) {
    alert('No hay preguntas para guardar');
    return;
  }

  const lastUserMessage = [...state.messages]
    .reverse()
    .find(m => m.role === 'user');

  if (!lastUserMessage) return;

  const favorite = {
    id: Date.now(),
    text: lastUserMessage.text,
    model: state.currentModel,
    timestamp: new Date().toLocaleString('es-ES')
  };

  // Evitar duplicados
  if (!state.favorites.some(f => f.text === favorite.text)) {
    state.favorites.unshift(favorite);
    if (state.favorites.length > 50) state.favorites.pop();
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    renderFavorites();
    alert('✅ Prompt guardado como favorito');
  } else {
    alert('⚠️ Este prompt ya está guardado');
  }
}

// Renderizar favoritos
function renderFavorites() {
  const container = elements.favoritesList;

  if (state.favorites.length === 0) {
    container.innerHTML = '<p class="empty-state">Aún no tienes prompts guardados</p>';
    return;
  }

  container.innerHTML = state.favorites.map(fav => `
    <div class="favorite-item">
      <span onclick="useFavorite('${encodeURIComponent(fav.text)}')" style="cursor: pointer;">
        ${fav.text.substring(0, 30)}...
      </span>
      <button onclick="deleteFavorite(${fav.id})">✕</button>
    </div>
  `).join('');
}

// Usar favorito
function useFavorite(text) {
  elements.promptInput.value = decodeURIComponent(text);
  elements.promptInput.focus();
}

// Eliminar favorito
function deleteFavorite(id) {
  state.favorites = state.favorites.filter(f => f.id !== id);
  localStorage.setItem('favorites', JSON.stringify(state.favorites));
  renderFavorites();
}

// Renderizar historial
function renderHistory() {
  const container = elements.historyList;

  if (state.history.length === 0) {
    container.innerHTML = '<p class="empty-state">Historial vacío</p>';
    return;
  }

  container.innerHTML = state.history.slice(0, 20).map(item => `
    <div class="history-item">
      <span onclick="useFavorite('${encodeURIComponent(item.text)}')" style="cursor: pointer;">
        ${item.text.substring(0, 30)}...
      </span>
      <button onclick="deleteHistory(${item.id})">✕</button>
    </div>
  `).join('');
}

// Eliminar del historial
function deleteHistory(id) {
  state.history = state.history.filter(h => h.id !== id);
  localStorage.setItem('history', JSON.stringify(state.history));
  renderHistory();
}

// Limpiar contexto de memoria
function clearContext() {
  if (confirm('¿Estás seguro de que quieres limpiar el contexto de memoria? El modelo olvidará la conversación anterior.')) {
    state.messages = [];
    addMessage('🧠 **Contexto de memoria limpiado.** El modelo ahora no recordará conversaciones anteriores.', 'assistant');
  }
}

// Exportar conversación
function exportChat() {
  if (state.messages.length === 0) {
    alert('No hay conversación para exportar');
    return;
  }

  let text = `Exportación de LD IA Model\n`;
  text += `Modelo: ${state.currentModel}\n`;
  text += `Fecha: ${new Date().toLocaleString('es-ES')}\n`;
  text += `${'='.repeat(50)}\n\n`;

  state.messages.forEach(msg => {
    text += `${msg.role.toUpperCase()}:\n${msg.text}\n\n`;
  });

  // Crear blob y descargar
  const blob = new Blob([text], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Aplicar tema
function applyTheme(theme) {
  document.body.classList.remove('light-theme', 'dark-theme');

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }

  document.body.classList.add(`${theme}-theme`);
}

// Escuchar cambios de preferencia de tema del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.currentTheme === 'auto') {
    applyTheme('auto');
  }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
