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

    const handleIncompletePayment = useCallback(async (payment: any) => {
        console.log("[Pi SDK] ⚠️ Pago incompleto encontrado:", payment);
        try {
            await fetch('/api/pi/incomplete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment }),
            });
            console.log("[Pi SDK] Pago incompleto procesado enviando al servidor.");
        } catch (error) {
            console.error("[Pi SDK] Error procesando pago incompleto:", error);
        }
    }, []);

    const authenticate = useCallback(async (isAuto = false) => {
        if (!window.Pi) return;

        try {
            const scopes = ["username", "payments"];
            const auth = await window.Pi.authenticate(scopes, handleIncompletePayment);

            console.log("[Pi SDK] Autenticación exitosa:", auth.user.username);
            setUser(auth.user);
            localStorage.setItem("pi_logged_in", "true");
        } catch (error: any) {
            console.error("[Pi SDK] Error en authenticate:", error);

            if (!isAuto) {
                if (error.message?.includes("cancelled")) {
                    console.log("[Pi SDK] Cancelado por el usuario.");
                } else {
                    alert("Error al conectar con Pi: " + (error.message || "Error desconocido"));
                }
            }
            localStorage.removeItem("pi_logged_in");
        }
    }, [handleIncompletePayment]);

    useEffect(() => {
        let isActive = true;
        let pollInterval: NodeJS.Timeout;

        const initPi = async () => {
            if (!window.Pi) {
                pollInterval = setTimeout(initPi, 500);
                return;
            }

            if (initialized.current) return;

            try {
                console.log("[Pi SDK] Preparando inicialización...");

                // Pequeño respiro para asegurar que el bridge del navegador está listo
                await new Promise(resolve => setTimeout(resolve, 500));

                await window.Pi.init({
                    version: "2.0",
                    sandbox: true,
                    onIncompletePaymentFound: handleIncompletePayment
                });

                console.log("[Pi SDK] Listo.");
                initialized.current = true;

                if (localStorage.getItem("pi_logged_in") === "true") {
                    authenticate(true);
                }

                if (isActive) setLoading(false);
            } catch (error) {
                console.error("[Pi SDK] Error init:", error);
                if (isActive) setLoading(false);
            }
        };

        initPi();

        return () => {
            isActive = false;
            if (pollInterval) clearTimeout(pollInterval);
        };
    }, [authenticate, handleIncompletePayment]);

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi || !user) {
            alert("Debes iniciar sesión primero.");
            return;
        }

        return new Promise<void>((resolve, reject) => {
            try {
                console.log(`[Pi Payment] Iniciando pago de ${amount} Pi. Memo: ${memo}`);

                if (!window.Pi) {
                    reject(new Error("SDK_NOT_FOUND"));
                    return;
                }

                window.Pi.createPayment({
                    amount: Number(amount),
                    memo: memo.slice(0, 100),
                    metadata: metadata
                }, {
                    onReadyForServerApproval: (paymentId: string) => {
                        console.log(`[Pi Payment] Aprobación solicitada para: ${paymentId}`);
                        fetch(`${window.location.origin}/api/pi/approve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paymentId }),
                        })
                            .then(async (response) => {
                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || 'Error del servidor en aprobación');
                                }
                                console.log("[Pi Payment] Aprobado por el servidor.");
                            })
                            .catch((err) => {
                                console.error("[Pi Payment] Fallo en aprobación:", err.message);
                                reject(err);
                            });
                    },
                    onReadyForServerCompletion: (paymentId: string, txid: string) => {
                        console.log(`[Pi Payment] Completación solicitada. TXID: ${txid}`);
                        fetch(`${window.location.origin}/api/pi/complete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paymentId, txid }),
                        })
                            .then(async (response) => {
                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || 'Error del servidor en completación');
                                }
                                console.log("[Pi Payment] ¡PAGO COMPLETADO EXITOSAMENTE!");
                                if (onSuccess) onSuccess();
                                resolve();
                            })
                            .catch((err) => {
                                console.error("[Pi Payment] Fallo en completación:", err.message);
                                reject(err);
                            });
                    },
                    onCancel: (paymentId: string) => {
                        console.log(`[Pi Payment] Pago cancelado por el usuario. ID: ${paymentId}`);
                        reject(new Error("CANCELLED_BY_USER"));
                    },
                    onError: (error: any) => {
                        console.error('[Pi Payment] Error crítico en el SDK de Pi:', error);
                        // Mostrar alerta solo si no es una cancelación manual que el SDK reporte como error
                        if (!error?.message?.includes("cancelled")) {
                            alert(`Error en el proceso de pago:\n${error.message || "Error desconocido"}`);
                        }
                        reject(error);
                    }
                });
            } catch (error: any) {
                console.error('[Pi Payment] Excepción al invocar createPayment:', error);
                reject(error);
            }
        });
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {children}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi debe usarse dentro de PiProvider");
    return context;
};
