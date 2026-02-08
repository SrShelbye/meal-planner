# Guía de Setup - Gemini API

Sigue estos pasos para obtener tu API key de Google Gemini (100% gratis).

## Paso 1: Acceder a Google AI Studio

1. Ve a https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google

## Paso 2: Crear API Key

1. Click en "Create API Key"
2. Selecciona "Create API key in new project"
   - O selecciona un proyecto existente de Google Cloud si tienes
3. Click "Create"
4. Aparecerá tu API key (ejemplo: `AIzaSy...`)
5. **IMPORTANTE**: Cópiala inmediatamente (no se volverá a mostrar completa)

## Paso 3: Configurar en tu Proyecto

1. Abre el archivo `.env.local` en tu proyecto
2. Pega tu API key:

```env
GEMINI_API_KEY=AIzaSy...tu-api-key-completa
```

3. Guarda el archivo
4. Reinicia el servidor de desarrollo:

```bash
# Ctrl+C para detener
npm run dev
```

## Paso 4: Probar la IA

1. Abre http://localhost:3000
2. Ve a "IA Generador"
3. Ingresa algunos ingredientes (ej: pollo, arroz, tomate)
4. Click "Generar Receta con IA"
5. Espera 5-10 segundos
6. Deberías ver una receta generada ✨

## Límites del Tier Gratuito

- **60 requests por minuto**
- **1,500 requests por día**
- Totalmente suficiente para uso personal

## Modelos Disponibles

El proyecto usa `gemini-2.0-flash-exp` por defecto (el más rápido y gratuito).

Otros modelos que puedes usar:
- `gemini-2.0-flash-exp`: Rápido, gratis ✅
- `gemini-1.5-flash`: Alternativa estable
- `gemini-1.5-pro`: Más preciso (también gratis)

Para cambiar el modelo, edita `app/api/ai/generate-recipe/route.ts`:

```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

## ¿Problemas?

### Error: "API key no configurada"
- Verifica que copiaste la key en `.env.local`
- Reinicia el servidor de desarrollo

### Error: "403 Forbidden"
- Tu API key podría estar restringida
- Ve a Google Cloud Console > Credentials
- Asegúrate de que no haya restricciones de IP/dominio

### Error: "429 Too Many Requests"
- Alcanzaste el límite de 60 requests/minuto
- Espera 1 minuto y vuelve a intentar

### La respuesta es incorrecta o incompleta
- Gemini es muy capaz pero a veces puede variar
- Intenta generar otra vez
- Considera cambiar a `gemini-1.5-pro` para más precisión

## Seguridad 🔒

- **NUNCA** compartas tu API key públicamente
- **NUNCA** la subas a GitHub (está en `.gitignore`)
- La key solo se usa server-side (en `/api/`)
- Los usuarios no pueden verla

## 🎉 ¡Todo listo!

Tu generador de recetas con IA está funcionando.
