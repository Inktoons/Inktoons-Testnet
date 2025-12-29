"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useUserData } from "@/context/UserDataContext";
import { useRouter } from "next/navigation";

export default function Toast() {
    const { toast, clearToast } = useUserData();
    const router = useRouter();

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                clearToast();
            }, 6000); // 6 seconds
            return () => clearTimeout(timer);
        }
    }, [toast, clearToast]);

    if (!toast) return null;

    const handleToastClick = () => {
        if (toast.link) {
            // handle hash scroll if same page
            if (toast.link.includes("#") && typeof window !== 'undefined') {
                const [path, hash] = toast.link.split("#");
                if (window.location.pathname === path) {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        clearToast();
                        return;
                    }
                }
            }
            router.push(toast.link);
            clearToast();
        }
    };

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -100, x: "-50%" }}
                    animate={{ opacity: 1, y: 20, x: "-50%" }}
                    exit={{ opacity: 0, y: -100, x: "-50%" }}
                    className="fixed top-0 left-1/2 z-[200] w-[95vw] max-w-sm"
                >
                    <div
                        className="bg-white/95 backdrop-blur-2xl border border-pi-purple/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-4 flex gap-4 cursor-pointer active:scale-95 transition-all group"
                        onClick={handleToastClick}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-pi-purple/10 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                            {toast.icon || '🎯'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 text-sm mb-0.5 flex items-center gap-2">
                                {toast.title}
                                {toast.link && <ExternalLink size={10} className="text-pi-purple" />}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearToast();
                            }}
                            className="p-1 hover:bg-slate-100 rounded-lg self-start text-slate-400"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
