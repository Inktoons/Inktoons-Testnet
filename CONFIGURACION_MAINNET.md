# 🚀 Configuración Final: Mainnet con Nueva API Key

## ✅ **Cambios Completados**

```bash
✅ Código cambiado a sandbox: false (Mainnet)
✅ Commit: "Cambiar a Mainnet con nueva API Key de producción"
✅ Push a Production
⏳ Vercel desplegando... (2-3 minutos)
```

---

## 🔑 Nueva API Key y Billetera de Mainnet

```
API Key: gw46unoklkzp0ep9noq5bvc1ujgph4dmocgklxroabpkxcyvs4gf7exvrs9d0uzk
Wallet:  GBGUEWWORJKNDRIH5LY7BGU4CCTI2GSCNWZBJKNETQTVNRFA343MKPO2
```

⚠️ **IMPORTANTE**: Esta es una API Key de **PRODUCCIÓN** (Mainnet). Los pagos serán con **Pi real** con valor monetario.

---

## 📋 **Paso 2: Configurar Nueva API Key en Vercel**

### **1. Ve a Vercel Dashboard**

1. Abre [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **Inktoons**
3. Click en **Settings** (menú superior)
4. Click en **Environment Variables** (menú lateral)

---

### **2. Actualizar `PI_API_KEY`**

Esta variable es para el **backend** (solo Production):

1. Busca la variable `PI_API_KEY`
2. Click en el icono **⋯** (tres puntos) al lado → **Edit**
3. **Borra** el valor actual (la API Key antigua de Testnet)
4. **Pega** la nueva API Key:
   ```
   gw46unoklkzp0ep9noq5bvc1ujgph4dmocgklxroabpkxcyvs4gf7exvrs9d0uzk
   ```
5. **Environments**: ✅ Marca SOLO **Production** (desmarca Preview y Development)
6. Click en **Save**

---

### **3. Actualizar `NEXT_PUBLIC_PI_API_KEY`**

Esta variable es para el **frontend** (todas las environments):

1. Busca la variable `NEXT_PUBLIC_PI_API_KEY`
2. Click en el icono **⋯** (tres puntos) → **Edit**
3. **Borra** el valor actual
4. **Pega** la misma API Key:
   ```
   gw46unoklkzp0ep9noq5bvc1ujgph4dmocgklxroabpkxcyvs4gf7exvrs9d0uzk
   ```
5. **Environments**: ✅ Marca LAS 3 casillas:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click en **Save**

---

### **4. Verificar Variables de Supabase**

Asegúrate de que también estén configuradas (no las cambies, solo verifica):

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### **5. Redeploy OBLIGATORIO**

⚠️ **CRÍTICO**: Debes hacer un Redeploy para aplicar las nuevas variables:

1. Ve a la pestaña **Deployments**
2. Busca el deployment más reciente (debería estar en progreso o ya completado)
3. Una vez que termine:
   - Click en el menú **⋯** (tres puntos)
   - Click en **Redeploy**
   - Confirma
4. **Espera 2-3 minutos**

---

## 🌐 **Paso 3: Configurar en Pi Developer Portal**

### **1. Registrar URL de Vercel**

En tu nueva app de **Mainnet** en Pi Developer Portal:

1. Ve a [https://developers.minepi.com](https://developers.minepi.com)
2. Selecciona tu app **Inktoons (Mainnet)** (la nueva que creaste)
3. Busca el campo **"App URL"** o **"Production URL"**
4. Pega: `https://inktoons.vercel.app`
5. **Guarda los cambios**

---

### **2. Configurar Allowed Domains**

1. Busca la sección **"Allowed Domains"** o **"CORS Domains"**
2. Agrega:
   ```
   https://inktoons.vercel.app
   https://*.vercel.app
   ```
3. **Guarda los cambios**

---

### **3. Esperar Propagación**

⏱️ Los cambios en Pi Developer Portal pueden tardar hasta **5 minutos** en propagarse. Ten paciencia.

---

## 🧪 **Paso 4: Probar los Pagos en Mainnet**

### **1. Abrir en Pi Browser**

1. Abre **Pi Browser** en tu móvil
2. Ve a: `https://inktoons.vercel.app`
3. Inicia sesión con tu cuenta de Pi Network

---

### **2. Verificar Modo Mainnet**

Verifica que estés en **Mainnet**:
- La wallet debería mostrar tu **Pi real** (no Pi de prueba)
- Deberías ver tu balance real de Pi

---

### **3. Hacer una Compra de Prueba**

⚠️ **CUIDADO**: Los pagos ahora son **REALES** con Pi de valor monetario.

**Recomendación**: Prueba con el paquete más pequeño primero:

1. Ve a la sección **Wallet**
2. Scroll hasta **"Recargar Inks"**
3. Click en el paquete de **50 Inks** (aproximadamente 0.02-0.05 Pi)
4. Se abrirá la wallet de Pi
5. **Revisa el monto** antes de confirmar
6. Confirma el pago
7. Espera la confirmación

---

### **4. Logs Esperados (Éxito)**

Si todo funciona correctamente, en la consola del navegador verás:

```
[Pi Payment] Iniciando pago de 0.05 Pi para: Compra de Puñado de Tinta (50 Inks)
[Pi Payment] Aprobando en servidor: pi_payment_xxxxx
[Pi Payment] Aprobado por el servidor: {success: true}
[Pi Payment] Completando en servidor: pi_payment_xxxxx, txid: 0x123...
[Pi Payment] Completado por el servidor: {success: true}
[Pi Payment] Pago creado exitosamente
```

Y deberías recibir una alerta: "Has recibido 50 Inks"

---

## ⚠️ **ADVERTENCIAS IMPORTANTES - MAINNET**

### **🔴 Esto es PRODUCCIÓN REAL**

- ✅ Los pagos usan **Pi real** con valor monetario
- ✅ Las transacciones son **irreversibles**
- ✅ Los usuarios gastarán **Pi real** de sus wallets
- ✅ No hay "modo de prueba" ni refunds automáticos

### **💰 Pricing Correcto**

Verifica que tus precios sean correctos:

**Configuración actual en tu app:**
- 1 Ink = **$0.02 USD**
- 50 Inks = **$1.00 USD** → **~0.05 Pi** (dependiendo del precio actual de Pi)

**¿Están bien estos precios?** Si no, deberías ajustarlos antes de seguir.

### **📊 Monitorear Transacciones**

Puedes ver todas las transacciones en:
- Pi Developer Portal → Tu App → **Payments** o **Transactions**

---

## ✅ **Checklist Final**

Marca cada paso cuando lo completes:

- [ ] Variables actualizadas en Vercel:
  - [ ] `PI_API_KEY` (Tu Pi API Key, mismo valor, solo Production)
  - [ ] `PI_WALLET_ADDRESS` (GBGUEWWORJKNDRIH5LY7BGU4CCTI2GSCNWZBJKNETQTVNRFA343MKPO2, solo Production)
  - [ ] `NEXT_PUBLIC_PI_API_KEY` (Tu Pi API Key, las 3 environments)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (Tu URL de Supabase, las 3 environments)
- [ ] Redeploy realizado
- [ ] Esperado 2-3 minutos del redeploy
- [ ] URL registrada en Pi Developer Portal (Mainnet app)
- [ ] Allowed Domains configurados
- [ ] Esperado 5 minutos para propagación
- [ ] Probado en Pi Browser
- [ ] Pago de prueba exitoso
- [ ] Inks agregados correctamente

---

## 🐛 **Si Algo Falla**

### **Error: "Payment Expired"**

**Causa**: Las variables no se aplicaron correctamente.

**Solución**:
1. Verifica que hiciste el **Redeploy** después de actualizar las variables
2. Espera 2-3 minutos completos
3. Prueba de nuevo

---

### **Error: "401 Unauthorized"**

**Causa**: API Key incorrecta o no actualizada.

**Solución**:
1. Verifica en Vercel que `PI_API_KEY` tenga el valor:
   ```
   gw46unoklkzp0ep9noq5bvc1ujgph4dmocgklxroabpkxcyvs4gf7exvrs9d0uzk
   ```
2. Haz un Redeploy
3. Espera y prueba de nuevo

---

### **Error: "CORS blocked"**

**Causa**: URL no registrada en Pi Portal.

**Solución**:
1. Ve a Pi Developer Portal → Mainnet App
2. Verifica que `https://inktoons.vercel.app` esté en:
   - App URL
   - Allowed Domains
3. Espera 5 minutos
4. Prueba de nuevo

---

### **Se abre wallet de Testnet en lugar de Mainnet**

**Causa**: El código sigue en modo sandbox.

**Solución**:
1. Verifica que el último deployment incluya el cambio a `sandbox: false`
2. En Vercel → Deployments → Ver el código deployado
3. Si no está actualizado, haz otro push o Redeploy

---

## 🎉 **¡Éxito!**

Una vez que veas:
- ✅ Pago aprobado y completado
- ✅ Inks agregados a tu balance
- ✅ Sin errores en la consola

**¡Tu sistema de pagos con Pi Network está 100% funcional en Mainnet!** 🚀💰

---

## 📞 **Soporte**

Si después de seguir TODOS estos pasos sigue fallando:

1. **Copia los logs** de Vercel Functions (`/api/pi/approve`)
2. **Copia los logs** de la consola del navegador
3. **Verifica** en Pi Developer Portal que veas la transacción (aunque haya fallado)
4. **Contacta** a soporte de Pi: [developers@minepi.com](mailto:developers@minepi.com)

---

**Última actualización**: 2025-12-29  
**Modo**: Mainnet (Producción)  
**API Key**: ✅ Configurada (gw46uno...)
