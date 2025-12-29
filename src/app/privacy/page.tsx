"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";

export default function PrivacyPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    const points = [
        {
            icon: <Database className="text-indigo-500" size={24} />,
            title: language === 'es' ? 'Recopilación de Datos' : 'Data Collection',
            desc: language === 'es'
                ? 'Solo recopilamos información básica proporcionada por la red Pi: tu nombre de usuario y tu identificador único (UID). No solicitamos correos electrónicos ni datos personales adicionales.'
                : 'We only collect basic information provided by the Pi network: your username and your unique identifier (UID). We do not request emails or additional personal data.'
        },
        {
            icon: <Eye className="text-emerald-500" size={24} />,
            title: language === 'es' ? 'Uso de la Información' : 'Use of Information',
            desc: language === 'es'
                ? 'Tu actividad (favoritos, historial, balance) se utiliza exclusivamente para personalizar tu experiencia dentro de la aplicación y gestionar tus transacciones de Inks.'
                : 'Your activity (favorites, history, balance) is used exclusively to personalize your experience within the app and manage your Inks transactions.'
        },
        {
            icon: <Lock className="text-amber-500" size={24} />,
            title: language === 'es' ? 'Seguridad' : 'Security',
            desc: language === 'es'
                ? 'Toda la comunicación entre tu dispositivo y nuestros servidores está cifrada. Al ser una aplicación dentro del ecosistema Pi, la seguridad de tus fondos está garantizada por la propia red.'
                : 'All communication between your device and our servers is encrypted. As an app within the Pi ecosystem, the security of your funds is guaranteed by the network itself.'
        },
        {
            icon: <ShieldCheck className="text-rose-500" size={24} />,
            title: language === 'es' ? 'Tus Derechos' : 'Your Rights',
            desc: language === 'es'
                ? 'Tienes derecho a conocer qué datos tenemos y a solicitar la limpieza de tu cuenta. Contamos con una herramienta en el perfil para realizar estas acciones de forma transparente.'
                : 'You have the right to know what data we have and to request account clearing. We have a tool in the profile to perform these actions transparently.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <TopNavbar />

            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-pi-purple transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('footer_privacy')}</h1>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm mb-8">
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        {language === 'es'
                            ? 'En Inktoons nos tomamos muy en serio tu privacidad. Como plataforma construida sobre la red Pi, seguimos los principios de descentralización y minimización de datos.'
                            : 'At Inktoons we take your privacy very seriously. As a platform built on the Pi network, we follow the principles of decentralization and data minimization.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {points.map((pt, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                {pt.icon}
                            </div>
                            <h3 className="font-bold text-base text-slate-900 mb-2">{pt.title}</h3>
                            <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
                                {pt.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNavbar />
        </div>
    );
}
