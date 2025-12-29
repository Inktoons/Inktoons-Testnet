import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { paymentId } = await request.json();
        const apiKey = (process.env.PI_API_KEY || process.env.NEXT_PUBLIC_PI_API_KEY || "").trim();

        console.log(`[Pi API] Intentando aprobar pago: ${paymentId}`);

        if (!apiKey) {
            console.error("[Pi API] ERROR: PI_API_KEY no configurada en el servidor.");
            return NextResponse.json({ error: "Configuraci\u00f3n del servidor incompleta (API Key)" }, { status: 500 });
        }

        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Pi API] Error al aprobar pago ${paymentId}:`, errorText);

            if (errorText.includes("already_approved")) {
                console.log(`[Pi API] El pago ${paymentId} ya estaba aprobado previamente.`);
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log(`[Pi API] Pago ${paymentId} aprobado con \u00e9xito`);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[Pi API] Error cr\u00edtico en /api/pi/approve:", error);
        return NextResponse.json({ error: "Error interno procesando el pago: " + (error.message || "Desconocido") }, { status: 500 });
    }
}
