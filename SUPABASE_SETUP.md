# Instrucciones de Setup - Supabase

Esta guía te llevará paso a paso para configurar Supabase.

## Paso 1: Crear Cuenta y Proyecto

1. Ve a https://supabase.com
2. Click en "Start your project"
3. Inicia sesión con GitHub (recomendado) o email
4. Click en "New Project"
5. Llena los datos:
   - **Name**: meal-planner
   - **Database Password**: (guarda esta contraseña, la necesitarás)
   - **Region**: Selecciona la más cercana (ej: South America para Latinoamérica)
   - **Pricing Plan**: Free
6. Click "Create new project"
7. Espera 2-3 minutos mientras se crea el proyecto

## Paso 2: Ejecutar el Schema SQL

1. En el panel izquierdo, click en "SQL Editor"
2. Click en "New query"
3. Abre el archivo `lib/supabase/schema.sql` de tu proyecto
4. Copia TODO el contenido
5. Pégalo en el editor de Supabase
6. Click en "Run" (botón verde abajo a la derecha)
7. Deberías ver "Success. No rows returned"

## Paso 3: Verificar Tablas Creadas

1. En el panel izquierdo, click en "Table Editor"
2. Deberías ver estas tablas:
   - user_profiles
   - ingredients
   - recipes
   - recipe_ingredients
   - meal_plan
   - shopping_list

## Paso 4: Obtener las Credenciales

1. En el panel izquierdo, click en "Settings" (⚙️)
2. Click en "API"
3. En la sección "Project URL", copia la URL
   - Ejemplo: `https://tuproyecto.supabase.co`
4. En la sección "API Keys", busca "anon public" y cópiala
   - Es una clave larga que empieza con "eyJ..."

## Paso 5: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en tu proyecto
2. Reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-clave-completa...
GEMINI_API_KEY=tu-gemini-api-key-aqui
```

## Paso 6: Configurar Autenticación (Opcional pero Recomendado)

Para que los usuarios puedan registrarse:

1. En Supabase, ve a "Authentication"
2. Click en "Providers"
3. Habilita "Email" (ya debería estar habilitado)
4. **Opcional**: Habilita también Google, GitHub, etc.

### Configurar Email Redirect

1. En "Authentication" > "URL Configuration"
2. En "Site URL", pon:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-app.vercel.app`

## Paso 7: Probar la Conexión

```bash
npm run dev
```

Abre http://localhost:3000 y verifica:
- La app carga sin errores
- Puedes navegar entre páginas

## ¿Problemas?

### Error: "Invalid API key"
- Verifica que copiaste la clave completa (son varios renglones)
- Asegúrate de reiniciar el servidor (`Ctrl+C` y `npm run dev`)

### Error: "relation does not exist"
- El schema SQL no se ejecutó correctamente
- Vuelve al Paso 2 y ejecuta el script otra vez

### Las tablas no aparecen
- Espera unos segundos y refresca
- Revisa que el script se ejecutó sin errores

## 🎉 ¡Listo!

Tu base de datos está configurada. Ahora puedes:
1. Crear recetas
2. Planificar comidas
3. Generar listas de compras
