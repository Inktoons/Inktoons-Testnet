import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { payment } = await request.json();
        const apiKey = (process.env.PI_API_KEY || process.env.NEXT_PUBLIC_PI_API_KEY || "").trim();

        console.log(`[Pi API] Procesando pago incompleto: ${payment?.identifier}`);

        if (!apiKey) {
            return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });
        }

        if (!payment || !payment.identifier) {
            return NextResponse.json({ error: "Datos de pago inválidos" }, { status: 400 });
        }

        const paymentId = payment.identifier;
        const txid = payment.transaction?.txid;
        const txURL = payment.transaction?._link;

        // Si no hay txid, intentamos verificar la transacción en la blockchain si tenemos el link
        if (!txid && txURL) {
            console.log(`[Pi API] Verificando transacción en Horizon: ${txURL}`);
            try {
                const horizonResponse = await fetch(txURL);
                const horizonData = await horizonResponse.json();

                // Verificar que el memo coincida con el paymentId
                if (horizonData.memo !== paymentId) {
                    console.error(`[Pi API] Payment ID no coincide en la blockchain. Esperado: ${paymentId}, Recibido: ${horizonData.memo}`);
                    // No completamos si no coincide
                    return NextResponse.json({ message: "Payment ID mismatch on blockchain" }, { status: 400 });
                }

                // Si coincide, usamos el hash de la transacción como txid si no venía en el objeto payment
                // Nota: Horizon devuelve el hash en 'hash' o 'id'
                const derivedTxid = horizonData.hash || horizonData.id;

                if (derivedTxid) {
                    console.log(`[Pi API] Transacción verificada en blockchain. TXID derivado: ${derivedTxid}`);
                    // Ahora completamos el pago
                    return await completePayment(paymentId, derivedTxid, apiKey);
                }
            } catch (err) {
                console.error("[Pi API] Error al verificar en Horizon:", err);
            }
        } else if (txid) {
            // Si ya tenemos txid, completamos directamente
            return await completePayment(paymentId, txid, apiKey);
        }

        // Si llegamos aquí, no pudimos completar el pago (no hay txid ni se pudo verificar)
        console.log(`[Pi API] No se pudo completar el pago ${paymentId} (sin TXID válido)`);
        return NextResponse.json({ message: "Pago incompleto ignorado (sin TXID válido)" });

    } catch (error: any) {
        console.error("[Pi API] Error en /api/pi/incomplete:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function completePayment(paymentId: string, txid: string, apiKey: string) {
    console.log(`[Pi API] Completando pago ${paymentId} en servidores de Pi...`);

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
            "Authorization": `Key ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Pi API] Error al completar (Pi Server): ${errorText}`);
        return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ message: "Pago completado y recuperado exitosamente", data });
}
