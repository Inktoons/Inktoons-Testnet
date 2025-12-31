# Plan de Mejora: Login y Pagos con Huella (Testnet)

He analizado la documentación oficial y el repositorio de Mainnet para identificar por qué el sistema de huella no funciona correctamente en la versión de Testnet.

## 🔍 Diagnóstico

1.  **Modo Sandbox**: El SDK de Pi usa `sandbox: true` por defecto en Testnet. Esto activa el "Sandbox Wallet" (web-based) que solicita la **Frase Semilla**. Para usar la **Huella (Biometría)**, el SDK debe comunicarse con la capa nativa del Pi Browser, lo cual requiere `sandbox: false`.
2.  **Scopes de Autenticación**: Falta el scope `wallet_address` en la autenticación, lo cual ayuda a la integración con la billetera nativa.
3.  **Callbacks Bloqueantes**: Los callbacks de pago deben ser asíncronos (`async/await`) para asegurar que la UI no se congele mientras el servidor procesa la aprobación.

## 🛠️ Cambios Realizados

1.  **PiNetworkProvider.tsx**:
    *   Se cambió `sandbox: true` fijo por una detección dinámica via `process.env.NEXT_PUBLIC_PI_SANDBOX`.
    *   Se agregó el scope `wallet_address` a `Pi.authenticate`.
    *   Se refactorizaron `onReadyForServerApproval` y `onReadyForServerCompletion` para usar `async/await`.
    *   Se mejoró la limpieza de efectos (clearTimeout) para evitar fugas de memoria.

2.  **Seguridad**: 
    *   Al usar `sandbox: false` cuando estamos en el Pi Browser, el sistema invocará la billetera nativa. Si el usuario tiene activada la huella en su Pi Wallet, se le pedirá la huella directamente en lugar de la frase semilla.
    *   **IMPORTANTE**: Nunca manejamos la frase semilla en el código. El SDK se encarga de todo.

## 🚀 Pasos Siguientes (Configuración en Pi Portal)

Para que la huella funcione en Testnet sin `sandbox: true`, debes seguir estos pasos:

1.  **Pi Developer Portal**:
    *   Ve a tu aplicación de Testnet.
    *   En la configuración de **Network**, asegúrate de que esté seleccionado **"Pi Testnet"**.
    *   En **App Hosting URL**, pon la URL exacta donde estás probando (ej: `https://inktoontest.vercel.app`).
    *   En **Allowed Domains**, asegúrate de tener el dominio principal y subdominios de Vercel.

2.  **Variables de Entorno (Vercel)**:
    *   Configura `NEXT_PUBLIC_PI_SANDBOX` como `false` en Vercel para que use el modo nativo.
    *   Asegúrate de que `PI_API_KEY` sea la de Testnet (empieza por `S...`).

3.  **Pi Wallet**:
    *   Asegúrate de que en los ajustes de tu **Pi Wallet** (dentro de la app de Pi) tengas activado el **"Desbloqueo Biométrico"** para la red Testnet.

---
**Nota**: Si el login falla con `sandbox: false`, es un indicador 100% seguro de que la URL de la app no coincide exactamente con la registrada en el Pi Developer Portal o que el portal no está configurado en modo Testnet para esa app.
