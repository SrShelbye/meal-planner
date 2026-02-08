# 🍽️ Meal Planner - Planificador de Comidas

Aplicación web progresiva (PWA) para planificar comidas semanales y generar listas de compras inteligentes, con generación de recetas mediante IA.

## ✨ Características

- 📖 **Gestión de Recetas**: Crea, edita y organiza tus recetas
- 📅 **Calendario de Comidas**: Planifica tu semana con vista semanal interactiva
- 🛒 **Lista de Compras Inteligente**: Agregación automática de ingredientes
- ✨ **Generador con IA**: Crea recetas usando Google Gemini AI
- 📱 **PWA**: Instálala como app nativa en tu móvil
- 📄 **Exportar PDF**: Descarga tu lista de compras en PDF

## 🚀 Stack Tecnológico (100% Gratis)

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **IA**: Google Gemini API
- **Hosting**: Vercel
- **Estado**: React Query

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratis)
- Cuenta de Google AI Studio (gratis)

## 🛠️ Configuración

### 1. Clonar e Instalar

```bash
cd meal-planner
npm install
```

### 2. Configurar Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el script `lib/supabase/schema.sql`
4. Ve a **Settings > API** y copia:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configurar Gemini AI

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea una API key (gratis, 60 requests/minuto)
3. Copia la API key

### 4. Variables de Entorno

Edita el archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
GEMINI_API_KEY=tu-gemini-api-key
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📱 Instalar como PWA

### En Android/Chrome:
1. Abre la app en Chrome
2. Menú > "Añadir a la pantalla de inicio"

### En iOS/Safari:
1. Abre la app en Safari
2. Botón compartir > "Añadir a pantalla de inicio"

## 🚢 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Añade las variables de entorno
5. Deploy ✅

## 📂 Estructura del Proyecto

```
meal-planner/
├── app/
│   ├── api/ai/generate-recipe/  # Endpoint de IA
│   ├── recipes/                  # Página de recetas
│   ├── calendar/                 # Calendario de comidas
│   ├── shopping-list/            # Lista de compras
│   └── ai-generator/             # Generador con IA
├── components/
│   ├── ui/                       # Componentes UI (Button, Input, etc.)
│   ├── recipes/                  # Componentes de recetas
│   └── navigation.tsx            # Navegación
├── lib/
│   ├── supabase/                 # Cliente y schema de DB
│   ├── types/                    # TypeScript types
│   └── utils.ts                  # Utilidades
└── public/
    └── manifest.json             # PWA manifest
```

## 🎯 Uso

1. **Crear una cuenta**: Usa Supabase Auth (email/password)
2. **Añadir recetas**: Ve a "Recetas" y crea tus favoritas
3. **Planificar semana**: Usa el calendario para asignar recetas a días
4. **Generar lista**: Los ingredientes se agregan automáticamente
5. **Usar IA**: Genera recetas con ingredientes disponibles

## 🔒 Seguridad

- Row Level Security (RLS) habilitada en Supabase
- Cada usuario solo ve sus propios datos
- API keys en variables de entorno server-side

## 🆓 Límites del Tier Gratuito

- **Supabase**: 500MB DB, 1GB storage, 2GB bandwidth/mes
- **Gemini API**: 60 requests/minuto
- **Vercel**: 100GB bandwidth/mes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push y abre un Pull Request

## 📄 Licencia

MIT

## 🙏 Créditos

Desarrollado con ❤️ usando Antigravity AI
