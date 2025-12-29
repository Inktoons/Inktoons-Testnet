# 🚀 Guía de Configuración de Inktoons - Solución 100% GRATUITA

Esta guía te ayudará a configurar tu proyecto Inktoons con **Supabase** (base de datos + almacenamiento de imágenes) y **Vercel** (hosting), todo completamente GRATIS.

---

## 📋 Tabla de Contenidos

1. [Configurar Supabase (Base de Datos + Imágenes)](#1-configurar-supabase)
2. [Configurar Variables de Entorno](#2-configurar-variables-de-entorno)
3. [Desplegar en Vercel](#3-desplegar-en-vercel)
4. [Verificar el Deployment](#4-verificar-el-deployment)

---

## 1. Configurar Supabase

### Paso 1.1: Crear cuenta en Supabase (GRATIS)

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Regístrate con tu cuenta de GitHub (recomendado) o email
4. **Plan GRATIS incluye:**
   - ✅ 500 MB de base de datos PostgreSQL
   - ✅ 1 GB de almacenamiento de archivos
   - ✅ 50,000 usuarios activos mensuales
   - ✅ 2 GB de transferencia de datos

### Paso 1.2: Crear un nuevo proyecto

1. En el dashboard de Supabase, haz clic en **"New Project"**
2. Completa los datos:
   - **Name:** `inktoons` (o el nombre que prefieras)
   - **Database Password:** Genera una contraseña segura (guárdala en un lugar seguro)
   - **Region:** Selecciona la región más cercana a tus usuarios (ej: `South America (São Paulo)`)
   - **Pricing Plan:** FREE (ya seleccionado por defecto)
3. Haz clic en **"Create new project"**
4. Espera 2-3 minutos mientras Supabase crea tu base de datos

### Paso 1.3: Configurar la Base de Datos

1. Una vez creado el proyecto, ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Abre el archivo `supabase-schema.sql` de tu proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **"Run"** (o presiona `Ctrl + Enter`)
7. Deberías ver: ✅ **"Success. No rows returned"**

### Paso 1.4: Crear el Bucket de Almacenamiento para Imágenes

1. Ve a **Storage** en el menú lateral de Supabase
2. Haz clic en **"Create a new bucket"**
3. Configura el bucket:
   - **Name:** `webtoon-images`
   - **Public bucket:** ✅ **Activado** (importante para que las imágenes sean accesibles)
4. Haz clic en **"Create bucket"**
5. Haz clic en el bucket recién creado
6. Ve a **"Policies"** → **"New Policy"**
7. Selecciona **"For full customization"**
8. Crea una política para permitir subida pública:
   ```sql
   CREATE POLICY "Allow public uploads"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'webtoon-images');
   ```
9. Crea otra política para permitir lectura pública:
   ```sql
   CREATE POLICY "Allow public access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'webtoon-images');
   ```

### Paso 1.5: Obtener las Credenciales de Supabase

1. Ve a **Settings** → **API** en el menú lateral
2. Encontrarás dos valores importantes:
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (una clave muy larga)
3. **¡Copia estos valores!** Los necesitarás en el siguiente paso

---

## 2. Configurar Variables de Entorno

### Paso 2.1: Configuración Local (para desarrollo)

1. En la raíz de tu proyecto, crea un archivo llamado `.env.local`
2. Agrega las siguientes variables:

```env
# Pi Network API Key
NEXT_PUBLIC_PI_API_KEY=1bak6gsn4dcir2z5lmrvnyuug29nni

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Reemplaza:
   - `NEXT_PUBLIC_SUPABASE_URL` con tu **Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` con tu **anon public key**

4. Guarda el archivo

### Paso 2.2: Probar localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y verifica que:
- ✅ Los webtoons se cargan correctamente
- ✅ Puedes crear nuevos webtoons
- ✅ No hay errores en la consola del navegador

---

## 3. Desplegar en Vercel

### Paso 3.1: Preparar el repositorio de GitHub

1. Asegúrate de que tu proyecto esté en GitHub
2. Si aún no lo has hecho:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

### Paso 3.2: Crear cuenta en Vercel (GRATIS)

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Regístrate con tu cuenta de GitHub (recomendado)
4. **Plan GRATIS incluye:**
   - ✅ Deployments ilimitados
   - ✅ 100 GB de bandwidth/mes
   - ✅ Serverless Functions
   - ✅ SSL automático (HTTPS)
   - ✅ Dominio personalizado

### Paso 3.3: Importar el proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub `inktoons`
3. Vercel detectará automáticamente que es un proyecto Next.js
4. **NO hagas clic en Deploy todavía**

### Paso 3.4: Configurar Variables de Entorno en Vercel

1. En la sección **"Environment Variables"**, agrega las siguientes variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_PI_API_KEY` | `1bak6gsn4dcir2z5lmrvnyuug29nni` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Tu Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon public key de Supabase |

2. Para cada variable:
   - Haz clic en **"Add"**
   - Ingresa el **Name** y el **Value**
   - Asegúrate de que esté marcado para **Production**, **Preview**, y **Development**

### Paso 3.5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye y despliega tu aplicación
3. Una vez completado, verás: 🎉 **"Congratulations!"**
4. Haz clic en **"Visit"** para ver tu aplicación en vivo

### Paso 3.6: Obtener la URL de Vercel

1. Copia la URL de tu aplicación (ej: `https://inktoons.vercel.app`)
2. Esta es la URL que usarás en el Pi Dashboard

---

## 4. Verificar el Deployment

### Checklist de Verificación

- [ ] La aplicación carga correctamente en la URL de Vercel
- [ ] Los webtoons se muestran en la página principal
- [ ] Puedes navegar entre páginas sin errores
- [ ] Las imágenes se cargan correctamente
- [ ] No hay errores en la consola del navegador (F12)
- [ ] El wallet funciona correctamente
- [ ] La integración con Pi Network funciona

### Configurar Pi Network App

1. Ve a [https://developers.minepi.com](https://developers.minepi.com)
2. Selecciona tu aplicación
3. En **"App Hosting"**, pega tu URL de Vercel: `https://inktoons.vercel.app`
4. Guarda los cambios

### ⚠️ IMPORTANTE: Production vs Preview

**Los pagos de Pi Network SOLO funcionan en Production Deployment**, NO en Preview Deployments.

**¿Por qué?**
- **Production**: URL estática (`inktoons.vercel.app`) que puedes registrar en Pi Developer Portal
- **Preview**: URL dinámica (`inktoons-git-rama.vercel.app`) que cambia con cada commit

**✅ Usa Production para:**
- Probar pagos reales de Pi Network
- Registrar en Pi Developer Portal
- Testing con Pi Browser

**❌ NO uses Preview para:**
- Pagos de Pi (no funcionará)
- Registro en Pi Portal

📖 **Para más detalles**, consulta: `PI_NETWORK_VERCEL_SETUP.md`

---

## 🎯 Resumen de Costos

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| **Supabase** | Free | $0/mes | 500MB DB + 1GB Storage |
| **Vercel** | Hobby | $0/mes | 100GB bandwidth |
| **TOTAL** | | **$0/mes** | Perfecto para MVP/Testnet |

---

## 📊 Cuándo Actualizar a Planes Pagos

### Supabase Pro ($25/mes)
Actualiza cuando:
- Superes 500 MB de base de datos
- Superes 1 GB de almacenamiento de imágenes
- Necesites más de 50,000 usuarios activos/mes

### Vercel Pro ($20/mes)
Actualiza cuando:
- Superes 100 GB de bandwidth/mes
- Necesites analytics avanzados
- Quieras soporte prioritario

---

## 🆘 Solución de Problemas

### Error: "Invalid Supabase URL"
- Verifica que hayas copiado correctamente el `NEXT_PUBLIC_SUPABASE_URL`
- Asegúrate de que incluya `https://`

### Error: "Invalid API Key"
- Verifica que hayas copiado la **anon public key** completa
- No uses la **service_role key** (es privada)

### Las imágenes no se cargan
- Verifica que el bucket `webtoon-images` sea **público**
- Verifica que las políticas de Storage estén configuradas correctamente

### Error 500 en Vercel
- Revisa los logs en Vercel Dashboard → Functions
- Verifica que las variables de entorno estén configuradas en Vercel

---

## 🎉 ¡Listo!

Tu aplicación Inktoons ahora está:
- ✅ Desplegada en Vercel (GRATIS)
- ✅ Usando Supabase para base de datos (GRATIS)
- ✅ Usando Supabase Storage para imágenes (GRATIS)
- ✅ Lista para el Testnet de Pi Network

**Costo total: $0/mes** 🚀
