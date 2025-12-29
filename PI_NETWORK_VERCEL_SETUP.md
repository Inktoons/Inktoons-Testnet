# 🥧 Guía Completa: Pi Network en Vercel Production

## ✅ **Respuesta Corta**

**SÍ**, Pi Network **FUNCIONA PERFECTAMENTE** en Vercel Production.  
**NO**, **NO FUNCIONA** en Preview Deployments (las URLs cambian constantemente).

---

## 🎯 **Por qué DEBES usar Production (no Preview)**

| Aspecto | Production | Preview |
|---------|-----------|---------|
| **URL** | Estática: `inktoons.vercel.app` | Dinámica: `inktoons-git-rama-usuario.vercel.app` |
| **Pi Network** | ✅ Compatible | ❌ Incompatible |
| **Registro en Pi Portal** | ✅ Posible | ❌ Imposible (URL cambia) |
| **Verificación CORS** | ✅ Funciona | ❌ Falla |
| **Pagos Pi** | ✅ Funcionan | ❌ No funcionan |

---

## 🔧 **Pasos para Configurar Pi Network en Vercel Production**

### **Paso 1: Registrar tu App en Pi Developer Portal**

1. Ve a: [https://developers.minepi.com](https://developers.minepi.com)
2. Inicia sesión con tu cuenta de Pi Network
3. Crea una nueva App o selecciona tu app existente

### **Paso 2: Configurar la URL de Production en Pi Portal**

Una vez desplegado en Vercel, obtendrás una URL como:
```
https://inktoons.vercel.app
```

En el Pi Developer Portal, configura:

1. **App Hosting URL**: `https://inktoons.vercel.app`
2. **Sandbox URL** (para testing): `https://inktoons.vercel.app` (la misma)
3. **Allowed Domains**: Agrega ambas URLs:
   - `https://inktoons.vercel.app`
   - `https://www.inktoons.vercel.app` (si usas www)

### **Paso 3: Obtener tu Pi API Key**

En el Pi Developer Portal:
1. Ve a la sección **"Keys"** o **"API Keys"**
2. Copia tu **Pi API Key** (algo como: `1bak6gsn4dcir2z5lmrvnyuug29nni`)
3. **¡Guárdala! La necesitarás en el siguiente paso**

### **Paso 4: Configurar Variables de Entorno en Vercel**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Abre tu proyecto **Inktoons**
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXT_PUBLIC_PI_API_KEY` | Tu Pi API Key | ✅ Production, ✅ Preview, ✅ Development |
| `PI_API_KEY` | Tu Pi API Key | ✅ Production |
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase | ✅ Production, ✅ Preview, ✅ Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key de Supabase | ✅ Production, ✅ Preview, ✅ Development |

**⚠️ IMPORTANTE**: 
- Marca **TODAS** las casillas (Production, Preview, Development) para cada variable
- Haz clic en **"Save"** después de agregar cada variable

### **Paso 5: Redeploy en Production**

1. Ve a la pestaña **Deployments** en tu proyecto de Vercel
2. Encuentra el deployment más reciente
3. Haz clic en el menú `⋯` (tres puntos)
4. Selecciona **"Redeploy"**
5. Asegúrate de marcar **"Use existing Build Cache"** (opcional, pero más rápido)
6. Haz clic en **"Redeploy"**

**¿Por qué?** Vercel necesita reconstruir la aplicación con las nuevas variables de entorno.

---

## 🧪 **Probar los Pagos de Pi Network**

### **Opción 1: Pi Browser en Móvil (Recomendado)**

1. Abre **Pi Browser** en tu teléfono
2. Navega a: `https://inktoons.vercel.app`
3. Inicia sesión con Pi Network
4. Ve a la sección **Wallet** o **Recargar Inks**
5. Intenta comprar Inks con Pi
6. El SDK debería abrir la wallet de Pi para confirmar el pago

### **Opción 2: Desktop con Ngrok (Desarrollo Local)**

Si quieres probar localmente antes de deployar:

```bash
# Terminal 1: Inicia tu app local
npm run dev

# Terminal 2: Inicia ngrok
ngrok http 3000
```

Luego usa la URL de ngrok en Pi Developer Portal temporalmente.

---

## 🐛 **Solución de Problemas Comunes**

### **Error: "SDK de Pi no disponible"**

**Causa**: No estás usando Pi Browser  
**Solución**: Abre tu app en Pi Browser (móvil) o usa ngrok para desarrollo local

### **Error: "Missing API Key"**

**Causa**: Las variables de entorno no están configuradas en Vercel  
**Solución**:
1. Verifica que `NEXT_PUBLIC_PI_API_KEY` esté en Vercel Settings
2. Haz un **Redeploy** después de agregar las variables
3. Verifica que la variable tenga el mismo valor que en tu `.env.local`

### **Error: "CORS policy blocked"**

**Causa**: La URL de tu app no está registrada en Pi Developer Portal  
**Solución**:
1. Ve a Pi Developer Portal
2. Agrega `https://inktoons.vercel.app` en **Allowed Domains**
3. Guarda los cambios
4. Espera 5 minutos para que se propaguen los cambios

### **Error: "Invalid payment"**

**Causa**: El flujo de pago no está completándose correctamente  
**Solución**:
1. Abre la consola del navegador (F12)
2. Busca logs que empiecen con `[Pi Payment]`
3. Verifica que ambas rutas API funcionan:
   - `/api/pi/approve`
   - `/api/pi/complete`
4. Revisa los logs de Vercel Functions para ver errores del backend

### **Los pagos se quedan "cargando" infinitamente**

**Causa**: Las rutas API no están respondiendo correctamente  
**Solución**:
1. Ve a Vercel Dashboard → Functions
2. Revisa los logs de `/api/pi/approve` y `/api/pi/complete`
3. Verifica que `PI_API_KEY` esté configurada (sin `NEXT_PUBLIC_`)
4. Asegúrate de que la API de Pi Network esté respondiendo

---

## 📊 **Verificar que Todo Funciona**

### **Checklist de Verificación**

- [ ] App desplegada en Vercel Production
- [ ] URL registrada en Pi Developer Portal
- [ ] `NEXT_PUBLIC_PI_API_KEY` configurada en Vercel
- [ ] `PI_API_KEY` configurada en Vercel
- [ ] Redeploy realizado después de agregar variables
- [ ] App accesible desde Pi Browser
- [ ] Login con Pi funciona correctamente
- [ ] Botón de compra con Pi visible
- [ ] Al hacer clic, se abre la wallet de Pi
- [ ] Después de aprobar, los Inks se agregan a la cuenta

### **Logs Esperados en Consola (F12)**

```
[Pi Payment] Iniciando pago de 0.5 Pi para: Compra de 50 Inks
[Pi Payment] Aprobando en servidor: pi_payment_xxxxx
[Pi Payment] Aprobado por el servidor: {success: true}
[Pi Payment] Completando en servidor: pi_payment_xxxxx, txid: 0x123...
[Pi Payment] Completado por el servidor: {success: true}
[Pi Payment] Pago creado exitosamente: {...}
```

---

## 🚀 **Mejores Prácticas**

### **1. Usar Variables de Entorno Correctas**

- **Frontend (cliente)**: `NEXT_PUBLIC_PI_API_KEY`
- **Backend (servidor)**: `PI_API_KEY`

### **2. Sandbox vs Production**

En `PiNetworkProvider.tsx` línea 65:
```tsx
await window.Pi.init({ version: "2.0", sandbox: false });
```

- **Testnet**: `sandbox: true`
- **Mainnet**: `sandbox: false`

### **3. Monitorear Pagos**

En Pi Developer Portal puedes ver:
- Todos los pagos realizados
- Estado de cada transacción
- Logs de errores
- Analytics de uso

---

## 💡 **Preguntas Frecuentes**

### **¿Puedo usar un dominio personalizado?**

¡SÍ! De hecho es recomendado para producción:

1. Compra un dominio (ej: `inktoons.com`)
2. Agrega el dominio en Vercel (Settings → Domains)
3. Actualiza la URL en Pi Developer Portal a `https://inktoons.com`
4. Los pagos funcionarán perfectamente

### **¿Necesito un plan pago de Vercel?**

**NO**. El plan gratuito de Vercel es suficiente para:
- Deployments ilimitados
- 100GB de bandwidth/mes
- Serverless Functions (las APIs de Pi)

### **¿Los pagos funcionan en Testnet?**

**SÍ**, pero debes:
1. Cambiar `sandbox: true` en el código
2. Usar Pi Testnet en Pi Browser
3. Las transacciones serán en Pi de prueba (no real)

### **¿Cuánto tiempo tarda en activarse?**

Después de configurar todo:
- **Vercel Redeploy**: 2-3 minutos
- **Propagación de variables**: Inmediato
- **Pi Portal cambios**: 5 minutos
- **Primera prueba**: ¡Inmediata!

---

## 🎉 **Conclusión**

**Vercel Production es PERFECTO para Pi Network**. La combinación de:
- URL estática
- Serverless Functions gratuitas
- SSL automático (HTTPS requerido por Pi)
- Deploy automático con git push

Hace que sea la mejor opción para alojar tu app de Pi Network.

**NO uses Preview Deployments** para pagos reales de Pi, solo para probar la UI/UX sin funcionalidad de pagos.

---

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs de Vercel Functions
2. Verifica la consola del navegador (F12)
3. Consulta la documentación oficial: [Pi SDK Docs](https://github.com/pi-apps/pi-platform-docs)
4. Contacta al soporte de Pi Network: [developers@minepi.com](mailto:developers@minepi.com)

---

**¡Tu app está lista para recibir pagos en Pi Network!** 🥧💰
