import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { paymentId } = await request.json();
        const apiKey = (process.env.PI_API_KEY || process.env.NEXT_PUBLIC_PI_API_KEY || "").trim();

        if (!apiKey) {
            return NextResponse.json({ error: "Configuración del servidor incompleta (API Key)" }, { status: 500 });
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
            if (errorText.includes("already_approved")) {
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Error interno procesando el pago" }, { status: 500 });
    }
}
