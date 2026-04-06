const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de backends
const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434/api/generate';
const LM_STUDIO_API = process.env.LM_STUDIO_API || 'http://localhost:1234/v1/chat/completions';
const DEFAULT_MODEL = process.env.MODEL || 'llama2';
const DEFAULT_BACKEND = process.env.BACKEND || 'ollama'; // 'ollama' o 'lm-studio'

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API para generar respuestas de IA (soporta Ollama y LM Studio)
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, model = DEFAULT_MODEL, backend = DEFAULT_BACKEND, image } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt es requerido' });
    }

    let fullResponse = '';

    if (backend === 'lm-studio') {
      // Usar LM Studio (API compatible con OpenAI)
      let messageContent = [{ type: 'text', text: prompt }];
      
      // Agregar imagen si existe
      if (image) {
        messageContent.push({
          type: 'image_url',
          image_url: { url: image } // image ya es data:image/...;base64,...
        });
      }

      const response = await axios({
        method: 'post',
        url: LM_STUDIO_API,
        data: {
          model: model,
          messages: [{ role: 'user', content: messageContent }],
          temperature: 0.7,
          max_tokens: 2000
        },
        timeout: 300000 // 5 minutos
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        fullResponse = response.data.choices[0].message.content;
      }
    } else {
      // Usar Ollama (por defecto)
      let ollamaData = {
        model: model,
        prompt: prompt,
        stream: false
      };
      
      // Agregar imagen a Ollama si existe
      if (image) {
        // Convertir data URL a base64 puro
        const base64 = image.includes(',') ? image.split(',')[1] : image;
        ollamaData.images = [base64];
      }

      const response = await axios({
        method: 'post',
        url: OLLAMA_API,
        data: ollamaData,
        timeout: 300000 // 5 minutos
      });

      if (response.data && response.data.response) {
        fullResponse = response.data.response;
      }
    }

    res.json({
      success: true,
      response: fullResponse,
      model: model,
      backend: backend
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: `Error al conectar con ${DEFAULT_BACKEND === 'lm-studio' ? 'LM Studio' : 'Ollama'}. Por favor verifica que esté ejecutándose.`,
      details: error.message,
      backend: DEFAULT_BACKEND
    });
  }
});

// API para listar modelos disponibles (soporta ambos backends)
app.get('/api/models', async (req, res) => {
  const backend = req.query.backend || DEFAULT_BACKEND;
  
  try {
    let models = [];
    
    if (backend === 'lm-studio') {
      // Obtener modelos de LM Studio
      const response = await axios.get('http://localhost:1234/v1/models');
      models = response.data.data.map(m => m.id);
    } else {
      // Obtener modelos de Ollama
      const response = await axios.get('http://localhost:11434/api/tags');
      models = response.data.models.map(m => m.name);
    }
    
    res.json({
      success: true,
      models: models,
      backend: backend
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({
      success: false,
      models: [DEFAULT_MODEL],
      error: `No se pudo conectar a ${backend === 'lm-studio' ? 'LM Studio' : 'Ollama'}`,
      backend: backend
    });
  }
});

// API para verificar estado de los backends
app.get('/api/status', async (req, res) => {
  const status = {
    ollama: false,
    lmStudio: false
  };
  
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    status.ollama = true;
  } catch (e) {
    // Ollama no disponible
  }
  
  try {
    await axios.get('http://localhost:1234/v1/models', { timeout: 2000 });
    status.lmStudio = true;
  } catch (e) {
    // LM Studio no disponible
  }
  
  res.json(status);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Ollama disponible en localhost:11434`);
  console.log(`📡 LM Studio disponible en localhost:1234`);
  console.log(`⚙️  Puedes cambiar entre ambos desde la UI`);
});
