"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, TrendingUp, Zap, ShieldCheck, RefreshCw, AlertCircle, X, Gift, Info, Star, CheckCircle2, Circle, Trophy, BookOpen, Users, Compass, MessageCircle, Target, Crown, Download, Bell, Fingerprint } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useUserData } from "@/context/UserDataContext";
import { AnimatePresence } from "framer-motion";
import { usePi } from "@/components/PiNetworkProvider";
import { getRandomMissions, MissionData } from "@/lib/missions";
import { useMissions } from "@/context/MissionContext";

import { useLanguage } from "@/context/LanguageContext";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";

export default function WalletPage() {
    const router = useRouter();
    const { userData, addBalance, setSubscription } = useUserData();
    const { user, createPayment } = usePi();
    const { t, language } = useLanguage();
    const [loadingPack, setLoadingPack] = useState<number | null>(null);
    const [loadingPass, setLoadingPass] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemCode, setRedeemCode] = useState("");
    const [redeeming, setRedeeming] = useState(false);

    const unreadCount = (userData.notifications || []).filter(n => !n.read).length;
    const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;

    const { missions, regenerateMissions, claimMission, replaceMission } = useMissions();

    // ECONOMY CONFIGURATION
    // 1 Ink = $0.02 USD (fixed)

    // REAL PI VALUE (Fetched from Internal API)
    const [currentPiValue, setCurrentPiValue] = useState<number | null>(null);
    const [priceError, setPriceError] = useState(false);

    useEffect(() => {
        const fetchPiPrice = async () => {
            try {
                // Fetching from internal API proxy to avoid CORS
                const response = await fetch('/api/price');
                const data = await response.json();

                if (data && data.price) {
                    setCurrentPiValue(data.price);
                    setPriceError(false);
                } else {
                    throw new Error("Invalid data format");
                }
            } catch (error) {
                console.error("Error fetching Pi price:", error);
                setPriceError(true);
            }
        };

        fetchPiPrice();
        // Update price every 60 seconds
        const interval = setInterval(fetchPiPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    // Temporizador de seguridad para evitar que el spinner se quede infinito
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loadingPack !== null || loadingPass !== null) {
            console.log("[Wallet] Temporizador de seguridad iniciado (25s)");
            timer = setTimeout(() => {
                if (loadingPack !== null || loadingPass !== null) {
                    console.log("[Wallet] Tiempo de espera agotado. Reseteando estados de carga.");
                    setLoadingPack(null);
                    setLoadingPass(null);
                }
            }, 25000); // 25 segundos de seguridad (más razonable)
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [loadingPack, loadingPass]);

    // Function to calculate Pi Price based on USD target
    const calculatePiPrice = (usdTarget: number) => {
        if (!currentPiValue) return "---";
        return Number((usdTarget / currentPiValue).toFixed(2));
    };

    const earlyAccessPasses = [
        {
            id: 'pass_1m',
            duration: language === 'es' ? '1 Mes' : language === 'en' ? '1 Month' : language === 'pt' ? '1 Mês' : '1 Mois',
            durationTime: 1, // months
            priceUsd: 10.00,
            label: language === 'es' ? 'Pase Mensual' : language === 'en' ? 'Monthly Pass' : language === 'pt' ? 'Passe Mensal' : 'Passe Mensuel',
            features: [language === 'es' ? 'Early Access sin gastar Inks' : 'Early Access without Inks', language === 'es' ? 'Descargas Offline' : 'Offline Downloads'],
            color: 'bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-200',
            iconColor: 'text-indigo-500'
        },
        {
            id: 'pass_6m',
            duration: language === 'es' ? '6 Meses' : language === 'en' ? '6 Months' : language === 'pt' ? '6 Meses' : '6 Mois',
            durationTime: 6, // months
            priceUsd: 45.00,
            label: language === 'es' ? 'Pase Semestral' : language === 'en' ? 'Semi-Annual Pass' : language === 'pt' ? 'Passe Semestral' : 'Passe Semestriel',
            features: [language === 'es' ? 'Early Access sin gastar Inks' : 'Early Access without Inks', language === 'es' ? 'Descargas Offline' : 'Offline Downloads'],
            tag: language === 'es' ? 'AHORRO' : 'SAVINGS',
            color: 'bg-gradient-to-br from-violet-50 to-purple-50 border-purple-200',
            iconColor: 'text-purple-500'
        },
        {
            id: 'pass_1y',
            duration: language === 'es' ? '1 Año' : language === 'en' ? '1 Year' : language === 'pt' ? '1 Ano' : '1 An',
            durationTime: 12, // months
            priceUsd: 80.00,
            label: language === 'es' ? 'Pase Anual' : language === 'en' ? 'Annual Pass' : language === 'pt' ? 'Passe Anual' : 'Passe Annuel',
            features: [language === 'es' ? 'Early Access sin gastar Inks' : 'Early Access without Inks', language === 'es' ? 'Descargas Offline' : 'Offline Downloads', language === 'es' ? 'Insignia Exclusiva' : 'Exclusive Badge'],
            tag: 'PREMIUM',
            color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200',
            iconColor: 'text-amber-500'
        },
    ];

    const packs = [
        {
            id: 1,
            amount: 50,
            priceUsd: 1.00,
            label: language === 'es' ? "Puñado de Tinta" : language === 'en' ? "Handful of Ink" : language === 'pt' ? "Punhado de Tinta" : "Poignée d'Encre",
            bonus: 0,
            color: "bg-blue-50 border-blue-100",
            iconColor: "text-blue-500"
        },
        {
            id: 2,
            amount: 150,
            priceUsd: 3.00,
            label: language === 'es' ? "Frasco de Tinta" : language === 'en' ? "Jar of Ink" : language === 'pt' ? "Frasco de Tinta" : "Pot d'Encre",
            bonus: 10,
            tag: "POPULAR",
            color: "bg-pi-purple/10 border-pi-purple/20",
            iconColor: "text-pi-purple"
        },
        {
            id: 3,
            amount: 500,
            priceUsd: 10.00,
            label: language === 'es' ? "Barril de Tinta" : language === 'en' ? "Barrel of Ink" : language === 'pt' ? "Barril de Tinta" : "Baril d'Encre",
            bonus: 100,
            tag: language === 'es' ? "MEJOR VALOR" : "BEST VALUE",
            color: "bg-amber-50 border-amber-100",
            iconColor: "text-amber-500"
        }
    ];



    const handleClaimMission = (missionId: string) => {
        const result = claimMission(missionId);
        if (result.success) {
            addBalance(result.reward);
            // Feedback visual simple
            alert(`${language === 'es' ? '¡Felicidades! Has reclamado' : language === 'pt' ? 'Parabéns! Você resgatou' : language === 'fr' ? 'Félicitations ! Vous avez réclamé' : 'Congratulations! You claimed'} ${result.reward} Inks.`);
        }
    };

    const handleReloadMission = (missionId: string) => {
        replaceMission(missionId);
    };

    const handlePassPurchase = async (pass: typeof earlyAccessPasses[0]) => {
        if (!user) {
            alert(t('wallet_must_connect'));
            return;
        }

        if (!currentPiValue) {
            alert(t('wallet_waiting_price'));
            return;
        }

        setLoadingPass(pass.id);
        const piCost = (pass as any).pricePi || Number(calculatePiPrice(pass.priceUsd));

        console.log(`[Wallet] Iniciando compra de pase: ${pass.id}`);

        try {
            await createPayment(
                piCost,
                `${t('wallet_subscription')} ${pass.label}`,
                { passId: pass.id, type: 'subscription' }
            );

            // Si llegamos aquí, el pago fue exitoso
            const subType = pass.id.replace('pass_', '') as '1m' | '6m' | '1y';
            setSubscription(subType, pass.durationTime);
            alert(`${t('wallet_subscription_success')} ${pass.duration}.`);
        } catch (error: any) {
            console.log(`[Wallet] La compra del pase terminó o fue cancelada:`, error);
        } finally {
            setLoadingPass(null);
        }
    };

    const handlePurchase = async (pack: typeof packs[0]) => {
        if (!user) {
            alert(t('wallet_must_connect'));
            return;
        }

        if (!currentPiValue) {
            alert(t('wallet_waiting_price'));
            return;
        }

        setLoadingPack(pack.id);
        const piCost = Number(calculatePiPrice(pack.priceUsd));

        console.log(`[Wallet] Iniciando compra de pack: ${pack.id}`);

        try {
            await createPayment(
                piCost,
                `${t('wallet_purchase_of')} ${pack.label} (${pack.amount + pack.bonus} Inks)`,
                { packId: pack.id, credits: pack.amount + pack.bonus }
            );

            // Si llegamos aquí, el pago fue exitoso
            const total = pack.amount + pack.bonus;
            addBalance(total);
            alert(`${t('wallet_purchase_success')} ${total} Inks.`);
        } catch (error: any) {
            console.log(`[Wallet] La compra del pack terminó o fue cancelada:`, error);
        } finally {
            setLoadingPack(null);
        }
    };

    return (
        <div className="min-h-screen bg-white text-foreground">
            <TopNavbar />

            <main className="max-w-md mx-auto px-6 py-8">


                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black text-white rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl"
                >
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="text-white/60 text-sm font-bold uppercase tracking-wider mb-2">{t('wallet_balance_title')}</span>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-5xl font-black">{userData.balance}</span>
                            <span className="text-xl font-bold text-gray-400">Inks</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10 mb-6">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {user ? `${t('wallet_connected_as')} @${user.username}` : t('wallet_guest_mode')}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setShowExplanation(true)}
                                className="bg-white text-black px-6 py-2.5 rounded-full font-black text-xs flex items-center gap-2 hover:bg-pi-purple hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                <Gift size={14} />
                                {t('wallet_get_free')}
                            </button>
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                className="bg-pi-purple text-white px-6 py-2.5 rounded-full font-black text-xs flex items-center gap-2 hover:bg-white hover:text-pi-purple transition-all shadow-lg active:scale-95 border border-pi-purple/20"
                            >
                                <Zap size={14} />
                                {t('wallet_redeem_code')}
                            </button>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pi-purple opacity-30 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500 opacity-20 blur-3xl rounded-full" />
                </motion.div>

                {/* Conversion Info - Live Data */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pi-purple">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">{t('wallet_market_value')}</p>
                            {currentPiValue ? (
                                <motion.div
                                    key={currentPiValue}
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <p className="font-bold text-sm">
                                        1 Test-pi ≈ ${currentPiValue.toFixed(2)} USD
                                    </p>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">{t('wallet_live')}</span>
                                </motion.div>
                            ) : priceError ? (
                                <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} /> {t('wallet_error_price')}
                                </p>
                            ) : (
                                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            )}
                        </div>
                    </div>

                    <div className="h-[1px] bg-gray-200 w-full mb-4" />

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>1 Ink = $0.02 USD ({language === 'es' ? 'Fijo' : language === 'pt' ? 'Fixo' : language === 'fr' ? 'Fixe' : 'Fixed'})</span>
                        {currentPiValue && (
                            <span>1 Test-pi ≈ {(currentPiValue / 0.02).toFixed(1)} Inks</span>
                        )}
                    </div>
                </div>



                {/* Early Access Pass - ENABLED */}
                <h2 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Crown className="text-amber-500 ml-1" size={24} fill="currentColor" />
                    Early Access Pass
                </h2>

                <div className="space-y-4 mb-10">
                    {earlyAccessPasses.map((pass) => {
                        const piCost = calculatePiPrice(pass.priceUsd);
                        return (
                            <motion.button
                                key={pass.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePassPurchase(pass)}
                                disabled={!currentPiValue}
                                className={`w-full relative ${pass.color} border-2 p-5 rounded-2xl flex flex-col items-start text-left transition-all group hover:shadow-lg disabled:opacity-50`}
                            >
                                {pass.tag && (
                                    <span className="absolute -top-3 right-6 bg-black text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                                        {pass.tag}
                                    </span>
                                )}

                                <div className="flex items-center w-full gap-4 mb-3">
                                    <div className={`w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center ${pass.iconColor}`}>
                                        <Crown size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-lg">{pass.label}</h3>
                                        <p className="text-sm font-semibold text-gray-500">
                                            {pass.duration}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            {loadingPass === pass.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pi-purple" />
                                            ) : (
                                                <Fingerprint size={14} className="text-gray-400 group-hover:text-pi-purple transition-colors" />
                                            )}
                                            <span className="text-lg font-black text-gray-900">
                                                {(pass as any).pricePi ? `${(pass as any).pricePi} Test-pi` : (typeof piCost === 'number' ? `${piCost} Test-pi` : <span className="text-gray-400 text-sm">{t('profile_loading')}</span>)}
                                            </span>
                                        </div>
                                        {!(pass as any).pricePi && <span className="text-[10px] font-bold text-gray-400">(${pass.priceUsd.toFixed(2)})</span>}
                                    </div>
                                </div>

                                <div className="w-full h-[1px] bg-black/5 mb-3" />

                                <div className="flex flex-wrap gap-2">
                                    {pass.features.map((feature, i) => (
                                        <span key={i} className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500 bg-white/60 px-2 py-1 rounded-md">
                                            {feature.includes('Descarga') || feature.includes('Download') ? <Download size={10} /> : <CheckCircle2 size={10} />}
                                            {feature}
                                        </span>
                                    ))}
                                </div>


                            </motion.button>
                        );
                    })}
                </div>

                {/* Packages - ENABLED */}
                <h2 className="font-black text-lg mb-4 flex items-center gap-2">
                    <img src="/icon.png" alt="Inks" className="w-[22px] h-[22px] object-contain ml-1" />
                    {t('wallet_recharge')}
                </h2>

                <div className="space-y-4">
                    {packs.map((pack) => {
                        const piCost = calculatePiPrice(pack.priceUsd);
                        return (
                            <motion.button
                                key={pack.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePurchase(pack)}
                                disabled={!currentPiValue}
                                className={`w-full relative ${pack.color} border-2 p-5 rounded-2xl flex items-center justify-between text-left transition-all group hover:shadow-lg disabled:opacity-50`}
                            >
                                {pack.tag && (
                                    <span className="absolute -top-3 left-6 bg-black text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                                        {pack.tag}
                                    </span>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center ${pack.iconColor}`}>
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{pack.label}</h3>
                                        <p className="text-sm font-semibold text-gray-500">
                                            {pack.amount} Inks
                                            {pack.bonus > 0 && <span className="text-green-500 ml-1">+{pack.bonus} Extra</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        {loadingPack === pack.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pi-purple" />
                                        ) : (
                                            <Fingerprint size={14} className="text-gray-400 group-hover:text-pi-purple transition-colors" />
                                        )}
                                        <span className="text-lg font-black text-gray-900">
                                            {typeof piCost === 'number' ? `${piCost} Test-pi` : <span className="text-gray-400 text-sm">{t('profile_loading')}</span>}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">(${pack.priceUsd.toFixed(2)} USD)</span>
                                </div>


                            </motion.button>
                        );
                    })}
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <ShieldCheck className="text-gray-400 flex-shrink-0" size={20} />
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {t('wallet_pi_disclaimer')}
                    </p>
                </div>

                {/* Daily Missions Section */}
                <div id="missions" className="mt-12 mb-8 scroll-mt-24">
                    <h2 className="font-black text-lg flex items-center gap-2">
                        <Target className="text-red-500 ml-1" size={24} />
                        {t('wallet_missions')}
                    </h2>
                </div>

                <div className="space-y-3">
                    {missions.map((mission) => {
                        const isCompleted = mission.progress >= mission.target;
                        const isClaimed = mission.isClaimed;
                        const remaining = Math.max(0, mission.target - mission.progress);
                        const hasBeenSwapped = mission.swapped;

                        return (
                            <div
                                key={mission.id}
                                className={`p-4 rounded-2xl border transition-all ${isClaimed
                                    ? "bg-gray-50 border-gray-100 opacity-60"
                                    : isCompleted
                                        ? "bg-green-100 border-green-200 shadow-sm"
                                        : mission.category === 'read' ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-blue-200"
                                            : mission.category === 'social' ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                                                : mission.category === 'explore' ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                                                    : "bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/50 border border-gray-100 flex items-center justify-center text-pi-purple/50">
                                        <Target size={16} />
                                    </div>


                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-bold text-sm truncate ${isClaimed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                                {t(mission.title as any)}
                                            </h4>
                                            {isCompleted && !isClaimed && (
                                                <span className="bg-green-500 w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs text-gray-500 mb-2 leading-relaxed flex-1">{t(mission.description as any)}</p>
                                            {!isCompleted && !isClaimed && !hasBeenSwapped && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReloadMission(mission.id);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-pi-purple hover:bg-pi-purple/5 rounded-full transition-colors flex-shrink-0"
                                                    title={t('wallet_change_mission')}
                                                >
                                                    <RefreshCw size={13} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        {!isClaimed && (
                                            <div className="w-full h-1.5 bg-gray-100/80 rounded-full overflow-hidden mb-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }}
                                                    className={`h-full ${isCompleted ? "bg-green-500" : "bg-pi-purple"}`}
                                                />
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                            <span className={isClaimed ? "text-gray-400" : "text-pi-purple"}>
                                                +{mission.reward} INKS
                                            </span>
                                            {!isClaimed && (
                                                <span className="text-gray-400 font-bold">
                                                    {(() => {
                                                        if (remaining <= 0) return t('wallet_ready');

                                                        const details = mission.progressDetails || {};

                                                        // Custom formatting for complex missions
                                                        if (mission.id === 'pool_26') {
                                                            const likesLeft = Math.max(0, 5 - (details.likes || 0));
                                                            const ratingsLeft = Math.max(0, 5 - (details.ratings || 0));
                                                            if (likesLeft === 0 && ratingsLeft === 0) return t('wallet_ready');
                                                            const parts = [];
                                                            if (likesLeft > 0) parts.push(`${likesLeft} ${t('wallet_likes')}`);
                                                            if (ratingsLeft > 0) parts.push(`${ratingsLeft} ${t('wallet_ratings')}`);
                                                            return `${t('wallet_missing')}: ${parts.join(` ${t('wallet_and')} `)}`;
                                                        }

                                                        if (mission.id === 'pool_27') {
                                                            const commentsLeft = Math.max(0, 5 - (details.comments || 0));
                                                            const ratingsLeft = Math.max(0, 3 - (details.ratings || 0));
                                                            if (commentsLeft === 0 && ratingsLeft === 0) return t('wallet_ready');
                                                            const parts = [];
                                                            if (commentsLeft > 0) parts.push(`${commentsLeft} ${t('wallet_comments')}`);
                                                            if (ratingsLeft > 0) parts.push(`${ratingsLeft} ${t('wallet_ratings')}`);
                                                            return `${t('wallet_missing')}: ${parts.join(` ${t('wallet_and')} `)}`;
                                                        }

                                                        if (mission.id === 'pool_22') {
                                                            const followsLeft = Math.max(0, 3 - (details.follows || 0));
                                                            const commentsLeft = Math.max(0, 1 - (details.comments || 0));
                                                            if (followsLeft === 0 && commentsLeft === 0) return t('wallet_ready');
                                                            const parts = [];
                                                            if (followsLeft > 0) parts.push(`${followsLeft} ${t('wallet_follows')}`);
                                                            if (commentsLeft > 0) parts.push(`${commentsLeft} ${t('wallet_comment')}`);
                                                            return `${t('wallet_missing')}: ${parts.join(` ${t('wallet_and')} `)}`;
                                                        }

                                                        return `${t('wallet_missing')} ${remaining}`;
                                                    })()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Action/Status Button */}
                                    <button
                                        onClick={() => handleClaimMission(mission.id)}
                                        disabled={!isCompleted || isClaimed}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative overflow-hidden group flex-shrink-0 ${isClaimed
                                            ? "bg-gray-100 text-gray-400 shadow-inner"
                                            : isCompleted
                                                ? "bg-green-500 text-white shadow-lg shadow-green-200 hover:scale-105 active:scale-95"
                                                : "bg-white border border-gray-100 shadow-sm"
                                            }`}
                                    >
                                        {isClaimed ? (
                                            <CheckCircle2 size={24} />
                                        ) : isCompleted ? (
                                            <CheckCircle2 size={28} className="animate-bounce" strokeWidth={3} />
                                        ) : (
                                            <div className="opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                                                <img
                                                    src="/img/missions/ink_token.png"
                                                    alt="Reward"
                                                    className="w-10 h-10 object-contain"
                                                />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Modal */}
                <AnimatePresence>
                    {
                        showExplanation && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowExplanation(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                                />
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[110] shadow-2xl max-h-[90vh] overflow-y-auto"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 bg-pi-purple/10 rounded-2xl flex items-center justify-center text-pi-purple">
                                            <Info size={24} />
                                        </div>
                                        <button onClick={() => setShowExplanation(false)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <h2 className="text-3xl font-black mb-4">{t('wallet_inks_info_title')}</h2>
                                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                        {t('wallet_inks_info_desc')} {language === 'es' ? 'Han sido creados para permitir que los lectores valoren y apoyen directamente a los artistas del ecosistema Pi.' : 'They have been created to allow readers to directly value and support artists in the Pi ecosystem.'}
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 shrink-0">
                                                <Gift size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{t('wallet_inks_info_get_title')}</h4>
                                                <ul className="text-sm text-gray-500 space-y-2">
                                                    <li className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                                        <span>{language === 'es' ? 'Bonus de Bienvenida: 50 Inks gratis al empezar + Tareas diarias que se reinician cada 24 horas.' : 'Welcome Bonus: 50 free Inks to start + Daily tasks that reset every 24 hours.'}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-pi-purple/5 rounded-xl flex items-center justify-center text-pi-purple shrink-0">
                                                <Star size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{t('wallet_inks_info_use_title')}</h4>
                                                <ul className="text-sm text-gray-500 space-y-2">
                                                    <li className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-pi-purple/30 rounded-full" />
                                                        <span>{language === 'es' ? 'Acceso Total: Desbloquea episodios exclusivos, descargas offline y marco personalizado de perfil.' : 'Total Access: Unlock exclusive episodes, offline downloads and personalized profile frame.'}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowExplanation(false)}
                                        className="w-full mt-10 py-5 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
                                    >
                                        {t('wallet_inks_info_btn')}
                                    </button>
                                </motion.div>
                            </>
                        )}
                </AnimatePresence>

                {/* Redeem Code Modal */}
                <AnimatePresence>
                    {showRedeemModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowRedeemModal(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[110] shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 bg-pi-purple/10 rounded-2xl flex items-center justify-center text-pi-purple">
                                        <Zap size={24} />
                                    </div>
                                    <button onClick={() => setShowRedeemModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <h2 className="text-3xl font-black mb-4">{t('wallet_redeem_code')}</h2>
                                <p className="text-gray-500 font-medium mb-6 leading-relaxed">
                                    {language === 'es' ? 'Introduce tu código promocional para activar beneficios exclusivos.' : 'Enter your promo code to activate exclusive benefits.'}
                                </p>

                                <div className="mb-8 relative z-[120]">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={redeemCode}
                                        onChange={(e) => setRedeemCode(e.target.value)}
                                        placeholder={t('wallet_code_placeholder')}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold text-lg focus:border-pi-purple focus:bg-white outline-none transition-all uppercase pointer-events-auto relative z-[130]"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        const code = redeemCode.trim().toUpperCase();
                                        if (code === "FREE7DAY" || code === "FREE7DAYS") {
                                            setRedeeming(true);
                                            setTimeout(() => {
                                                setSubscription('7d', 7 / 30.44);
                                                setRedeeming(false);
                                                setShowRedeemModal(false);
                                                setRedeemCode("");
                                                alert(t('wallet_code_success'));
                                            }, 1000);
                                        } else if (code === "FUNDADORINK") {
                                            setRedeeming(true);
                                            setTimeout(() => {
                                                // 1 Year subscription
                                                setSubscription('1y', 12);
                                                setRedeeming(false);
                                                setShowRedeemModal(false);
                                                setRedeemCode("");
                                                alert(language === 'es' ? '¡Código FUNDADOR activado! Tienes 1 año de Early Access.' : 'FOUNDER code activated! You have 1 year of Early Access.');
                                            }, 1000);
                                        } else {
                                            alert(t('wallet_code_invalid'));
                                        }
                                    }}
                                    disabled={!redeemCode || redeeming}
                                    className="w-full py-5 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {redeeming ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" /> : t('wallet_redeem')}
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </main >

            <BottomNavbar />
        </div >
    );
}
