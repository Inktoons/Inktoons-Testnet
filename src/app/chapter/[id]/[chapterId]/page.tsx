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
    const isLiked = isChapterLiked(id, chapterId);

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
