"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldAlert, Copyright, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";

export default function GuidelinesPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    const sections = [
        {
            icon: <CheckCircle2 className="text-green-500" size={24} />,
            title: language === 'es' ? 'Respeto a la Comunidad' : 'Community Respect',
            desc: language === 'es'
                ? 'Inktoons es un espacio para todos. No se permite el acoso, el discurso de odio o la discriminación de cualquier tipo en los comentarios o en el contenido publicado.'
                : 'Inktoons is a space for everyone. Harassment, hate speech, or discrimination of any kind is not allowed in comments or published content.'
        },
        {
            icon: <Copyright className="text-blue-500" size={24} />,
            title: language === 'es' ? 'Propiedad Intelectual' : 'Intellectual Property',
            desc: language === 'es'
                ? 'Solo debes subir contenido del cual seas el autor original o para el cual tengas permiso explícito de publicación. El plagio resultará en la eliminación inmediata de la cuenta.'
                : 'You should only upload content for which you are the original author or for which you have explicit permission to publish. Plagiarism will result in immediate account deletion.'
        },
        {
            icon: <EyeOff className="text-pink-500" size={24} />,
            title: language === 'es' ? 'Contenido Sensible' : 'Sensitive Content',
            desc: language === 'es'
                ? 'El contenido que incluya Gore o temas para adultos (+18) debe estar correctamente etiquetado para que nuestro filtro de censura pueda proteger a los usuarios más jóvenes.'
                : 'Content that includes Gore or adult themes (+18) must be correctly tagged so our censorship filter can protect younger users.'
        },
        {
            icon: <ShieldAlert className="text-orange-500" size={24} />,
            title: language === 'es' ? 'Spam y Fraude' : 'Spam and Fraud',
            desc: language === 'es'
                ? 'Está prohibido el uso de bots para inflar visitas o valoraciones, así como la publicación repetitiva de enlaces externos no relacionados con la obra.'
                : 'The use of bots to inflate views or ratings is prohibited, as well as repetitive publishing of external links unrelated to the work.'
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('footer_guidelines')}</h1>
                </div>

                <div className="space-y-6">
                    {sections.map((sec, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    {sec.icon}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">{sec.title}</h3>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                {sec.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-slate-900 rounded-[32px] text-white">
                    <p className="text-sm font-bold mb-2">
                        {language === 'es' ? 'El incumplimiento de estas pautas puede resultar en restricciones.' : 'Failure to comply with these guidelines may result in restrictions.'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                        {language === 'es' ? 'Trabajemos juntos para mantener Inktoons seguro.' : 'Let\'s work together to keep Inktoons safe.'}
                    </p>
                </div>
            </main>

            <BottomNavbar />
        </div>
    );
}
