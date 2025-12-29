# 🎯 Configuración Rápida de Supabase (5 minutos)

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Regístrate con GitHub
3. Crea un nuevo proyecto:
   - Name: `inktoons`
   - Password: (genera una segura)
   - Region: `South America (São Paulo)` o la más cercana
   - Plan: **FREE**

## Paso 2: Configurar Base de Datos

1. Ve a **SQL Editor**
2. Copia el contenido de `supabase-schema.sql`
3. Pégalo y ejecuta (Run)

## Paso 3: Crear Bucket de Imágenes

1. Ve a **Storage**
2. Crea bucket: `webtoon-images`
3. Marca como **PUBLIC**
4. En Policies, agrega:

```sql
-- Permitir subir imágenes
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'webtoon-images');

-- Permitir ver imágenes
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'webtoon-images');
```

## Paso 4: Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (muy largo)

## Paso 5: Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_PI_API_KEY=1bak6gsn4dcir2z5lmrvnyuug29nni
NEXT_PUBLIC_SUPABASE_URL=TU_PROJECT_URL_AQUI
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
```

## Paso 6: Probar Localmente

```bash
npm run dev
```

Abre http://localhost:3000 y verifica que funcione.

## Paso 7: Desplegar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Agrega las mismas variables de entorno
4. Deploy!

---

## ✅ Checklist

- [ ] Proyecto creado en Supabase
- [ ] SQL schema ejecutado
- [ ] Bucket `webtoon-images` creado y público
- [ ] Políticas de Storage configuradas
- [ ] Variables de entorno en `.env.local`
- [ ] Aplicación funciona localmente
- [ ] Desplegado en Vercel
- [ ] Variables de entorno en Vercel
- [ ] URL de Vercel en Pi Dashboard

---

## 🆘 Problemas Comunes

**Error: "Invalid Supabase URL"**
→ Verifica que copiaste el URL completo con `https://`

**Las imágenes no se ven**
→ Asegúrate de que el bucket sea **PUBLIC**

**Error 500 en Vercel**
→ Verifica que las variables de entorno estén en Vercel

---

**¿Necesitas ayuda?** Consulta [SETUP_GUIDE.md](./SETUP_GUIDE.md) para instrucciones detalladas.
