import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { paymentId, txid } = await request.json();
        const apiKey = process.env.PI_API_KEY?.trim() || process.env.NEXT_PUBLIC_PI_API_KEY?.trim();

        if (!apiKey) {
            console.error("PI_API_KEY and NEXT_PUBLIC_PI_API_KEY are missing");
            return NextResponse.json({ error: "Server configuration error: Missing API Key on Vercel" }, { status: 500 });
        }

        console.log("Complete request for paymentId:", paymentId, "txid:", txid);

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
            console.error("Pi API Complete Error:", errorText);

            // Si el error es que ya está completado, lo tratamos como éxito para el usuario
            if (errorText.includes("already_completed")) {
                console.log("Payment was already completed, treating as success.");
                return NextResponse.json({ success: true, message: "Already completed" });
            }

            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log("Pi API Complete Success:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Internal Server Error (Complete):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
