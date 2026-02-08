# Guía de Íconos PWA

Los íconos PWA son necesarios para que la app se vea profesional cuando se instale en dispositivos móviles.

## Opción 1: Generar con IA (Recomendado)

Usa esta herramienta gratuita para generar los íconos:

### 1. Favicon.io
https://favicon.io/favicon-generator/

**Configuración:**
- Text: 🍽️ (emoji de plato)
- Background: Linear Gradient (Indigo #4f46e5 to Purple #9333ea)
- Font Size: 100
- Descargar pack

### 2. O usar Canva (más personalizado)
https://www.canva.com

1. Crear diseño personalizado: 512x512px
2. Añadir ícono de plato/comida + calendario
3. Usar gradiente indigo→purple
4. Exportar como PNG

## Opción 2: Usar Placeholders

Si quieres empezar rápido, puedes usar emojis como placeholders:

1. Ve a https://emoji-icon-generator.vercel.app/
2. Ingresa el emoji: 🍽️
3. Descarga como 192x192 y 512x512

## Colocar los íconos

Una vez generados, renombra y coloca los archivos:

```bash
meal-planner/public/
├── icon-192.png  (192x192px)
└── icon-512.png  (512x512px)
```

## Verificar

1. Ejecuta `npm run dev`
2. Abre DevTools > Application > Manifest
3. Verifica que los íconos se muestren correctamente

## Opcional: Favicon

Para el favicon del navegador, coloca también:
- `public/favicon.ico` (32x32px)
