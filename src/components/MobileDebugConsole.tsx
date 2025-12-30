"use client";

import React, { useState, useEffect } from "react";

export default function MobileDebugConsole() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Helper to format args
        const formatArgs = (args: any[]) => args.map(arg => {
            if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
            if (typeof arg === 'object') return JSON.stringify(arg);
            return String(arg);
        }).join(' ');

        // Intercept console.log
        const originalLog = console.log;
        console.log = (...args) => {
            originalLog(...args);
            setLogs(prev => [`[LOG] ${formatArgs(args)}`, ...prev].slice(0, 50));
        };

        // Intercept console.error
        const originalError = console.error;
        console.error = (...args) => {
            originalError(...args);
            setLogs(prev => [`[ERR] ${formatArgs(args)}`, ...prev].slice(0, 50));
        };

        // Intercept global errors
        const errorHandler = (event: ErrorEvent) => {
            setLogs(prev => [`[UNCAUGHT] ${event.message}`, ...prev].slice(0, 50));
        };
        window.addEventListener('error', errorHandler);

        return () => {
            console.log = originalLog;
            console.error = originalError;
            window.removeEventListener('error', errorHandler);
        };
    }, []);

    if (!isVisible) return (
        <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-4 right-4 z-[9999] bg-red-500 text-white p-2 rounded-full shadow-lg text-xs font-bold opacity-50 hover:opacity-100"
        >
            DEBUG
        </button>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 h-1/3 bg-black/90 text-green-400 font-mono text-[10px] z-[9999] overflow-hidden flex flex-col border-t-2 border-green-500">
            <div className="flex justify-between items-center bg-gray-900 p-1 px-2 border-b border-gray-700">
                <span className="font-bold text-white">Console Log ({logs.length})</span>
                <div className="flex gap-2">
                    <button onClick={() => setLogs([])} className="bg-gray-700 text-white px-2 rounded hover:bg-gray-600">Clear</button>
                    <button onClick={() => setIsVisible(false)} className="bg-red-600 text-white px-2 rounded hover:bg-red-500">Hide</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {logs.length === 0 && <span className="text-gray-500 italic">No logs yet...</span>}
                {logs.map((log, i) => (
                    <div key={i} className={`break-words ${log.includes('[ERR]') || log.includes('[UNCAUGHT]') ? 'text-red-400 font-bold border-l-2 border-red-500 pl-1' : 'border-l-2 border-transparent pl-1'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
