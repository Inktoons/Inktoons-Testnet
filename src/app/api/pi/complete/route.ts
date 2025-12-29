import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { paymentId, txid } = await request.json();
        const apiKey = (process.env.PI_API_KEY || process.env.NEXT_PUBLIC_PI_API_KEY || "").trim();

        console.log(`[Pi API] Intentando completar pago: ${paymentId} con TXID: ${txid}`);

        if (!apiKey) {
            console.error("[Pi API] ERROR: PI_API_KEY no configurada en el servidor.");
            return NextResponse.json({ error: "Configuraci\u00f3n del servidor incompleta (API Key)" }, { status: 500 });
        }

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
            console.error(`[Pi API] Error al completar pago ${paymentId}:`, errorText);

            if (errorText.includes("already_completed")) {
                console.log(`[Pi API] El pago ${paymentId} ya estaba completado.`);
                return NextResponse.json({ success: true, message: "Already completed" });
            }

            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log(`[Pi API] Pago ${paymentId} completado con \u00e9xito`);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[Pi API] Error cr\u00edtico en /api/pi/complete:", error);
        return NextResponse.json({ error: "Error interno: " + (error.message || "Desconocido") }, { status: 500 });
    }
}
