"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";

export default function HelpPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const faqs = [
        {
            q: language === 'es' ? '¿Qué es Inktoons?' : 'What is Inktoons?',
            a: language === 'es'
                ? 'Inktoons es una plataforma de webtoons descentralizada construida sobre la red Pi Network. Permite a los creadores publicar su contenido y a los lectores disfrutar de historias únicas apoyando directamente a los artistas.'
                : 'Inktoons is a decentralized webtoons platform built on the Pi Network. It allows creators to publish their content and readers to enjoy unique stories while directly supporting artists.'
        },
        {
            q: language === 'es' ? '¿Cómo puedo ganar Inks?' : 'How can I earn Inks?',
            a: language === 'es'
                ? 'Puedes ganar Inks de forma gratuita completando misiones diarias en tu Monedero (tareas que se reinician cada 24 horas) y participando en la comunidad. También puedes comprarlos directamente usando Pi.'
                : 'You can earn Inks for free by completing daily missions in your Wallet (tasks that reset every 24 hours) and participating in the community. You can also purchase them directly using Pi.'
        },
        {
            q: language === 'es' ? '¿Qué beneficios tiene el Early Access?' : 'What are the benefits of Early Access?',
            a: language === 'es'
                ? 'El pase de Early Access te permite leer capítulos exclusivos antes que nadie, descargar capítulos para verlos offline y obtener una insignia especial junto con un marco personalizado en tu perfil que varía según el pase (7d, 1m, 6m o 1y). Además, apoyas el desarrollo de la plataforma.'
                : 'The Early Access pass allows you to read exclusive chapters before anyone else, download chapters for offline viewing, and get a special badge along with a personalized frame on your profile that varies depending on the pass (7d, 1m, 6m, or 1y). Plus, you support the platform development.'
        },
        {
            q: language === 'es' ? '¿Cómo publico mi propio webtoon?' : 'How do I publish my own webtoon?',
            a: language === 'es'
                ? 'Es muy sencillo. Ve al apartado de "Subir" en el menú inferior, completa la información básica de tu obra y sube las páginas de tu primer capítulo. Tu contenido estará disponible para toda la comunidad al instante.'
                : 'It is very simple. Go to the "Upload" section in the bottom menu, complete the basic information of your work and upload the pages of your first chapter. Your content will be instantly available to the community.'
        },
        {
            q: language === 'es' ? '¿Es seguro usar mi cuenta de Pi?' : 'Is it safe to use my Pi account?',
            a: language === 'es'
                ? 'Sí, Inktoons utiliza la autenticación oficial de Pi Network. Nunca tenemos acceso a tus claves privadas ni a tu frase semilla. Solo utilizamos tu UID y username para gestionar tu perfil y balance.'
                : 'Yes, Inktoons uses the official Pi Network authentication. We never have access to your private keys or seed phrase. We only use your UID and username to manage your profile and balance.'
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('footer_help')}</h1>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 p-2 shadow-sm">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className={`border-b border-slate-50 last:border-0`}>
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full text-left p-6 flex items-center justify-between group"
                            >
                                <span className={`font-bold transition-colors ${openIndex === idx ? 'text-pi-purple' : 'text-slate-700 group-hover:text-pi-purple'}`}>
                                    {faq.q}
                                </span>
                                <ChevronDown
                                    size={18}
                                    className={`text-slate-300 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-pi-purple' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed font-medium">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-pi-purple/5 rounded-[32px] border border-pi-purple/10">
                    <HelpCircle className="text-pi-purple mx-auto mb-4" size={32} />
                    <p className="text-sm font-bold text-slate-600 mb-2">
                        {language === 'es' ? '¿Aún tienes dudas?' : 'Still have questions?'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        {language === 'es' ? 'Contacta con soporte en nuestras redes sociales' : 'Contact support on our social media'}
                    </p>
                </div>
            </main>

            <BottomNavbar />
        </div>
    );
}
