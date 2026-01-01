# Guía Definitiva: Login con Huella en Testnet (Pi Biometrics)

Para lograr un sistema de pagos seguro (SIN pedir semilla) y con autenticación biométrica (Huella/FaceID) en Testnet, es **IMPRESCINDIBLE** entender la diferencia entre entornos.

## 1. El Problema Actual (Diagnóstico)
Has estado probando tu aplicación a través del **Sandbox Wrapper** (`https://sandbox.minepi.com/app/inktoons` o similar en el navegador).
- El **Sandbox Wrapper** está diseñado *solo* para web testing.
- **NO soporta** biometría nativa. Siempre pedirá una semilla o un código.
- Si configuras `sandbox: false` dentro del Wrapper, **fallará** (que es lo que te ocurría), porque el Wrapper espera controlar la sesión.

## 2. La Solución "Golden Standard" (Igual a Mainnet)
Para que funcione la huella, tu aplicación debe correr en modo **Nativo puro** (`sandbox: false`) y ser accedida **Directamente** desde el Pi Browser.

### Pasos para Configurar y Probar (Testnet con Huella)

#### A. Configuración en Vercel (Producción/Testnet)
Asegúrate de que en el panel de Vercel (Settings -> Environment Variables) tengas:
- `NEXT_PUBLIC_PI_SANDBOX` = `false`
- `PI_API_KEY` = (Tu clave API real)
- `NEXT_PUBLIC_PI_API_KEY` = (Tu clave API real)

*Esto habilitará el modo nativo para tu despliegue público.*

#### B. Configuración en Pi Developer Portal
Esta es la parte crítica para que funcione `sandbox: false`.
1. Ve al [Pi Developer Portal](https://develop.minepi.com).
2. Edita tu aplicación Testnet (`Inktoons Testnet` o similar).
3. En **"App URL"** (o "Development URL" si usas el modo development directo), pon TU URL DE VERCEL EXACTA:
   `https://inktoontest.vercel.app`
   *(Asegúrate de que no haya barras extra al final ni errores).*

#### C. CÓMO PROBAR (La forma correcta)
1. Abre la aplicación **Pi Browser** en tu móvil.
2. **NO** uses `sandbox.minepi.com` ni ningún enlace que te lleve al wrapper.
3. En la barra de direcciones del Pi Browser, escribe directamente:
   `https://inktoontest.vercel.app`
   *(O si tienes configurado el esquema `pi://`, usa `pi://inktoons`)*.
4. Al cargar directamante, el SDK detectará que está en el navegador nativo.
5. Al pulsar "Login" o "Pagar", saltará la interfaz nativa del Pi Wallet (Huella/FaceID) en lugar de pedir códigos.

## Resumen Desarrollo Local (`localhost`)
Mientras desarrollas en tu PC:
- Mantén `NEXT_PUBLIC_PI_SANDBOX=true` en tu `.env.local`.
- Esto te permitirá seguir trabajando sin que la app se bloquee.
- **NO podrás probar huella en el PC**. Para probar huella, **despliega a Vercel** y sigue los pasos del punto C.

---
**IMPORTANTE**: El código actual ya es idéntico a la versión de producción que mencionas. El "fallo" no está en el código, sino en intentar forzar el modo Nativo (Huella) dentro del entorno simulado (Wrapper/Sandbox) o sin la configuración de dominio correcta.
