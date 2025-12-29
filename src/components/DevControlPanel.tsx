"use client";

import React, { useState, useEffect } from "react";
import { useMissions } from "@/context/MissionContext";
import { useUserData } from "@/context/UserDataContext";
import { Settings, RefreshCcw, XCircle, Database, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DevControlPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { regenerateMissions } = useMissions();
    const { cancelSubscription } = useUserData();

    useEffect(() => {
        // Only show in local development
        if (typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[9999]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
            >
                <Settings size={22} className={isOpen ? "rotate-90 transition-transform" : "transition-transform"} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-16 right-0 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={16} className="text-amber-500" fill="currentColor" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dev Tools</h3>
                        </div>

                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    regenerateMissions();
                                    alert("Misiones regeneradas con éxito.");
                                }}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <RefreshCcw size={18} className="text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                                    <span className="text-[11px] font-bold text-slate-700">Reset Misiones</span>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm("¿Estás seguro de limpiar la cuenta? Se perderá la suscripción y el estatus de fundador.")) {
                                        cancelSubscription();
                                        window.location.reload();
                                    }
                                }}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-red-50 rounded-2xl border border-slate-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <XCircle size={18} className="text-red-500" />
                                    <span className="text-[11px] font-bold text-slate-700">Limpiar Cuenta</span>
                                </div>
                            </button>

                            <div className="pt-2 border-t border-slate-50">
                                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter">
                                    Solo visible en entorno Local
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
