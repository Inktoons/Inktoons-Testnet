import { NextResponse } from 'next/server';

// Utility to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export async function GET() {
    // 1. Try CoinGecko (Primary) - 3s timeout
    try {
        const response = await fetchWithTimeout(
            'https://api.coingecko.com/api/v3/simple/price?ids=pi-network-iou&vs_currencies=usd',
            {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                },
                next: { revalidate: 60 }
            },
            3000
        );

        if (response.ok) {
            const data = await response.json();
            const price = data['pi-network-iou']?.usd || data['pi-network']?.usd;
            if (price) return NextResponse.json({ price, source: 'coingecko' });
        }
    } catch (e) {
        // console.warn("CoinGecko failed or timed out");
    }

    // 2. Try CoinPaprika (Backup) - 3s timeout
    try {
        const response = await fetchWithTimeout(
            'https://api.coinpaprika.com/v1/tickers/pi-pi-network',
            { next: { revalidate: 60 } },
            3000
        );

        if (response.ok) {
            const data = await response.json();
            const price = data?.quotes?.USD?.price;
            if (price) return NextResponse.json({ price, source: 'coinpaprika' });
        }
    } catch (e) {
        // console.warn("CoinPaprika failed or timed out");
    }

    // 3. Fallback (Safe default)
    // 522 Errors usually mean Connection Timed Out. 
    // We return a safe default immediately if APIs are slow.
    return NextResponse.json({
        price: 55.00,
        source: 'fallback',
        warning: 'Could not fetch live price, using estimate'
    });
}
