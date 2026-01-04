"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Heart, BookOpen, Star, MessageCircle,
    ChevronRight, ExternalLink, Shield, Loader2, Coins
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePi } from "@/components/PiNetworkProvider";
import { SupabaseService } from "@/lib/supabaseService";
import TopNavbar from "@/components/TopNavbar";

export default function CreatorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const { webtoons } = useContent();
    const { t } = useLanguage();
    const { createPayment, user: currentUser } = usePi();

    const [creatorData, setCreatorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDonating, setIsDonating] = useState(false);
    const [donationAmount, setDonationAmount] = useState("");
    const [donationSuccess, setDonationSuccess] = useState(false);

    useEffect(() => {
        const fetchCreator = async () => {
            setLoading(true);
            const data = await SupabaseService.getUserByUsername(username);
            setCreatorData(data);
            setLoading(false);
        };
        if (username) fetchCreator();
    }, [username]);

    const creatorWorks = webtoons.filter(w => w.author === username);

    const handleDonation = async () => {
        if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
            alert("Introduce un monto válido en Pi");
            return;
        }

        try {
            setIsDonating(true);
            // In a real app, this would use createPayment with the creator's uid as recipient
            // For now we use the same createPayment which is configured for the app, 
            // but we add metadata for the server to credit the creator.
            await createPayment(
                Number(donationAmount),
                `Tip for ${username}`,
                {
                    type: "DIRECT_DONATION",
                    recipient_uid: creatorData.id,
                    recipient_username: username
                }
            );

            setDonationSuccess(true);
            setTimeout(() => {
                setDonationSuccess(false);
                setDonationAmount("");
            }, 3000);
        } catch (error) {
            console.error("Donation error:", error);
        } finally {
            setIsDonating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-pi-purple" size={48} />
            </div>
        );
    }

    if (!creatorData) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <Shield size={64} className="text-gray-200 mb-4" />
                <h1 className="text-2xl font-black text-gray-800 mb-2">Creador no encontrado</h1>
                <p className="text-gray-500 mb-6">El perfil que buscas no existe o ha sido eliminado.</p>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-pi-purple text-white rounded-2xl font-black shadow-lg"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <TopNavbar />

            <div className="max-w-4xl mx-auto pt-24 pb-32 px-4">
                {/* Header Header */}
                <header className="mb-8">
                    <button onClick={() => router.back()} className="mb-6 p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-pi-purple transition-all">
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl shadow-pi-purple/5 border border-white">
                        <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-pi-purple to-pi-purple-dark flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-pi-purple/20">
                            {username.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-gray-900">{username}</h1>
                                <div className="px-3 py-1 bg-pi-gold/10 text-pi-gold-dark text-[10px] font-black rounded-full uppercase tracking-wider">CREATOR INKTOONS</div>
                            </div>

                            <p className="text-gray-500 text-sm leading-relaxed max-w-xl mb-4">
                                {creatorData.creatorDescription || "Este creador aún no ha añadido una descripción."}
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-6">
                                <div className="text-center md:text-left">
                                    <div className="text-xl font-black text-gray-900">{creatorWorks.length}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('creator_profile_works')}</div>
                                </div>
                                <div className="w-px h-8 bg-gray-100" />
                                <div className="text-center md:text-left">
                                    <div className="text-xl font-black text-gray-900">
                                        {creatorWorks.reduce((acc, w) => acc + (w.rating || 0), 0) / (creatorWorks.length || 1)}.0
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</div>
                                </div>
                            </div>
                        </div>

                        {creatorData.tipsEnabled && (
                            <div className="w-full md:w-auto">
                                <button
                                    onClick={() => !isDonating && setIsDonating(true)}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pi-purple to-pi-purple-dark text-white rounded-[22px] font-black shadow-xl shadow-pi-purple/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Coins size={20} fill="white" />
                                    <span>{t('creator_profile_donate_btn')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Donation Modal */}
                <AnimatePresence>
                    {isDonating && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDonating(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 pb-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-black text-gray-900">{t('creator_donate_title')}</h2>
                                        <button onClick={() => setIsDonating(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-8">
                                        {t('creator_donate_desc')}
                                    </p>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                                placeholder={t('creator_donate_amount_placeholder')}
                                                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl font-black text-xl text-pi-purple focus:border-pi-purple focus:bg-white transition-all outline-none pl-14"
                                            />
                                            <Coins className="absolute left-6 top-1/2 -translate-y-1/2 text-pi-purple" size={24} fill="currentColor" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 5, 10].map(amount => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setDonationAmount(amount.toString())}
                                                    className="py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-600 hover:border-pi-purple hover:text-pi-purple transition-all"
                                                >
                                                    {amount} Pi
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 pt-4">
                                    <button
                                        onClick={handleDonation}
                                        className="w-full py-5 bg-pi-purple text-white rounded-[24px] font-black text-lg shadow-xl shadow-pi-purple/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                    >
                                        <Heart fill="white" size={20} />
                                        <span>{t('creator_donate_confirm')}</span>
                                    </button>
                                </div>

                                {donationSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center text-white px-8 text-center"
                                    >
                                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                            <Check size={48} />
                                        </div>
                                        <h3 className="text-2xl font-black mb-2">{t('creator_donate_success')}</h3>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Creator Works Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('creator_profile_works')}</h2>
                        <div className="h-px flex-1 bg-gray-100 mx-6" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {creatorWorks.map((work) => (
                            <motion.div
                                key={work.id}
                                whileHover={{ y: -5 }}
                                onClick={() => router.push(`/news/${work.id}`)}
                                className="bg-white p-4 rounded-[32px] border border-white shadow-lg shadow-gray-200/50 flex gap-4 cursor-pointer group"
                            >
                                <div className="w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                                    <img src={work.coverImage} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                <div className="flex-1 py-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {work.genres?.slice(0, 1).map(g => (
                                                <span key={g} className="text-[8px] font-black text-pi-purple uppercase tracking-wider">{g}</span>
                                            ))}
                                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{work.status}</span>
                                        </div>
                                        <h3 className="font-black text-gray-900 group-hover:text-pi-purple transition-colors leading-tight mb-1">{work.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold line-clamp-2 leading-relaxed italic">
                                            "{work.description}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-pi-gold-dark font-black text-[10px]">
                                                <Star size={10} fill="currentColor" />
                                                <span>{work.rating || "0.0"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400 font-black text-[10px]">
                                                <MessageCircle size={10} />
                                                <span>{work.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {creatorWorks.length === 0 && (
                        <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 text-center">
                            <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold tracking-tight">Este creador aún no tiene obras publicadas.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Re-using some components from lucide that were missed in the initial draft
function X({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );
}

function Check({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}
