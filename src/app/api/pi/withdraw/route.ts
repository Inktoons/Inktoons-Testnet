import { NextRequest, NextResponse } from 'next/server';
import { Horizon, Keypair, TransactionBuilder, Operation, Asset } from 'stellar-sdk';
import { SupabaseService } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabase';

// CONSTANTS FOR PI TESTNET
const PI_TESTNET_HORIZON = "https://api.testnet.minepi.com";
const PI_TESTNET_PASSPHRASE = "Pi Testnet";

// WALLET CONFIG
const WALLET_SECRET = process.env.PI_WALLET_SECRET;

export async function POST(req: NextRequest) {
    try {
        if (!WALLET_SECRET) {
            console.error("[Withdraw API] Critical: PI_WALLET_SECRET not set in environment variables");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const body = await req.json();
        const { username } = body;

        console.log(`[Withdraw API] Processing withdrawal for ${username}`);

        if (!username) {
            return NextResponse.json({ error: "Missing username" }, { status: 400 });
        }

        // 1. Verify User Balance in Supabase
        const { data: userData, error: userError } = await supabase
            .from('user_data')
            .select('creator_balance, wallet_address')
            .eq('username', username)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const grossBalance = userData.creator_balance || 0;
        const userWallet = userData.wallet_address;

        if (grossBalance < 10) { // Minimum threshold 10 Pi as per UI
            return NextResponse.json({ error: "Insufficient balance (Min 10 Pi)" }, { status: 400 });
        }

        if (!userWallet) {
            return NextResponse.json({ error: "User wallet not configured" }, { status: 400 });
        }

        // Apply 15% Platform Fee
        const amountToSend = grossBalance * 0.85;
        console.log(`[Withdraw API] Gross: ${grossBalance}, Net to Send: ${amountToSend}`);

        // 2. Initialize Stellar Server for Pi Testnet
        const server = new Horizon.Server(PI_TESTNET_HORIZON);

        // 3. Load App Wallet Keys
        const sourceKeys = Keypair.fromSecret(WALLET_SECRET);
        console.log(`[Withdraw API] Sender Wallet: ${sourceKeys.publicKey()}`);

        // 4. Load Sender Account Sequence
        const sourceAccount = await server.loadAccount(sourceKeys.publicKey());
        console.log(`[Withdraw API] Sender Sequence: ${sourceAccount.sequence}`);

        // 5. check recipient account exists?
        // Stellar requires the destination account to exist to receive payments (unless creating it).
        // Pi wallets are usually created by the App. We assume it exists.
        // If it doesn't exist, we might need 'createAccount' operation, but for Pi user wallets they should exist.
        // We can try to load it to be sure.
        try {
            await server.loadAccount(userWallet);
        } catch (e) {
            console.error("[Withdraw API] Recipient wallet not found or inactive.");
            return NextResponse.json({ error: "Recipient wallet not active on chain" }, { status: 400 });
        }

        // 6. Build Transaction
        // Note: Pi Network uses the standard Stellar Asset "native" (XLM) as Pi?
        // Actually, on Pi Network, the native asset IS Pi. So we use Asset.native().

        const fee = await server.fetchBaseFee();

        const transaction = new TransactionBuilder(sourceAccount, {
            fee: fee.toString(),
            networkPassphrase: PI_TESTNET_PASSPHRASE
        })
            .addOperation(Operation.payment({
                destination: userWallet,
                asset: Asset.native(),
                amount: amountToSend.toFixed(7) // Stellar allows 7 decimals
            }))
            .setTimeout(30)
            .build();

        // 7. Sign Transaction
        transaction.sign(sourceKeys);

        // 8. Submit Transaction
        console.log("[Withdraw API] Submitting transaction...");
        const result = await server.submitTransaction(transaction);
        console.log("[Withdraw API] Transaction success:", result.hash);

        // 9. Update Database: Deduct Balance & Record Transaction
        // We do this AFTER successful blockchain transaction to avoid fund loss.

        const { error: updateError } = await supabase
            .from('user_data')
            .update({ creator_balance: 0 }) // Assuming full withdrawal as per previous logic, or we should deduct exact 'amount'
            // logic in SupabaseService was "Full Withdrawal". Let's stick to that or match `amount`.
            // The previous logic was "Set balance to 0". Let's assume this API handles the full cleanup.
            // If the requested amount was the full balance (which processWithdrawal sends), we set to 0.
            // But safely, let's calculate new balance.
            .eq('username', username);

        if (updateError) {
            console.error("[Withdraw API] DB Update Error (Critical - Funds Sent!):", updateError);
            // In real app, we need reconciliation. Here we log error.
        }

        // Add transaction record
        // We can reuse the SupabaseService method ideally, but we are in an API route. 
        // We can just query directly to keep it self contained or import the service. 
        // Service is imported.

        await SupabaseService.addCreatorTransaction(username, {
            type: 'WITHDRAWAL',
            origin: 'Inktoons Wallet',
            work: `Retiro Automático (Ref: ${result.hash.substring(0, 8)}...)`,
            amount: amountToSend,
            webtoonId: result.hash,
        });

        return NextResponse.json({
            success: true,
            txHash: result.hash,
            amount: amountToSend
        });

    } catch (error: any) {
        console.error("[Withdraw API] Error:", error);
        // Extract meaningful error from Stellar
        let errorMessage = error.message;
        if (error.response?.data?.extras?.result_codes) {
            errorMessage += ` (Stellar Codes: ${JSON.stringify(error.response.data.extras.result_codes)})`;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
