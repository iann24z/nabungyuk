import { useEffect, useState } from "react";
import { Sparkles, Milestone } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400); // Small delay to enjoy full progress state
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#2D1F1B] flex flex-col items-center justify-center z-50 p-6 select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#FF8A7A]/10 blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FFD0C7]/5 blur-[100px]" />

      <div className="flex flex-col items-center max-w-sm text-center relative z-10">
        {/* Glow Logo Ring */}
        <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center shadow-xl shadow-[#FF8A7A]/20 pulse-glow mb-6 relative group transition-transform duration-500 hover:scale-105">
          <div className="absolute inset-1 rounded-[24px] bg-[#2D1F1B] flex items-center justify-center">
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#2D1F1B] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Display Typography */}
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white mb-2">
          Nabung<span className="text-[#FF8A7A]">Yuk</span>
        </h1>
        <p className="text-sm text-gray-400 font-medium tracking-wide max-w-[200px]">
          Cerdas Menabung, Wujudkan Impian Masa Depan
        </p>

        {/* Dynamic Loading Meter mimicking mobile apps */}
        <div className="w-48 mt-12 mb-4 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-[#FF8A7A]/80 font-mono text-xs font-semibold">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF8A7A] animate-ping" />
          <span>Memuat Aplikasi {progress}%</span>
        </div>
      </div>

      {/* Safety developer signature footer */}
      <div className="absolute bottom-8 flex flex-col items-center text-center gap-1">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Milestone className="w-3.5 h-3.5 text-[#FF8A7A]" />
          <span>NabungYuk Digital Suite</span>
        </div>
        <span className="text-[10px] text-gray-600">Secure AES & MySQL PDO Connection ready</span>
      </div>
    </div>
  );
}
