"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Bell, User, Crown, Wallet, Languages, Globe, RefreshCcw } from "lucide-react";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { useLanguage } from "@/context/LanguageContext";
import NotificationDropdown from "./NotificationDropdown";

export default function TopNavbar() {
    const router = useRouter();
    const { user, authenticate, loading } = usePi();
    const { userData } = useUserData();
    const { language, setLanguage, t } = useLanguage();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLangSelector, setShowLangSelector] = useState(false);

    const unreadCount = (userData.notifications || []).filter(n => !n.read).length;
    const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;

    const username = user?.username || "Pionero";
    const initial = username.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
                <div
                    className="text-2xl font-black tracking-tighter text-pi-purple cursor-pointer flex items-center gap-2"
                    onClick={() => router.push("/")}
                >
                    <span>Inktoons</span>
                </div>
                <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500">
                    <button onClick={() => router.push("/")} className="hover:text-black transition-colors">{t('nav_home')}</button>
                    <button onClick={() => router.push("/explore")} className="hover:text-black transition-colors">{t('nav_explore')}</button>
                    <button className="hover:text-black transition-colors">{t('nav_discover')}</button>
                </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-64 focus-within:border-pi-purple/30 transition-all">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input type="text" placeholder={t('explore_search_placeholder')} className="bg-transparent text-sm outline-none w-full text-black" />
                </div>

                {user ? (
                    <div className="flex items-center gap-1 md:gap-3">
                        {/* Inks / Balance icon replaced by icon.png as per request */}
                        {/* Quick Language Selector */}
                        <div className="relative flex items-center">
                            <button
                                onClick={() => setShowLangSelector(!showLangSelector)}
                                className={`p-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 ${showLangSelector ? 'bg-pi-purple/10 text-pi-purple' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
                                title="Seleccionar Idioma"
                            >
                                <Globe size={22} />
                                <span className="text-[10px] font-black uppercase hidden md:block">
                                    {language === 'es' ? '🇪🇸' : language === 'en' ? '🇺🇸' : language === 'pt' ? '🇧🇷' : '🇫🇷'}
                                </span>
                            </button>

                            {showLangSelector && (
                                <>
                                    <div className="fixed inset-0 z-[90]" onClick={() => setShowLangSelector(false)} />
                                    <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[150px] z-[100] animate-in fade-in zoom-in-95 duration-100">
                                        {[
                                            { id: 'es', flag: '🇪🇸', name: 'Español' },
                                            { id: 'en', flag: '🇺🇸', name: 'English' },
                                            { id: 'pt', flag: '🇧🇷', name: 'Português' },
                                            { id: 'fr', flag: '🇫🇷', name: 'Français' }
                                        ].map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => {
                                                    setLanguage(lang.id as any);
                                                    setShowLangSelector(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm active:scale-[0.98] ${language === lang.id ? 'bg-pi-purple text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                                            >
                                                {/* Flag removed */}
                                                <span className="flex-1 text-left">{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Billetera */}
                        <button
                            onClick={() => router.push('/wallet')}
                            className="p-2 transition-transform active:scale-90 text-gray-500 hover:text-black"
                            title="Billetera"
                        >
                            <Wallet size={22} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-pi-purple/10 text-pi-purple' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4D] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                        </div>

                        <div
                            onClick={() => router.push("/profile")}
                            className="relative cursor-pointer group ml-1"
                        >
                            {/* Profile Frame for Founder or VIP */}
                            {userData.isFounder ? (
                                <div className="absolute -inset-1.5 bg-gradient-to-tr from-pi-purple via-amber-500 to-indigo-600 rounded-full animate-spin-slow opacity-100 blur-[2px] shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                            ) : isVIP && (
                                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 rounded-full animate-spin-slow opacity-80 blur-[1px]" />
                            )}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform active:scale-90 overflow-hidden relative z-10 border-2 ${userData.isFounder ? 'border-amber-400 bg-pi-purple' : 'border-white bg-pi-purple'}`}>
                                {userData.profileImage ? (
                                    <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{initial}</span>
                                )}
                            </div>
                            {(userData.isFounder || isVIP) && (
                                <div className={`absolute -bottom-0.5 -right-1 z-20 ${userData.isFounder ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-amber-500'} text-white rounded-full p-0.5 shadow-md border border-white scale-75`}>
                                    <Crown size={10} fill="currentColor" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            if (loading) return;
                            authenticate().catch(e => {
                                console.error("Login component error:", e);
                                alert("Error al intentar conectar: " + (e.message || JSON.stringify(e)));
                            });
                        }}
                        disabled={loading}
                        className={`btn-tapas text-xs md:text-sm shadow-sm py-2.5 px-6 flex items-center gap-2 transform active:scale-95 transition-all ${loading ? 'opacity-70 cursor-wait bg-gray-400' : 'bg-pi-purple hover:bg-pi-purple-dark text-white'}`}
                    >
                        {loading ? (
                            <>
                                <RefreshCcw size={16} className="animate-spin" />
                                <span>{language === 'es' ? 'Cargando...' : 'Loading...'}</span>
                            </>
                        ) : (
                            t('nav_connect')
                        )}
                    </button>
                )}
            </div>
        </header>
    );
}
