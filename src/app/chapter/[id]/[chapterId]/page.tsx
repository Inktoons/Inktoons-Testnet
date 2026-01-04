"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft, MessageSquare, ChevronLeft, ChevronRight,
    Settings, ImageIcon, Loader2, Heart, Download, Crown, CheckCircle2
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { mockNews } from "@/data/mockNews";
import { useUserData } from "@/context/UserDataContext";
import { useMissions } from "@/context/MissionContext";
import { usePi } from "@/components/PiNetworkProvider";
import { useLanguage } from "@/context/LanguageContext";
import { SupabaseService } from "@/lib/supabaseService";
import { Coins, Send, Info } from "lucide-react";

export default function ChapterReaderPage() {
    const params = useParams();
    const router = useRouter();
    const rawId = params?.id;
    const rawChapterId = params?.chapterId;

    // Safety check for params
    const id = Array.isArray(rawId) ? rawId[0] : rawId as string;
    const chapterId = Array.isArray(rawChapterId) ? rawChapterId[0] : rawChapterId as string;

    const { getWebtoon } = useContent();
    const { updateReadingProgress, userData, toggleLikeChapter, isChapterLiked } = useUserData();
    const { trackAction } = useMissions();
    const { createPayment, user, authenticate } = usePi();
    const { t } = useLanguage();
    const isLiked = isChapterLiked(id, chapterId);

    // Tip State
    const [authorData, setAuthorData] = useState<any>(null);
    const [donationAmount, setDonationAmount] = useState("");
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

    const [isDownloading, setIsDownloading] = useState(false);

    const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;

    const webtoon = getWebtoon(id);
    const chapter = webtoon?.chapters?.find(c => c.id === chapterId);

    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingMenu, setLoadingMenu] = useState(false);

    // Save progress when chapter is viewed
    useEffect(() => {
        if (id && chapterId) {
            updateReadingProgress(id, chapterId);
            trackAction('READ_CHAPTER', { seriesId: id, chapterId });
        }
    }, [id, chapterId, updateReadingProgress, trackAction]);

    // Reset scroll and state on chapter change
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoadingNext(false);
        setLoadingMenu(false);
    }, [chapterId]);

    useEffect(() => {
        const fetchAuthor = async () => {
            if (webtoon?.author) {
                const data = await SupabaseService.getUserByUsername(webtoon.author);
                setAuthorData(data);
            }
        };
        fetchAuthor();
    }, [webtoon?.author]);

    const handleDonation = async (amount: string) => {
        const finalAmount = amount || donationAmount;
        if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) {
            alert(t('creator_donate_invalid_amount'));
            return;
        }

        if (!user) {
            authenticate();
            return;
        }

        try {
            setIsSubmittingDonation(true);
            await createPayment(
                Number(finalAmount),
                t('creator_donate_memo').replace('{username}', webtoon?.author || ""),
                {
                    type: "DIRECT_DONATION",
                    recipient_uid: authorData?.id,
                    recipient_username: webtoon?.author || ""
                },
                () => {
                    setDonationSuccess(true);
                    setTimeout(() => {
                        setDonationSuccess(false);
                        setDonationAmount("");
                    }, 5000);
                }
            );
        } catch (error) {
            console.error("Donation error:", error);
        } finally {
            setIsSubmittingDonation(false);
        }
    };

    if (!webtoon || !chapter) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black text-white">
                <Loader2 className="animate-spin mb-4" />
                <h2 className="text-xl font-bold mb-4">Cargando episodio...</h2>
                <button
                    onClick={() => router.push(`/news/${id}`)}
                    className="bg-pi-purple px-6 py-2 rounded-full font-bold"
                >
                    Volver
                </button>
            </div>
        );
    }

    // Navigation logic: Episodes are usually stored Newest First [3, 2, 1]
    // To go from 1 to 2, we need the one BEFORE in the array if sorted newest-first
    // Or just reverse the list to have [1, 2, 3]
    const chaptersList = [...(webtoon.chapters || [])].reverse();
    const currentChapterIndex = chaptersList.findIndex(c => c.id === chapterId);

    const nextChapter = chaptersList[currentChapterIndex + 1]; // Episode N+1
    const prevChapter = chaptersList[currentChapterIndex - 1]; // Episode N-1

    const handleNextChapter = async () => {
        if (!nextChapter || loadingNext || loadingMenu) return;

        console.log("Intentando navegar al siguiente capítulo:", nextChapter.id);
        setLoadingNext(true);

        try {
            await router.push(`/chapter/${id}/${nextChapter.id}`);
            // Fallback
            setTimeout(() => {
                if (!window.location.pathname.includes(nextChapter.id)) {
                    window.location.href = `/chapter/${id}/${nextChapter.id}`;
                }
            }, 4000);
        } catch (err) {
            console.error("Error en navegación Next:", err);
            window.location.href = `/chapter/${id}/${nextChapter.id}`;
        }
    };

    const handleGoToMenu = async () => {
        if (loadingMenu || loadingNext) return;
        console.log("Volviendo al menú del webtoon:", id);
        setLoadingMenu(true);

        try {
            await router.push(`/news/${id}`);
            // Fallback for Sandbox
            setTimeout(() => {
                if (!window.location.pathname.includes(`/news/${id}`)) {
                    window.location.href = `/news/${id}`;
                }
            }, 3000);
        } catch (err) {
            console.error("Error en navegación Menú:", err);
            window.location.href = `/news/${id}`;
        }
    };

    const handleDownload = async () => {
        if (!isVIP || isDownloading) return;

        setIsDownloading(true);
        try {
            const { jsPDF } = await import("jspdf");
            const pdf = new jsPDF({
                orientation: "p",
                unit: "px",
            });

            const images = chapter.images || [];
            if (images.length === 0) {
                alert("Este capítulo no tiene imágenes para descargar.");
                setIsDownloading(false);
                return;
            }

            for (let i = 0; i < images.length; i++) {
                const imgUrl = images[i];

                const img: HTMLImageElement = await new Promise((resolve, reject) => {
                    const tempImg = new Image();
                    tempImg.crossOrigin = "anonymous";
                    tempImg.onload = () => resolve(tempImg);
                    tempImg.onerror = () => reject(new Error(`No se pudo cargar la imagen ${i + 1}`));
                    tempImg.src = imgUrl;
                });

                const imgWidth = img.naturalWidth || 800;
                const imgHeight = img.naturalHeight || 1200;

                // Fixed width for consistency
                const pdfWidth = 800;
                const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

                if (i === 0) {
                    pdf.deletePage(1);
                }

                pdf.addPage([pdfWidth, pdfHeight], "p");

                // Attempt to add image as JPEG for better compression/speed
                try {
                    pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                } catch (e) {
                    // Fallback to PNG if JPEG conversion fails (useful for transparency or certain formats)
                    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                }

                // Progress feedback (could be improved with a secondary state, but let's keep it simple)
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 50));
            }

            const safeTitle = `${webtoon.title}_${chapter.title}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // Generate Blob instead of direct save for better mobile compatibility
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${safeTitle}.pdf`;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            trackAction('DOWNLOAD_CHAPTER', { seriesId: id, chapterId });
            alert("¡Éxito! El capítulo se está descargando como PDF único. Revisa tu carpeta de descargas.");
        } catch (error) {
            console.error("Download error:", error);
            alert("Error al generar el archivo único. Asegúrate de que las imágenes se carguen correctamente.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-[70] bg-black/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGoToMenu}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-[80] pointer-events-auto"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold line-clamp-1">{webtoon.title}</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{chapter.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isVIP && (
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className={`p-2 rounded-full transition-all ${isDownloading ? "text-amber-500 animate-pulse" : "text-amber-400 hover:bg-amber-400/10"}`}
                            title="Descargar para leer offline"
                        >
                            {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            toggleLikeChapter(id, chapterId);
                            if (!isLiked) {
                                trackAction('LIKE_CHAPTER', { seriesId: id, chapterId });
                            }
                        }}
                        className={`p-2 rounded-full transition-colors ${isLiked ? "text-red-500 bg-red-500/10" : "hover:bg-white/10 text-white"}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={() => router.push(`/news/${id}?tab=comments`)}
                        className="p-2 hover:bg-white/10 rounded-full"
                    >
                        <MessageSquare size={20} />
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.main
                    key={chapterId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 relative z-10"
                >
                    <div className="max-w-2xl mx-auto flex flex-col bg-neutral-900 shadow-2xl pb-32">
                        {chapter.images && chapter.images.length > 0 ? (
                            chapter.images.map((image, idx) => (
                                <motion.img
                                    key={`${chapterId}-img-${idx}`}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true, margin: "600px" }}
                                    src={image}
                                    alt={`Page ${idx + 1}`}
                                    className="w-full h-auto block select-none"
                                />
                            ))
                        ) : (
                            <div className="py-40 text-center text-gray-500 px-10">
                                <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-bold">Sin imágenes</p>
                                <p className="text-sm mt-2">Este episodio no tiene contenido aún.</p>
                            </div>
                        )}

                        {/* Tips Section */}
                        {authorData?.tipsEnabled && (
                            <div className="px-6 py-12 border-t border-white/5 bg-gradient-to-b from-black/40 to-black/60">
                                <div className="max-w-md mx-auto bg-gradient-to-br from-pi-gold/10 via-neutral-900 to-amber-900/10 rounded-[40px] p-8 shadow-2xl border border-pi-gold/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pi-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />

                                    <div className="text-center mb-8 relative z-10">
                                        <div className="w-16 h-16 bg-pi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-pi-gold/20 shadow-inner">
                                            <Heart size={32} fill="#f2b200" className="text-pi-gold" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2">{t('creator_tips_title')}</h3>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t('creator_tips_sub')}</p>
                                    </div>

                                    {donationSuccess ? (
                                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center animate-in zoom-in-95 relative z-10 border border-green-500/20">
                                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-1">{t('creator_donate_success')}</h4>
                                            <p className="text-sm text-gray-400 font-bold">¡Tu apoyo hace la diferencia!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 relative z-10">
                                            <div className="grid grid-cols-5 gap-2">
                                                {[0.1, 0.5, 1, 5, 10].map(amount => (
                                                    <button
                                                        key={amount}
                                                        onClick={() => handleDonation(amount.toString())}
                                                        className="py-3 bg-white/5 border border-white/10 hover:border-pi-gold rounded-2xl font-black text-gray-300 hover:text-white shadow-sm active:scale-95 transition-all text-sm backdrop-blur-sm"
                                                    >
                                                        {amount}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="pt-2">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-px bg-white/5 flex-1" />
                                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{t('creator_tips_custom')}</span>
                                                    <div className="h-px bg-white/5 flex-1" />
                                                </div>

                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="number"
                                                            value={donationAmount}
                                                            onChange={(e) => setDonationAmount(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-white outline-none focus:border-pi-gold focus:ring-0 transition-all text-lg"
                                                        />
                                                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-pi-gold" size={24} fill="currentColor" />
                                                    </div>
                                                    <button
                                                        onClick={() => handleDonation("")}
                                                        disabled={isSubmittingDonation || !donationAmount}
                                                        className="px-8 bg-pi-gold text-white rounded-2xl font-black shadow-xl shadow-pi-gold/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        {isSubmittingDonation ? <Loader2 className="animate-spin text-white" /> : <Send size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Info Tip Footer */}
                                            <div className="mt-8 bg-neutral-950/80 rounded-[30px] p-6 text-white text-center shadow-2xl relative overflow-hidden group border border-white/5">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-pi-purple/10 rounded-full blur-3xl -mr-24 -mt-24" />
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                    <Info size={24} className="text-gray-400" />
                                                </div>
                                                <h4 className="text-sm font-black mb-2">{t('creator_tips_info_title')}</h4>
                                                <p className="text-gray-500 font-medium text-[10px] leading-relaxed">
                                                    {t('creator_tips_info_desc')}
                                                    <br />
                                                    <span className="text-pi-gold font-black uppercase inline-block mt-1">{t('creator_tips_no_commission')}</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="px-6 py-12 border-t border-white/5 bg-black/40">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 px-2">Más historias de Inktoons</h3>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
                                {mockNews.filter(n => n.id !== id).slice(0, 6).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => router.push(`/news/${item.id}`)}
                                        className="flex-shrink-0 w-28 text-left group"
                                    >
                                        <div className="aspect-[3/4.5] rounded-xl overflow-hidden mb-3 bg-neutral-800 shadow-lg border border-white/5">
                                            <img
                                                src={item.imageUrl}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={item.title}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 group-hover:text-pi-purple line-clamp-2 transition-colors">{item.title}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Footer Buttons */}
                        <div className="py-24 px-6 text-center bg-black/80 backdrop-blur-sm border-t border-white/5 relative z-20">
                            <div className="w-16 h-1.5 bg-pi-purple mx-auto mb-10 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.6)]" />
                            <h3 className="text-3xl font-black mb-12 tracking-tight">¡Capítulo Finalizado!</h3>

                            <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                {nextChapter && (
                                    <button
                                        onClick={handleNextChapter}
                                        disabled={loadingNext || loadingMenu}
                                        className="bg-pi-purple text-white py-5 px-8 rounded-2xl font-black text-sm shadow-[0_10px_40px_rgba(147,51,234,0.3)] flex items-center justify-between group active:scale-[0.98] transition-all relative overflow-hidden z-[100] pointer-events-auto"
                                    >
                                        {loadingNext && (
                                            <div className="absolute inset-0 bg-pi-purple flex items-center justify-center z-[110]">
                                                <Loader2 className="animate-spin" />
                                            </div>
                                        )}
                                        <span className="flex-1 text-center uppercase tracking-[0.2em]">SIGUIENTE EPISODIO</span>
                                        <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                                <button
                                    onClick={handleGoToMenu}
                                    disabled={loadingMenu || loadingNext}
                                    className="bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black text-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest z-[100] pointer-events-auto relative overflow-hidden"
                                >
                                    {loadingMenu && (
                                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-[110]">
                                            <Loader2 className="animate-spin text-white" />
                                        </div>
                                    )}
                                    <ArrowLeft size={20} />
                                    VOLVER AL INICIO
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
