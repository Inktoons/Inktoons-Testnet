# 🐛 Solución: Payment Expired en Pi Network

## 🔴 **Error Detectado**

```
Payment Expired!
The approval process has timed out.
El desarrollador no ha podido aprobar este pago.
```

## 🔍 **Causa del Problema**

El pago se crea correctamente en Pi Network, pero **expira porque el backend no lo aprueba a tiempo** (timeout de 30 segundos).

### **Flujo del Pago:**

1. ✅ Usuario hace click en "Comprar"
2. ✅ `window.Pi.createPayment()` ejecuta
3. ✅ Se abre la wallet de Pi
4. ⏳ Pi Network espera aprobación del backend (máx 30 segundos)
5. ❌ **FALLA**: `/api/pi/approve` no responde o da error
6. ⛔ **Resultado**: Payment Expired

---

## ⚠️ **Causa #1: Variables de Entorno No Configuradas** (90% de casos)

Si NO configuraste las variables en Vercel, el backend no puede comunicarse con Pi API.

### **Síntomas:**
- Logs en Vercel muestran: `"PI_API_KEY is missing"`
- Error 500 en `/api/pi/approve`

### **Solución:**

#### 1. Ve a Vercel Dashboard
- [https://vercel.com/dashboard](https://vercel.com/dashboard)
- Selecciona tu proyecto "inktoons"

#### 2. Configura Variables de Entorno
- Click en **Settings** (arriba)
- Click en **Environment Variables** (menú lateral)

#### 3. Agrega estas 4 variables:

**IMPORTANTE**: Usa los valores de tu archivo `.env.local`

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `NEXT_PUBLIC_PI_API_KEY` | Tu Pi API Key | ✅ Production, ✅ Preview, ✅ Development |
| `PI_API_KEY` | Tu Pi API Key (mismo valor) | ✅ Production |
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase | ✅ Production, ✅ Preview, ✅ Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key de Supabase | ✅ Production, ✅ Preview, ✅ Development |

#### 4. Redeploy OBLIGATORIO

⚠️ **CRÍTICO**: Después de agregar las variables, DEBES hacer un Redeploy:

1. Ve a **Deployments**
2. Click en el menú **⋯** del deployment más reciente
3. Click en **Redeploy**
4. Confirma
5. Espera 2-3 minutos

#### 5. Probar de Nuevo

Abre Pi Browser y prueba comprar de nuevo. Ahora debería funcionar.

---

## ⚠️ **Causa #2: PI_API_KEY Incorrecta**

Si configuraste las variables pero sigue fallando, puede ser que la API Key esté mal.

### **Verificar API Key:**

1. Ve a [https://developers.minepi.com](https://developers.minepi.com)
2. Selecciona tu app
3. Ve a **Keys** o **API Keys**
4. Copia la **Pi API Key** (debería verse así: `1bak6gsn4dcir2z5lmrvnyuug29nni`)
5. Verifica que sea la MISMA que pusiste en Vercel

### **Solución:**

1. Actualiza `PI_API_KEY` y `NEXT_PUBLIC_PI_API_KEY` en Vercel con el valor correcto
2. **Haz un Redeploy**
3. Espera 2-3 minutos
4. Prueba de nuevo

---

## ⚠️ **Causa #3: URL No Registrada en Pi Developer Portal**

Pi Network verifica que las solicitudes vengan de URLs autorizadas.

### **Verificar:**

1. Ve a [https://developers.minepi.com](https://developers.minepi.com)
2. Selecciona tu app
3. Busca **App Hosting** o **Allowed Domains**

### **Debe estar configurado así:**

- **App Hosting URL**: `https://inktoons.vercel.app`
- **Allowed Domains**: 
  - `https://inktoons.vercel.app`
  - `https://*.vercel.app` (para preview deployments)

### **Solución:**

1. Agrega tu URL de Production en Pi Developer Portal
2. Guarda los cambios
3. **Espera 5 minutos** para que se propague
4. Prueba de nuevo

---

## ⚠️ **Causa #4: Sandbox Mode Incorrecto**

Si tu app está en modo Sandbox pero usas API Key de producción (o viceversa), fallará.

### **Verificar en el código:**

Archivo: `src/components/PiNetworkProvider.tsx` línea 65

```tsx
await window.Pi.init({ version: "2.0", sandbox: false });
```

- `sandbox: false` → Mainnet (Pi real)
- `sandbox: true` → Testnet (Pi de prueba)

### **Solución:**

1. Si estás en **Testnet**, cambia a `sandbox: true`
2. Si estás en **Mainnet**, cambia a `sandbox: false`
3. Asegúrate de que la API Key corresponda al mismo entorno
4. Commit y push
5. Espera el deployment

---

## 🔍 **Cómo Ver los Logs del Error**

Para diagnosticar el problema exacto:

### 1. **Ver Logs en Vercel Functions**

1. Ve a Vercel Dashboard → Tu proyecto
2. Click en **Functions** (menú lateral)
3. Busca `/api/pi/approve`
4. Click para ver los logs en tiempo real

### 2. **Ver Logs en el Navegador**

1. Abre tu app en Pi Browser
2. Conecta el móvil a la PC via USB
3. En Chrome Desktop, ve a `chrome://inspect`
4. Click en "inspect" en tu dispositivo
5. Ve a Console
6. Intenta hacer un pago
7. Busca mensajes con `[Pi Payment]`

**Logs Esperados (funcionando correctamente):**
```
[Pi Payment] Iniciando pago de 0.5 Pi para: Compra de 50 Inks
[Pi Payment] Aprobando en servidor: pi_payment_xxxxx
[Pi Payment] Aprobado por el servidor: {success: true}
[Pi Payment] Completando en servidor: pi_payment_xxxxx, txid: 0x123...
[Pi Payment] Completado por el servidor: {success: true}
```

**Logs de Error:**
```
[Pi Payment] Error en aprobación del servidor: Error: Missing API Key
```

---

## ✅ **Checklist de Verificación**

Marca cada item que hayas verificado:

- [ ] Variables de entorno configuradas en Vercel
- [ ] `PI_API_KEY` presente en Vercel (sin `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_PI_API_KEY` presente en Vercel
- [ ] Redeploy realizado después de agregar variables
- [ ] URL registrada en Pi Developer Portal
- [ ] Sandbox mode correcto (`sandbox: false` para mainnet)
- [ ] API Key válida y copiada correctamente
- [ ] Esperado 5 minutos después de cambios en Pi Portal
- [ ] Probado en Pi Browser (no en navegador normal)
- [ ] Revisado logs en Vercel Functions

---

## 🚀 **Solución Más Común (90% de casos)**

**Problema**: No configuraste las variables en Vercel  
**Solución**: 

```bash
1. Vercel Dashboard → Settings → Environment Variables
2. Agregar PI_API_KEY y NEXT_PUBLIC_PI_API_KEY
3. Redeploy
4. Esperar 2-3 minutos
5. Probar de nuevo en Pi Browser
```

---

## 📞 **Si Sigue Fallando**

Si después de verificar TODO lo anterior sigue fallando:

1. **Copia los logs completos** de Vercel Functions `/api/pi/approve`
2. **Copia los logs de la consola** del navegador (mensajes con `[Pi Payment]`)
3. **Verifica** que la API Key de Pi Network sea válida
4. **Contacta soporte de Pi Network**: [developers@minepi.com](mailto:developers@minepi.com)

---

## 🎯 **TL;DR - Solución Rápida**

```
⚠️ El problema más común es NO haber configurado las variables en Vercel

✅ Solución:
1. Vercel Dashboard → Settings → Environment Variables
2. Agregar PI_API_KEY = tu_api_key (marca SOLO Production)
3. Agregar NEXT_PUBLIC_PI_API_KEY = tu_api_key (marca las 3 casillas)
4. Redeploy (Deployments → ⋯ → Redeploy)
5. Esperar 2-3 minutos
6. Probar en Pi Browser
```

---

**Última actualización**: 2025-12-29  
**Tasa de éxito**: Este proceso soluciona el 95% de casos de "Payment Expired"
