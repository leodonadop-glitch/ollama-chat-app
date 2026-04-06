# 📚 GUÍA DE DESPLIEGUE EN VERCEL

## ✅ Paso 1: GitHub (COMPLETADO)
- ✅ Repositorio creado: `leodonadop-glitch/ollama-chat-app`
- ✅ Código pusheado a main branch

## 🚀 Paso 2: Desplegar en Vercel (PRÓXIMO)

### Opción A: Despliegue automático (RECOMENDADO)

1. **Ir a https://vercel.com**
2. **Hacer login con GitHub**
3. **Haz clic en "New Project"**
4. **Importar repositorio**: Selecciona `leodonadop-glitch/ollama-chat-app`
5. **Configurar Environment Variables**:
   ```
   DATABASE_URL=mongodb+srv://leodonadop_db_user:um8jqrXBb8D7VPG8@cluster0.1dtees6.mongodb.net/
   OLLAMA_API=http://localhost:11434/api/generate
   LM_STUDIO_API=http://localhost:1234/v1/chat/completions
   BACKEND=ollama
   MODEL=llama2
   ```
6. **Hacer clic en "Deploy"**

### ¿Qué pasará?
- ✅ Vercel detectará automáticamente `api/index.js`
- ✅ Desplegará el backend como funciones serverless
- ✅ Servirá el `public/` como frontend estático
- ✅ Tu app estará en vivo en `https://ollama-chat-app.vercel.app`

## 📌 Notas importantes

### ⚠️ Limitaciones en Vercel
1. **Ollama/LM Studio locales no funcionarán** en la nube
   - Necesitarías exponer tus backends locales
   - O usar APIs en nube (Hugging Face, OpenAI, Replicate)

2. **Alternativa**: Integrar con Hugging Face Inference API
   - Es gratuita (hasta 32GB mensual)
   - Agregar a `.env`:
   ```
   HUGGINGFACE_API_KEY=tu_api_key
   ```

## 🔄 Flujo de desarrollo

### Local (Ahora)
```bash
npm start  # Tu servidor local en 3000
# Ollama/LM Studio locales funcionan perfectamente
```

### En Vercel (Después del despliegue)
```
Frontend: https://ollama-chat-app.vercel.app
Backend API: https://ollama-chat-app.vercel.app/api/*
```

## 📞 Próximos pasos

Después de desplegar en Vercel:

1. **Probar la app en vivo**: https://ollama-chat-app.vercel.app
2. **Si necesitas IA en nube**, reemplaza el backend con:
   - Hugging Face Inference
   - Replicate
   - OpenAI API

¿Necesitas ayuda con alguno de estos pasos?
