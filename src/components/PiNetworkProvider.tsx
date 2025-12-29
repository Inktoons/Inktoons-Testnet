"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface PiUser {
    uid: string;
    username: string;
    wallet_address?: string;
}

interface PiContextType {
    user: PiUser | null;
    loading: boolean;
    authenticate: () => Promise<void>;
    createPayment: (amount: number, memo: string, metadata: any, onSuccess?: () => void) => Promise<void>;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

declare global {
    interface Window {
        Pi: any;
    }
}

export const PiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<PiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    const authenticate = useCallback(async (isAuto = false) => {
        if (!window.Pi) {
            if (!isAuto) alert("SDK de Pi no detectado. Abre la app en el Pi Browser.");
            return;
        }

        try {
            const auth = await window.Pi.authenticate(["username", "payments", "wallet_address"], (p: any) => {
                console.log("[Pi SDK] 🔄 Callback de pago incompleto:", p);
            });

            setUser(auth.user);
            localStorage.setItem("pi_logged_in", "true");
        } catch (error: any) {
            if (!isAuto && !error.message?.includes("cancelled")) {
                alert("Error de conexión con Pi Network: " + (error.message || "Desconocido"));
            }
            localStorage.removeItem("pi_logged_in");
        }
    }, []);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        const initPi = async () => {
            if (window.Pi && !initialized.current) {
                try {
                    // MODO TESTNET FIJO (Pi de Pruebas)
                    await window.Pi.init({
                        version: "2.0",
                        sandbox: true,
                        onIncompletePaymentFound: (payment: any) => {
                            console.log("[Pi SDK] ⚠️ Pago incompleto encontrado:", payment);
                        }
                    });

                    initialized.current = true;

                    if (localStorage.getItem("pi_logged_in") === "true") {
                        authenticate(true);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("[Pi SDK] Error en init:", error);
                    setLoading(false);
                }
            } else if (!window.Pi) {
                pollInterval = setTimeout(initPi, 300);
            } else {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(initPi, 100);

        return () => {
            clearTimeout(timeoutId);
            if (pollInterval) clearTimeout(pollInterval);
        };
    }, [authenticate]);

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi || !user) {
            alert("Inicia sesión en Pi Browser primero.");
            return;
        }

        try {
            await window.Pi.createPayment({
                amount,
                memo,
                metadata
            }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    const response = await fetch('/api/pi/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId }),
                    });
                    if (!response.ok) throw new Error('Error en aprobación de servidor');
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    const response = await fetch('/api/pi/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId, txid }),
                    });
                    if (!response.ok) throw new Error('Error en completación de servidor');
                    if (onSuccess) onSuccess();
                },
                onCancel: (paymentId: string) => {
                    console.log(`[Pi Payment] Cancelado: ${paymentId}`);
                },
                onError: (error: any) => {
                    console.error('[Pi Payment] Error:', error);
                    alert('Error en pago: ' + error.message);
                }
            });
        } catch (error: any) {
            console.error('[Pi Payment] Falla crítica:', error);
            alert('Fallo al procesar el pago');
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {children}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi error");
    return context;
};
